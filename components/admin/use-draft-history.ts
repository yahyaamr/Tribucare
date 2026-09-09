"use client";

import { useCallback, useMemo, useRef, useState } from "react";

/**
 * Undo and redo for a whole editor draft.
 *
 * The panel had none, and could not borrow the browser's: every field in the
 * editor is React-controlled, and the article rows are `contenteditable` whose
 * DOM is written from state. A native undo rewinds the *element* while React
 * still holds the old value, so the next keystroke re-renders the undone text
 * straight back. History has to live where the value lives, which is here.
 *
 * The unit of history is the whole draft — title, slug, categories, cover,
 * body, every one of them — rather than the article body alone. A writer who
 * has just retitled a post and pressed Cmd+Z means "put the title back", and
 * a history that only watched the body would sit there doing nothing.
 *
 * Two details make it feel like an editor rather than a log:
 *
 *   coalescing  A burst of typing is one entry, not one per keystroke.
 *               Anything within `COALESCE_MS` of the last change folds into
 *               the entry already on the stack, so Cmd+Z takes back a phrase.
 *               An undo resets the window, so the next keystroke after one
 *               always starts a fresh entry rather than merging into the
 *               state it was just rewound to.
 *   a ceiling   `LIMIT` entries. A long editing session is otherwise a
 *               growing pile of whole post objects.
 */

/** Long enough to swallow a typed phrase, short enough that a pause between
 *  two thoughts separates them. */
const COALESCE_MS = 600;

const LIMIT = 100;

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface DraftHistory<T> {
  value: T;
  /** The normal edit path. Coalesces with the previous change when they fall
   *  inside the same burst. */
  set: (next: T | ((current: T) => T)) => void;
  /** An edit that must stand on its own — a pasted document, a save coming
   *  back from the server — regardless of how recently the last one landed. */
  commit: (next: T | ((current: T) => T)) => void;
  /**
   * A change that revises the entry already on the stack instead of adding
   * one. This is what an asynchronous edit needs: an image upload writes a
   * placeholder, then the finished URL, and only the finished state is a
   * place a writer should ever land on. Amending the second write keeps the
   * step *before the whole insert* on top of the stack, so one undo removes
   * the image and its frame together rather than stranding an empty box.
   */
  amend: (next: T | ((current: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useDraftHistory<T>(initial: T): DraftHistory<T> {
  const [history, setHistory] = useState<History<T>>({
    past: [],
    present: initial,
    future: [],
  });

  const lastEdit = useRef(0);

  const push = useCallback((next: T | ((current: T) => T), coalesce: boolean) => {
    // Decided out here, not inside the updater. A state updater must be pure:
    // React invokes it twice under Strict Mode, and a `lastEdit` written on
    // the first pass makes the second pass see a burst that has not happened
    // and merge an entry that should have been its own step. The result React
    // keeps is the second one, so the first edit after a pause would silently
    // leave nothing to undo.
    const now = Date.now();
    const merge = coalesce && now - lastEdit.current < COALESCE_MS;
    lastEdit.current = now;

    setHistory((current) => {
      const value =
        typeof next === "function"
          ? (next as (previous: T) => T)(current.present)
          : next;

      if (Object.is(value, current.present)) return current;

      return {
        // Merging means the entry already on the stack stays as it is: the
        // step being replaced is the *intermediate* state, which is exactly
        // the one nobody wants to land on.
        past: merge ? current.past : [...current.past, current.present].slice(-LIMIT),
        present: value,
        future: [],
      };
    });
  }, []);

  const set = useCallback((next: T | ((current: T) => T)) => push(next, true), [push]);
  const commit = useCallback(
    (next: T | ((current: T) => T)) => push(next, false),
    [push],
  );

  const amend = useCallback((next: T | ((current: T) => T)) => {
    setHistory((current) => {
      const value =
        typeof next === "function"
          ? (next as (previous: T) => T)(current.present)
          : next;
      if (Object.is(value, current.present)) return current;
      // `past` untouched on purpose — that is the whole difference.
      return { past: current.past, present: value, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    // Zeroing the window is what stops the keystroke after an undo from
    // folding into the entry it just returned to.
    lastEdit.current = 0;
    setHistory((current) => {
      if (!current.past.length) return current;
      return {
        past: current.past.slice(0, -1),
        present: current.past[current.past.length - 1],
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    lastEdit.current = 0;
    setHistory((current) => {
      if (!current.future.length) return current;
      return {
        past: [...current.past, current.present],
        present: current.future[0],
        future: current.future.slice(1),
      };
    });
  }, []);

  return useMemo(
    () => ({
      value: history.present,
      set,
      commit,
      amend,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    }),
    [history, set, commit, amend, undo, redo],
  );
}

/**
 * Whether a keystroke is an undo or a redo.
 *
 * Both platform conventions, because the panel is used on both: Cmd+Z and
 * Cmd+Shift+Z on a Mac, Ctrl+Z and Ctrl+Y (as well as Ctrl+Shift+Z) on
 * Windows. `event.code` rather than `event.key` for the letter, so a keyboard
 * layout that puts something else on that key still undoes.
 */
export function historyIntent(event: KeyboardEvent): "undo" | "redo" | null {
  if (!event.metaKey && !event.ctrlKey) return null;
  if (event.altKey) return null;

  const code = event.code;
  if (code === "KeyZ") return event.shiftKey ? "redo" : "undo";
  if (code === "KeyY" && !event.metaKey) return "redo";
  return null;
}

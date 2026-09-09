"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { isBlankInline, sanitizeInline } from "@/lib/cms/rich-text";

/**
 * One editable line of an article.
 *
 * This replaced a `<textarea>`. A textarea can only hold characters, so bold,
 * italic and links had nowhere to live *on screen* even once the block model
 * could store them — the writer would have been typing tags. So the row is a
 * `contenteditable`, and what it holds is the same inline fragment the
 * published page renders: `lib/cms/rich-text.ts` is the whitelist at both
 * ends, and `components/blog/article-body.tsx` sanitizes again on the way out.
 *
 * The one rule that makes a contenteditable behave: **never write to it while
 * the writer is typing into it.** Re-setting `innerHTML` collapses the
 * selection to the start of the node, so a controlled field would move the
 * caret to the top of the line on every keystroke. `emitted` is how that is
 * avoided — the value this field last handed upward is remembered, and a
 * `html` prop equal to it is our own edit coming home and is ignored. Anything
 * else — the initial load, a split, a merge, a paste, a normalise on blur — is
 * a genuinely external change, is sanitized, and is written in.
 */

export type Field = HTMLElement;

const isTextInput = (el: Field): el is HTMLInputElement | HTMLTextAreaElement =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

/* ------------------------------------------------------------- caret ----- */

function textNodesOf(el: HTMLElement) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

/** The caret's position as a count of characters, which is the only measure
 *  the editor's merge and split logic ever needs — it never cares which text
 *  node inside a bolded run the caret happens to be sitting in. */
export function caretOffset(el: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return 0;
  const range = selection.getRangeAt(0);
  const probe = document.createRange();
  probe.selectNodeContents(el);
  probe.setEnd(range.startContainer, range.startOffset);
  return probe.toString().length;
}

function selectionIsCollapsed() {
  const selection = window.getSelection();
  return !selection || selection.isCollapsed;
}

export function caretAtStart(el: Field): boolean {
  if (isTextInput(el)) {
    return el.selectionStart === 0 && el.selectionEnd === 0;
  }
  return selectionIsCollapsed() && caretOffset(el) === 0;
}

export function caretAtEnd(el: Field): boolean {
  if (isTextInput(el)) {
    return (
      el.selectionStart === el.value.length && el.selectionEnd === el.value.length
    );
  }
  return selectionIsCollapsed() && caretOffset(el) === (el.textContent ?? "").length;
}

/** Put the caret at a character offset — the same address `caretOffset` reads,
 *  so "put it back where the two lines joined" is one number. */
export function placeCaret(el: Field, at: "start" | "end" | number) {
  el.focus();

  if (isTextInput(el)) {
    const position =
      at === "start" ? 0 : at === "end" ? el.value.length : Math.min(at, el.value.length);
    el.setSelectionRange(position, position);
    return;
  }

  const nodes = textNodesOf(el);
  const total = nodes.reduce((sum, node) => sum + node.length, 0);
  const target =
    at === "start" ? 0 : at === "end" ? total : Math.min(Math.max(at, 0), total);

  const range = document.createRange();
  if (!nodes.length) {
    range.selectNodeContents(el);
    range.collapse(true);
  } else {
    let remaining = target;
    let placed = false;
    for (const node of nodes) {
      if (remaining <= node.length) {
        range.setStart(node, remaining);
        placed = true;
        break;
      }
      remaining -= node.length;
    }
    if (!placed) {
      const last = nodes[nodes.length - 1];
      range.setStart(last, last.length);
    }
    range.collapse(true);
  }

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function fragmentToHtml(fragment: DocumentFragment) {
  const holder = document.createElement("div");
  holder.append(fragment);
  return holder.innerHTML;
}

/**
 * The line either side of the caret, as two fragments.
 *
 * `cloneContents` closes and reopens whatever run the caret is standing in, so
 * splitting a half-bold sentence gives two fragments that are each valid on
 * their own — which is what Enter in the middle of a bold phrase has to do.
 */
export function splitAtCaret(el: HTMLElement): [string, string] {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return [el.innerHTML, ""];
  const range = selection.getRangeAt(0);

  const before = document.createRange();
  before.selectNodeContents(el);
  before.setEnd(range.startContainer, range.startOffset);

  const after = document.createRange();
  after.selectNodeContents(el);
  after.setStart(range.endContainer, range.endOffset);

  return [
    sanitizeInline(fragmentToHtml(before.cloneContents())),
    sanitizeInline(fragmentToHtml(after.cloneContents())),
  ];
}

/* ------------------------------------------------------------- field ----- */

export function RichField({
  html,
  className,
  placeholder,
  ariaLabel,
  onValue,
  onKeyDown,
  onFocus,
  onPaste,
  fieldRef,
}: {
  html: string;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  onValue: (html: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: () => void;
  onPaste?: (event: React.ClipboardEvent<HTMLDivElement>) => void;
  fieldRef?: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const emitted = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Our own keystroke coming back around. Writing it would move the caret.
    if (html === emitted.current) return;
    const safe = sanitizeInline(html);
    if (el.innerHTML !== safe) el.innerHTML = safe;
  }, [html]);

  return (
    <div className="relative">
      {placeholder && isBlankInline(html) && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 select-none text-ink-faint"
        >
          {placeholder}
        </span>
      )}
      <div
        ref={(el) => {
          ref.current = el;
          fieldRef?.(el);
        }}
        role="textbox"
        aria-multiline="false"
        aria-label={ariaLabel}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => {
          const value = event.currentTarget.innerHTML;
          emitted.current = value;
          onValue(value);
        }}
        onBlur={(event) => {
          // Normalising here rather than on every keystroke: `execCommand`
          // still emits <b> and <i> in some browsers, and rewriting them to
          // <strong>/<em> mid-word would reset the caret.
          const value = sanitizeInline(event.currentTarget.innerHTML);
          if (value !== event.currentTarget.innerHTML) onValue(value);
        }}
        onBeforeInput={(event) => {
          // The browser's own undo stack rewinds this element while React
          // still holds the old value, so the next keystroke renders the
          // undone text straight back. The editor's history owns Cmd+Z — see
          // `use-draft-history.ts` — and the native one is refused here, at
          // the only place it can reach.
          const type = (event.nativeEvent as InputEvent).inputType;
          if (type === "historyUndo" || type === "historyRedo") {
            event.preventDefault();
          }
        }}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onPaste={onPaste}
        className={cn("outline-none focus:outline-none", className)}
      />
    </div>
  );
}

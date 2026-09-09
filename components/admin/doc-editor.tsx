"use client";

import { useAdminApi } from "@/components/admin/base-path";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bold,
  CheckCircle2,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  ListChecks,
  List as ListIcon,
  Loader2,
  Quote as QuoteIcon,
  RemoveFormatting,
  Strikethrough,
  Trash2,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { newBlockId } from "@/lib/cms/format";
import { fitToUploadLimit } from "@/lib/cms/compress";
import { hasStructure, htmlToBlocks } from "@/lib/cms/paste-html";
import {
  inlineToPlain,
  isBlankInline,
  plainToInline,
} from "@/lib/cms/rich-text";
import type { Block, MediaItem } from "@/lib/cms/types";
import {
  RichField,
  caretAtEnd,
  caretAtStart,
  placeCaret,
  splitAtCaret,
  type Field,
} from "./rich-field";
import { MediaPickerDialog } from "./media-picker";

/**
 * The article editor — one continuous writing surface.
 *
 * This replaced a stack of labelled block cards. Writers do not think in
 * blocks; they think in a document, the way they think in an email. So the
 * chrome is gone: no per-block frame, no type badge, no move and duplicate
 * buttons. Enter starts the next paragraph, Backspace at the top of one merges
 * it into the last, `## ` turns a line into a heading and `- ` turns it into a
 * list — and an image pasted from the clipboard lands where the caret is.
 *
 * What did NOT change is the thing underneath. The document is still stored as
 * the same ordered `Block[]`, so `components/blog/article-body.tsx` — the single
 * renderer for the published page — never learns that the editor was replaced.
 * Read time, validation, SEO and every post already written are untouched. This
 * file is a writing surface over that array and nothing more.
 *
 * Rows are `contenteditable`, not textareas, because a block's text is an
 * inline fragment now — bold, italic, underline, strikethrough, code, sup/sub
 * and links, the closed list in `lib/cms/rich-text.ts`. The caret work that
 * makes that behave (splitting a half-bold line, measuring an offset through
 * markup) lives in `rich-field.tsx`; everything here addresses a line by a
 * character offset and never has to know what runs it is made of.
 *
 * What the whitelist still refuses is everything above the inline level: a
 * colour, a size, a font, a class, an alignment, a style attribute. A pasted
 * document therefore keeps its *structure* — headings stay headings, bullets
 * stay bullets, bold stays bold, links keep their targets — and loses its
 * *styling*, arriving in the site's own type scale. That is the whole trade:
 * carrying the source's CSS across is precisely how a pasted article ends up
 * looking like a foreign object on the page.
 */

type TextBlock = Extract<Block, { text: string }>;
type ItemsBlock = Extract<Block, { items: string[] }>;

function isTextBlock(block: Block): block is TextBlock {
  return (
    block.type === "lead" ||
    block.type === "heading" ||
    block.type === "paragraph" ||
    block.type === "quote"
  );
}

const makeParagraph = (text = ""): Block => ({
  id: newBlockId(),
  type: "paragraph",
  text,
});

/**
 * A field address.
 *
 * A block is usually one field, but a list is one per bullet and an image has
 * its alt and caption — so focus is tracked per field rather than per block,
 * which is what lets the caret walk out of the bottom of a list and into the
 * paragraph below it.
 */
type FieldKey = string;
type FocusAt = "start" | "end" | number;

function firstFieldOf(block: Block): FieldKey {
  if (block.type === "list" || block.type === "takeaways") return `${block.id}:0`;
  if (block.type === "image") return `${block.id}:alt`;
  return block.id;
}

function lastFieldOf(block: Block): FieldKey {
  if (block.type === "list" || block.type === "takeaways") {
    return `${block.id}:${Math.max(0, block.items.length - 1)}`;
  }
  if (block.type === "image") return `${block.id}:caption`;
  return block.id;
}

/** The markdown-ish openers, matched only while typing into a plain paragraph
 *  so that loading an existing post can never rewrite it. */
function shortcutFor(value: string): Block | null {
  const heading = /^#{1,3}\s([\s\S]*)$/.exec(value);
  if (heading) {
    return { id: newBlockId(), type: "heading", text: plainToInline(heading[1]) };
  }

  const bullet = /^[-*]\s([\s\S]*)$/.exec(value);
  if (bullet) {
    return { id: newBlockId(), type: "list", items: [plainToInline(bullet[1])] };
  }

  const numbered = /^1[.)]\s([\s\S]*)$/.exec(value);
  if (numbered) {
    return {
      id: newBlockId(),
      type: "list",
      items: [plainToInline(numbered[1])],
      ordered: true,
    };
  }

  const quote = /^>\s([\s\S]*)$/.exec(value);
  if (quote) {
    return {
      id: newBlockId(),
      type: "quote",
      text: plainToInline(quote[1]),
      attribution: "",
    };
  }
  return null;
}

async function uploadImage(file: File, endpoint: string) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(endpoint, {
    method: "POST",
    body: form,
  }).catch(() => null);

  const body = await response?.json().catch(() => null);

  if (!response?.ok) {
    return {
      ok: false as const,
      error: (body?.error as string) ?? "Could not upload the image.",
    };
  }
  return { ok: true as const, url: (body.item as MediaItem).url };
}

/* ------------------------------------------------------------------ rows -- */

/** Each row styles itself as the article renders it, so the surface reads as a
 *  draft of the page rather than a form that describes one. */
const ROW_STYLE: Record<TextBlock["type"], string> = {
  lead: "text-lg leading-relaxed font-medium text-ink",
  heading: "font-display text-2xl font-semibold text-ink",
  paragraph: "text-base leading-relaxed text-ink-soft",
  quote: "font-display text-xl leading-relaxed text-ink italic",
};


const SUBTLE_FIELD =
  "w-full rounded-lg border border-brand-100 bg-white px-2.5 py-1.5 text-xs text-ink-soft transition-colors placeholder:text-ink-faint focus:border-brand-400 focus:outline-none";

/** The mark buttons are the tool buttons with the label read out rather than
 *  drawn — six words across the bar would crowd out the block tools. */
const MARK_BUTTON =
  "inline-flex items-center justify-center rounded-xl px-2 py-1.5 text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800";

const GHOST_BUTTON =
  "inline-flex size-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600";

/**
 * The inline marks, and the one browser API that can apply them.
 *
 * `document.execCommand` is deprecated and is still the only way to toggle a
 * mark across an arbitrary selection inside a `contenteditable` without
 * shipping an editor framework. Its output is not always canonical — some
 * browsers emit `<b>` where others emit `<strong>` — which is exactly why
 * `rich-field.tsx` normalises through `sanitizeInline` on blur rather than
 * trusting what lands in the DOM.
 *
 * There is deliberately no colour, size or font control. Those would be the
 * one thing the whitelist refuses, and the reason it refuses them is that an
 * article carrying its own type scale stops looking like the site.
 */
const MARKS = [
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Underline", icon: Underline, command: "underline" },
  { label: "Strikethrough", icon: Strikethrough, command: "strikeThrough" },
] as const;

const TOOLS = [
  { label: "Heading", icon: Heading2, kind: "heading" },
  { label: "List", icon: ListIcon, kind: "list" },
  { label: "Quote", icon: QuoteIcon, kind: "quote" },
  { label: "Key takeaways", icon: ListChecks, kind: "takeaways" },
  { label: "Image", icon: ImageIcon, kind: "image" },
] as const;

function TextRow({
  block,
  placeholder,
  register,
  onValue,
  onKeyDown,
  onFocus,
}: {
  block: TextBlock;
  placeholder: string;
  register: (key: FieldKey, el: Field | null) => void;
  onValue: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
}) {
  // Stable across renders, so React does not detach and re-attach the field on
  // every keystroke — which would unregister it mid-edit.
  const setRef = useCallback(
    (el: HTMLDivElement | null) => register(block.id, el),
    [block.id, register],
  );

  return (
    <RichField
      html={block.text}
      placeholder={placeholder}
      ariaLabel={placeholder || "Paragraph"}
      onValue={onValue}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      fieldRef={setRef}
      className={cn("rich-text", ROW_STYLE[block.type])}
    />
  );
}

function ItemRow({
  blockId,
  index,
  marker,
  value,
  placeholder,
  register,
  onValue,
  onKeyDown,
  onFocus,
}: {
  blockId: string;
  index: number;
  /** The number for an ordered list, null for the dot. Drawn exactly as
   *  `article-body.tsx` draws it — same width, same colour, same face. */
  marker: number | null;
  value: string;
  placeholder: string;
  register: (key: FieldKey, el: Field | null) => void;
  onValue: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
}) {
  const key = `${blockId}:${index}`;
  const setRef = useCallback(
    (el: HTMLDivElement | null) => register(key, el),
    [key, register],
  );

  return (
    <li className="flex items-start gap-3">
      {marker === null ? (
        <span
          aria-hidden="true"
          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-600"
        />
      ) : (
        <span
          aria-hidden="true"
          className="min-w-5 shrink-0 text-end font-display text-base font-semibold text-brand-600"
        >
          {marker}.
        </span>
      )}
      <RichField
        html={value}
        placeholder={placeholder}
        ariaLabel={placeholder}
        onValue={onValue}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        fieldRef={setRef}
        className="rich-text flex-1 text-base leading-relaxed text-ink-soft"
      />
    </li>
  );
}

/* --------------------------------------------------------------- editor -- */

export function DocEditor({
  blocks,
  dir,
  onChange,
}: {
  blocks: Block[];
  /**
   * Which way the article being written runs — from the record's Content
   * language, never from the panel's.
   *
   * It goes on the block area and not on this component's root, so the
   * toolbar above keeps the panel's own direction. The toolbar is chrome; the
   * blocks are the article. An Arabic article needs its bullets on the right,
   * its quote rule on the right and its caret starting on the right, and none
   * of that is a reason to move the Bold button.
   */
  dir: "ltr" | "rtl";
  /**
   * `history` says how the change should sit in the editor's undo stack.
   *
   * "amend" revises the entry already there rather than adding one, and is
   * what an asynchronous edit needs. An image insert writes a placeholder
   * frame, then the uploaded URL a second or two later; without this, those
   * are two entries and one undo lands on the middle one — an empty frame
   * with no picture in it, which is not a state anybody typed their way into.
   */
  onChange: (blocks: Block[], options?: { history?: "step" | "amend" }) => void;
}) {
  const api = useAdminApi();
  const [active, setActive] = useState<number | null>(null);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const fields = useRef(new Map<FieldKey, Field>());
  const wanted = useRef<{ key: FieldKey; at: FocusAt } | null>(null);
  /** The authoritative copy during an async paste. `blocks` is a prop and is
   *  stale the moment an upload is awaited, so every commit writes here too. */
  const latest = useRef(blocks);

  useEffect(() => {
    latest.current = blocks;
  }, [blocks]);

  const register = useCallback((key: FieldKey, el: Field | null) => {
    if (el) fields.current.set(key, el);
    else fields.current.delete(key);
  }, []);

  const focusField = useCallback((key: FieldKey, at: FocusAt) => {
    const el = fields.current.get(key);
    if (el) placeCaret(el, at);
  }, []);

  // A caret move that follows a structural change has to wait for the row it is
  // moving to to exist.
  useEffect(() => {
    const request = wanted.current;
    if (!request) return;
    wanted.current = null;
    focusField(request.key, request.at);
  }, [blocks, focusField]);

  const commit = useCallback(
    (
      next: Block[],
      focus?: { key: FieldKey; at: FocusAt },
      options?: { history?: "step" | "amend" },
    ) => {
      const value = next.length ? next : [makeParagraph()];
      latest.current = value;
      if (focus) wanted.current = focus;
      setError("");
      onChange(value, options);
    },
    [onChange],
  );

  const replaceAt = useCallback(
    (index: number, block: Block) => {
      const next = [...latest.current];
      next[index] = block;
      commit(next);
    },
    [commit],
  );

  /** Toolbar insertion. An empty paragraph is replaced rather than pushed down,
   *  so reaching for the toolbar mid-draft does not leave a blank line behind. */
  function insertBlock(block: Block) {
    const current = latest.current;
    const next = [...current];
    const at = active;
    const target = at !== null ? current[at] : undefined;

    if (at !== null && target && target.type === "paragraph" && !target.text.trim()) {
      next[at] = block;
    } else {
      next.splice(at !== null ? at + 1 : current.length, 0, block);
    }
    commit(next, { key: firstFieldOf(block), at: "end" });
  }

  function removeBlock(index: number) {
    const current = latest.current;
    const previous = current[index - 1];
    const next = current.filter((_, i) => i !== index);
    commit(next, previous ? { key: lastFieldOf(previous), at: "end" } : undefined);
  }

  /* ---- text row keys ------------------------------------------------- */

  function textKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    block: TextBlock,
    index: number,
  ) {
    const el = event.currentTarget;
    const atStart = caretAtStart(el);
    const atEnd = caretAtEnd(el);
    const current = latest.current;

    if (event.key === "Enter") {
      // Always a new paragraph, never a newline: the renderer emits a block as
      // one line, so a soft break would show here and vanish on the published
      // page. The split is taken as two fragments, so Enter in the middle of a
      // bold phrase leaves both halves bold rather than one of them open.
      event.preventDefault();
      const [before, after] = splitAtCaret(el);
      const created = makeParagraph(after);

      const next = [...current];
      next[index] = { ...block, text: before };
      next.splice(index + 1, 0, created);
      commit(next, { key: created.id, at: "start" });
      return;
    }

    if (event.key === "Backspace" && atStart && index > 0) {
      const previous = current[index - 1];

      if (isTextBlock(previous)) {
        event.preventDefault();
        // The join lands where the words meet, which is a count of characters
        // and not of markup.
        const caret = inlineToPlain(previous.text).length;
        const next = [...current];
        next[index - 1] = { ...previous, text: previous.text + block.text };
        next.splice(index, 1);
        commit(next, { key: previous.id, at: caret });
        return;
      }
      if (isBlankInline(block.text)) {
        event.preventDefault();
        removeBlock(index);
      }
      return;
    }

    if (event.key === "Delete" && atEnd) {
      const following = current[index + 1];
      if (following && isTextBlock(following)) {
        event.preventDefault();
        const caret = inlineToPlain(block.text).length;
        const next = [...current];
        next[index] = { ...block, text: block.text + following.text };
        next.splice(index + 1, 1);
        commit(next, { key: block.id, at: caret });
      }
      return;
    }

    if (event.key === "ArrowUp" && atStart && index > 0) {
      event.preventDefault();
      focusField(lastFieldOf(current[index - 1]), "end");
      return;
    }

    if (event.key === "ArrowDown" && atEnd && index < current.length - 1) {
      event.preventDefault();
      focusField(firstFieldOf(current[index + 1]), "start");
    }
  }

  function textValue(value: string, block: TextBlock, index: number) {
    // The markdown openers only fire on a line that is still plain: a `## `
    // typed inside an already-formatted run is a literal, not a shortcut, and
    // rewriting the block would throw the run away.
    if ((block.type === "paragraph" || block.type === "lead") && !value.includes("<")) {
      const converted = shortcutFor(inlineToPlain(value));
      if (converted) {
        const next = [...latest.current];
        next[index] = converted;
        commit(next, { key: firstFieldOf(converted), at: "end" });
        return;
      }
    }
    replaceAt(index, { ...block, text: value });
  }

  /* ---- list row keys ------------------------------------------------- */

  function itemKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    block: ItemsBlock,
    index: number,
    item: number,
  ) {
    const el = event.currentTarget;
    const atStart = caretAtStart(el);
    const atEnd = caretAtEnd(el);
    const current = latest.current;

    if (event.key === "Enter") {
      event.preventDefault();
      const [before, after] = splitAtCaret(el);
      const items = [...block.items];
      items[item] = before;
      items.splice(item + 1, 0, after);
      const next = [...current];
      next[index] = { ...block, items };
      commit(next, { key: `${block.id}:${item + 1}`, at: "start" });
      return;
    }

    if (event.key === "Backspace" && atStart) {
      // The last empty bullet falls back to a paragraph, which is how a list
      // is finished without reaching for the mouse.
      if (block.items.length === 1) {
        if (!isBlankInline(block.items[0])) return;
        event.preventDefault();
        const paragraph = makeParagraph();
        const next = [...current];
        next[index] = paragraph;
        commit(next, { key: paragraph.id, at: "end" });
        return;
      }

      event.preventDefault();
      const items = [...block.items];

      if (item === 0) {
        // Nothing above to merge into inside this list.
        if (!isBlankInline(items[0])) return;
        items.splice(0, 1);
        const next = [...current];
        next[index] = { ...block, items };
        commit(next, { key: `${block.id}:0`, at: "start" });
        return;
      }

      const caret = inlineToPlain(items[item - 1]).length;
      items[item - 1] += items[item];
      items.splice(item, 1);
      const next = [...current];
      next[index] = { ...block, items };
      commit(next, { key: `${block.id}:${item - 1}`, at: caret });
      return;
    }

    if (event.key === "ArrowUp" && atStart) {
      event.preventDefault();
      if (item > 0) focusField(`${block.id}:${item - 1}`, "end");
      else if (index > 0) focusField(lastFieldOf(current[index - 1]), "end");
      return;
    }

    if (event.key === "ArrowDown" && atEnd) {
      event.preventDefault();
      if (item < block.items.length - 1) focusField(`${block.id}:${item + 1}`, "start");
      else if (index < current.length - 1) {
        focusField(firstFieldOf(current[index + 1]), "start");
      }
    }
  }

  /* ---- paste --------------------------------------------------------- */

  async function insertPastedImage(file: File, at: number) {
    const placeholder: Block = {
      id: newBlockId(),
      type: "image",
      src: "",
      alt: "",
      caption: "",
    };

    // "step", so the insert opens an entry of its own rather than folding
    // into whatever was typed a moment before it — the amends that follow
    // revise this entry, and one undo then takes back the image and nothing
    // else.
    const withPlaceholder = [...latest.current];
    withPlaceholder.splice(at, 0, placeholder);
    commit(withPlaceholder, undefined, { history: "step" });
    setPending((current) => ({ ...current, [placeholder.id]: "Compressing…" }));

    const clearPending = () =>
      setPending((current) => {
        const next = { ...current };
        delete next[placeholder.id];
        return next;
      });

    const fitted = await fitToUploadLimit(file);

    // Amended, not pushed: the placeholder frame that is being removed was
    // never a state worth returning to.
    const drop = (message: string) => {
      clearPending();
      commit(
        latest.current.filter((block) => block.id !== placeholder.id),
        undefined,
        { history: "amend" },
      );
      setError(message);
    };

    if (!fitted.ok) {
      drop(fitted.error);
      return;
    }

    setPending((current) => ({ ...current, [placeholder.id]: "Uploading…" }));
    const uploaded = await uploadImage(fitted.file, api("/media"));

    if (!uploaded.ok) {
      drop(uploaded.error);
      return;
    }

    clearPending();
    // The finished image revises the entry the placeholder made, so one undo
    // takes the whole insert back — frame included.
    commit(
      latest.current.map((block) =>
        block.id === placeholder.id && block.type === "image"
          ? { ...block, src: uploaded.url }
          : block,
      ),
      { key: `${placeholder.id}:alt`, at: "end" },
      { history: "amend" },
    );
  }

  /**
   * A pasted image that arrived as part of a document rather than as a file.
   *
   * The block model stores a URL the site can actually serve, so a `data:` URI
   * from a Word paste and a hotlink to somebody else's CDN both have to become
   * an upload in our own media library before they are worth keeping. A remote
   * image often refuses to be read at all — the browser blocks the fetch unless
   * the other origin allows it — so the block is dropped and counted rather
   * than left pointing at an `<Image src>` the published page cannot render.
   */
  async function adoptImage(block: Block & { type: "image" }) {
    const drop = () => {
      commit(latest.current.filter((b) => b.id !== block.id), undefined, {
        history: "amend",
      });
      return false;
    };

    setPending((current) => ({ ...current, [block.id]: "Fetching…" }));
    const response = await fetch(block.src).catch(() => null);
    const blob = await response?.blob().catch(() => null);

    const clearPending = () =>
      setPending((current) => {
        const next = { ...current };
        delete next[block.id];
        return next;
      });

    if (!blob || !blob.type.startsWith("image/")) {
      clearPending();
      return drop();
    }

    const name = `pasted.${blob.type.split("/")[1]?.split("+")[0] ?? "png"}`;
    const fitted = await fitToUploadLimit(new File([blob], name, { type: blob.type }));
    if (!fitted.ok) {
      clearPending();
      return drop();
    }

    setPending((current) => ({ ...current, [block.id]: "Uploading…" }));
    const uploaded = await uploadImage(fitted.file, api("/media"));
    clearPending();
    if (!uploaded.ok) return drop();

    commit(
      latest.current.map((b) =>
        b.id === block.id && b.type === "image" ? { ...b, src: uploaded.url } : b,
      ),
      undefined,
      { history: "amend" },
    );
    return true;
  }

  async function adoptPastedImages(pasted: Block[], droppedTables: number) {
    const images = pasted.filter(
      (block): block is Block & { type: "image" } => block.type === "image",
    );

    let lost = 0;
    for (const image of images) {
      if (!(await adoptImage(image))) lost += 1;
    }

    const notes: string[] = [];
    if (droppedTables) {
      notes.push(
        `${droppedTables} table${droppedTables > 1 ? "s were" : " was"} left out — the article template has no table.`,
      );
    }
    if (lost) {
      notes.push(
        `${lost} image${lost > 1 ? "s" : ""} could not be copied across — add ${lost > 1 ? "them" : "it"} with the Image button.`,
      );
    }
    if (notes.length) setError(notes.join(" "));
  }

  /**
   * A document, pasted at the caret.
   *
   * The line is split where the caret was: what came before it stays, the
   * pasted blocks follow, and what came after it becomes a paragraph at the
   * end. Pasting into an empty line — which is the usual case — replaces that
   * line instead of pushing a blank one down.
   */
  function insertPastedDocument(
    pasted: Block[],
    droppedTables: number,
    /** The block's own row, or null when the paste landed in one of its side
     *  fields — an attribution, an alt text — which cannot be split. */
    el: HTMLElement | null,
    block: Block,
    at: number,
  ) {
    const next = [...latest.current];
    let trailing = "";

    if (el && isTextBlock(block)) {
      const [before, after] = splitAtCaret(el);
      trailing = after;
      next[at] = { ...block, text: before };
    }

    const body = [...pasted];
    if (!isBlankInline(trailing)) body.push(makeParagraph(trailing));

    const emptied = next[at];
    if (isTextBlock(emptied) && isBlankInline(emptied.text)) next.splice(at, 1, ...body);
    else next.splice(at + 1, 0, ...body);

    const tail = body[body.length - 1];
    commit(next, { key: lastFieldOf(tail), at: "end" });
    void adoptPastedImages(pasted, droppedTables);
  }

  function handlePaste(event: React.ClipboardEvent) {
    const images = Array.from(event.clipboardData.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (images.length) {
      event.preventDefault();
      const at = active !== null ? active + 1 : latest.current.length;
      void images.reduce(
        (queue, file, offset) =>
          queue.then(() => insertPastedImage(file, at + offset)),
        Promise.resolve(),
      );
      return;
    }

    if (active === null) return;
    const block = latest.current[active];
    if (!block) return;

    /**
     * Where the paste actually landed.
     *
     * A block's row is not its only field: a quote has an attribution input, an
     * image has alt and caption, and any of them can hold the caret when a
     * paste arrives. Splitting "the line at the caret" then reads an `<input>`
     * as if it were the block's rich field — which has no child nodes, so the
     * split returns two empty halves and the block's text is replaced with
     * nothing. The split paths below only run when the paste is in the
     * contenteditable row itself.
     *
     * Resolved with `closest`, not taken as-is: a clipboard event is fired at
     * the caret's nearest element, so pasting inside a bolded run targets the
     * `<strong>` rather than the row. Splitting that would keep only the words
     * inside the mark and drop the rest of the line.
     */
    const target = event.target as HTMLElement | null;
    const field =
      target instanceof HTMLElement
        ? target.closest<HTMLElement>('[contenteditable="true"]')
        : null;
    const inRow = field !== null;

    // The clipboard's HTML flavour is where a document's structure lives —
    // which lines were headings, which were bullets, which words were bold.
    // Reading only the plain text is what used to flatten a whole article into
    // one undifferentiated run of paragraphs.
    const html = event.clipboardData.getData("text/html");
    if (html && hasStructure(html)) {
      const { blocks: pasted, dropped } = htmlToBlocks(html);
      if (pasted.length) {
        event.preventDefault();
        insertPastedDocument(pasted, dropped.tables, inRow ? field : null, block, active);
        return;
      }
    }

    // Plain text, split on blank lines. Escaped on the way in: a pasted `<`
    // is a character the reader should see, not a tag.
    const text = event.clipboardData.getData("text/plain");
    if (!text.trim() || !isTextBlock(block) || !inRow) return;

    const paragraphs = text
      .split(/\n\s*\n/)
      .map((part) => part.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean)
      .map(plainToInline);

    if (paragraphs.length < 2) return;

    event.preventDefault();
    const [before, after] = splitAtCaret(field);

    const rest = paragraphs.slice(1).map((part) => makeParagraph(part));
    const tail = rest[rest.length - 1] as TextBlock;
    const caret = inlineToPlain(tail.text).length;
    tail.text += after;

    const next = [...latest.current];
    next[active] = { ...block, text: before + paragraphs[0] };
    next.splice(active + 1, 0, ...rest);
    commit(next, { key: tail.id, at: caret });
  }

  /* ---- marks --------------------------------------------------------- */

  // Tags, not inline styles — `styleWithCSS` off is what keeps a bolded word
  // as `<strong>` rather than a `<span style="font-weight:700">` the
  // whitelist would throw away.
  useEffect(() => {
    document.execCommand("styleWithCSS", false, "false");
  }, []);

  function applyMark(command: string) {
    document.execCommand(command, false);
  }

  function applyLink() {
    const url = window.prompt("Link to… (leave empty to remove the link)", "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") {
      document.execCommand("unlink");
      return;
    }
    document.execCommand("createLink", false, url.trim());
  }

  /* ---- render -------------------------------------------------------- */

  function runTool(kind: (typeof TOOLS)[number]["kind"]) {
    switch (kind) {
      case "image":
        setPickerOpen(true);
        return;
      case "heading":
        insertBlock({ id: newBlockId(), type: "heading", text: "" });
        return;
      case "list":
        insertBlock({ id: newBlockId(), type: "list", items: [""] });
        return;
      case "quote":
        insertBlock({ id: newBlockId(), type: "quote", text: "", attribution: "" });
        return;
      case "takeaways":
        insertBlock({ id: newBlockId(), type: "takeaways", items: [""] });
    }
  }

  return (
    <div className="card-surface">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-brand-100 px-3 py-2">
        {/* Mousedown is swallowed on every one of these: a toolbar button that
            takes focus first would collapse the selection it is meant to act
            on, and the mark would land on nothing. */}
        {MARKS.map((mark) => (
          <button
            key={mark.label}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyMark(mark.command)}
            title={mark.label}
            className={MARK_BUTTON}
          >
            <mark.icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">{mark.label}</span>
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={applyLink}
          title="Link"
          className={MARK_BUTTON}
        >
          <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">Link</span>
        </button>
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyMark("removeFormat")}
          title="Clear formatting"
          className={MARK_BUTTON}
        >
          <RemoveFormatting className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="sr-only">Clear formatting</span>
        </button>

        <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-brand-100" />

        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runTool(tool.kind)}
            title={tool.label}
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800"
          >
            <tool.icon className="size-3.5 shrink-0" aria-hidden="true" />
            {tool.label}
          </button>
        ))}
        <span className="ms-auto hidden pe-1 text-[0.6875rem] text-ink-faint sm:inline">
          ## heading · - list · 1. numbered · &gt; quote
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="mx-5 mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 sm:mx-8"
        >
          {error}
        </p>
      )}

      <div
        dir={dir}
        className="space-y-5 px-5 py-6 sm:px-8 sm:py-8"
        onPaste={handlePaste}
      >
        {blocks.map((block, index) => {
          const focusHere = () => setActive(index);

          if (isTextBlock(block)) {
            if (block.type === "quote") {
              return (
                <div
                  key={block.id}
                  className="group/row relative border-s-4 border-signal-500 ps-5"
                >
                  <TextRow
                    block={block}
                    placeholder="The quote itself, without quotation marks…"
                    register={register}
                    onValue={(value) => textValue(value, block, index)}
                    onKeyDown={(e) => textKeyDown(e, block, index)}
                    onFocus={focusHere}
                  />
                  <input
                    value={block.attribution ?? ""}
                    placeholder="Attribution (defaults to “TribuCare Clinical Editorial”)"
                    onFocus={focusHere}
                    onChange={(e) =>
                      replaceAt(index, { ...block, attribution: e.target.value })
                    }
                    className={cn(SUBTLE_FIELD, "mt-2.5")}
                  />
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    title="Remove quote"
                    className={cn(
                      GHOST_BUTTON,
                      "absolute top-0 end-0 opacity-0 group-hover/row:opacity-100 focus:opacity-100",
                    )}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Remove quote</span>
                  </button>
                </div>
              );
            }

            return (
              <TextRow
                key={block.id}
                block={block}
                placeholder={
                  block.type === "heading"
                    ? "Section heading"
                    : index === 0
                      ? "Write the article…"
                      : ""
                }
                register={register}
                onValue={(value) => textValue(value, block, index)}
                onKeyDown={(e) => textKeyDown(e, block, index)}
                onFocus={focusHere}
              />
            );
          }

          if (block.type === "list" || block.type === "takeaways") {
            const takeaways = block.type === "takeaways";
            const ordered = block.type === "list" && block.ordered === true;
            const ListTag = ordered ? "ol" : "ul";
            return (
              <div
                key={block.id}
                className={cn(
                  "group/row relative",
                  takeaways &&
                    "rounded-3xl border border-brand-200/80 bg-brand-50/60 p-6",
                )}
              >
                {takeaways && (
                  <p className="mb-4 flex items-center gap-2 font-display text-sm font-semibold tracking-wider text-brand-900 uppercase">
                    <CheckCircle2
                      className="size-4 text-signal-500"
                      aria-hidden="true"
                    />
                    Key takeaways
                  </p>
                )}
                {/* `ol` when it is numbered, `ul` otherwise — the same
                    choice `article-body.tsx` makes, so the row the writer sees
                    is the row the reader gets. */}
                <ListTag className="space-y-2.5">
                  {block.items.map((item, i) => (
                    <ItemRow
                      key={`${block.id}:${i}`}
                      blockId={block.id}
                      index={i}
                      marker={ordered ? i + 1 : null}
                      value={item}
                      placeholder={takeaways ? "A single takeaway" : "List item"}
                      register={register}
                      onValue={(value) => {
                        const items = [...block.items];
                        items[i] = value;
                        replaceAt(index, { ...block, items });
                      }}
                      onKeyDown={(e) => itemKeyDown(e, block, index, i)}
                      onFocus={focusHere}
                    />
                  ))}
                </ListTag>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  title={takeaways ? "Remove key takeaways" : "Remove list"}
                  className={cn(
                    GHOST_BUTTON,
                    "absolute top-2 end-2 opacity-0 group-hover/row:opacity-100 focus:opacity-100",
                  )}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Remove this list</span>
                </button>
              </div>
            );
          }

          const status = pending[block.id];
          return (
            <figure key={block.id} className="group/row relative">
              <div className="relative h-[220px] w-full overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 sm:h-[300px]">
                {block.src && (
                  <Image
                    src={block.src}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 640px"
                    className="object-cover"
                  />
                )}
                {status && (
                  <span className="absolute top-3.5 start-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-md backdrop-blur-md">
                    <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                    {status}
                  </span>
                )}
              </div>
              <figcaption className="mt-2.5 space-y-2">
                <input
                  value={block.alt}
                  placeholder="Alt text — describe the image for screen readers and search"
                  onFocus={focusHere}
                  ref={(el) => {
                    register(`${block.id}:alt`, el);
                  }}
                  onChange={(e) => replaceAt(index, { ...block, alt: e.target.value })}
                  className={SUBTLE_FIELD}
                />
                <input
                  value={block.caption ?? ""}
                  placeholder="Caption (optional)"
                  onFocus={focusHere}
                  ref={(el) => {
                    register(`${block.id}:caption`, el);
                  }}
                  onChange={(e) =>
                    replaceAt(index, { ...block, caption: e.target.value })
                  }
                  className={SUBTLE_FIELD}
                />
              </figcaption>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                title="Remove image"
                className={cn(
                  GHOST_BUTTON,
                  "absolute top-3.5 end-3.5 bg-white/90 opacity-0 shadow-md backdrop-blur-md group-hover/row:opacity-100 focus:opacity-100",
                )}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Remove image</span>
              </button>
            </figure>
          );
        })}

        {blocks.length === 0 && (
          <button
            type="button"
            onClick={() => commit([makeParagraph()])}
            className="w-full text-start text-base text-ink-faint"
          >
            Write the article…
          </button>
        )}
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(item) => {
          insertBlock({
            id: newBlockId(),
            type: "image",
            src: item.url,
            alt: "",
            caption: "",
          });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

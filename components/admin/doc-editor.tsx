"use client";

import { useAdminApi } from "@/components/admin/base-path";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Heading2,
  Image as ImageIcon,
  ListChecks,
  List as ListIcon,
  Loader2,
  Quote as QuoteIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { newBlockId } from "@/lib/cms/format";
import { fitToUploadLimit } from "@/lib/cms/compress";
import type { Block, MediaItem } from "@/lib/cms/types";
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
 * The one thing it deliberately cannot do is inline formatting. A block stores a
 * plain string and the renderer emits it as a text node, so bold, italic and
 * links have nowhere to live — offering the buttons would mean either losing the
 * marks on save or teaching the published page to render HTML. Each row is
 * instead styled as the article will render it, so the surface stays WYSIWYG
 * about the thing it can actually promise: structure.
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
  if (heading) return { id: newBlockId(), type: "heading", text: heading[1] };

  const bullet = /^[-*]\s([\s\S]*)$/.exec(value);
  if (bullet) return { id: newBlockId(), type: "list", items: [bullet[1]] };

  const quote = /^>\s([\s\S]*)$/.exec(value);
  if (quote) {
    return { id: newBlockId(), type: "quote", text: quote[1], attribution: "" };
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

const BARE =
  "w-full resize-none border-0 bg-transparent p-0 text-ink placeholder:text-ink-faint focus:ring-0 focus:outline-none";

const SUBTLE_FIELD =
  "w-full rounded-lg border border-brand-100 bg-white px-2.5 py-1.5 text-xs text-ink-soft transition-colors placeholder:text-ink-faint focus:border-brand-400 focus:outline-none";

const GHOST_BUTTON =
  "inline-flex size-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600";

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
  register: (key: FieldKey, el: HTMLTextAreaElement | HTMLInputElement | null) => void;
  onValue: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grows with its content. A fixed height is the difference between a
  // document and a form.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.text]);

  useEffect(() => {
    const key = block.id;
    register(key, ref.current);
    return () => register(key, null);
  }, [block.id, register]);

  return (
    <textarea
      ref={ref}
      dir="auto"
      rows={1}
      value={block.text}
      placeholder={placeholder}
      onChange={(e) => onValue(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      className={cn(BARE, ROW_STYLE[block.type])}
    />
  );
}

function ItemRow({
  blockId,
  index,
  value,
  placeholder,
  register,
  onValue,
  onKeyDown,
  onFocus,
}: {
  blockId: string;
  index: number;
  value: string;
  placeholder: string;
  register: (key: FieldKey, el: HTMLTextAreaElement | HTMLInputElement | null) => void;
  onValue: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // A bullet is a textarea rather than an input so a long one wraps instead of
  // scrolling out of sight — Enter is intercepted, so it still ends the bullet.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    const key = `${blockId}:${index}`;
    register(key, ref.current);
    return () => register(key, null);
  }, [blockId, index, register]);

  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-600"
      />
      <textarea
        ref={ref}
        dir="auto"
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValue(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        className={cn(BARE, "text-base leading-relaxed text-ink-soft")}
      />
    </li>
  );
}

/* --------------------------------------------------------------- editor -- */

export function DocEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const api = useAdminApi();
  const [active, setActive] = useState<number | null>(null);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const fields = useRef(new Map<FieldKey, HTMLTextAreaElement | HTMLInputElement>());
  const wanted = useRef<{ key: FieldKey; at: FocusAt } | null>(null);
  /** The authoritative copy during an async paste. `blocks` is a prop and is
   *  stale the moment an upload is awaited, so every commit writes here too. */
  const latest = useRef(blocks);

  useEffect(() => {
    latest.current = blocks;
  }, [blocks]);

  const register = useCallback(
    (key: FieldKey, el: HTMLTextAreaElement | HTMLInputElement | null) => {
      if (el) fields.current.set(key, el);
      else fields.current.delete(key);
    },
    [],
  );

  const focusField = useCallback((key: FieldKey, at: FocusAt) => {
    const el = fields.current.get(key);
    if (!el) return;
    el.focus();
    const position =
      at === "start" ? 0 : at === "end" ? el.value.length : Math.min(at, el.value.length);
    el.setSelectionRange(position, position);
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
    (next: Block[], focus?: { key: FieldKey; at: FocusAt }) => {
      const value = next.length ? next : [makeParagraph()];
      latest.current = value;
      if (focus) wanted.current = focus;
      setError("");
      onChange(value);
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
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    block: TextBlock,
    index: number,
  ) {
    const el = event.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
    const atEnd =
      el.selectionStart === el.value.length && el.selectionEnd === el.value.length;
    const current = latest.current;

    if (event.key === "Enter") {
      // Always a new paragraph, never a newline: the renderer emits a block's
      // text as a single node, so a soft break would show here and vanish on
      // the published page.
      event.preventDefault();
      const before = el.value.slice(0, el.selectionStart);
      const after = el.value.slice(el.selectionEnd);
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
        const next = [...current];
        next[index - 1] = { ...previous, text: previous.text + block.text };
        next.splice(index, 1);
        commit(next, { key: previous.id, at: previous.text.length });
        return;
      }
      if (!block.text) {
        event.preventDefault();
        removeBlock(index);
      }
      return;
    }

    if (event.key === "Delete" && atEnd) {
      const following = current[index + 1];
      if (following && isTextBlock(following)) {
        event.preventDefault();
        const next = [...current];
        next[index] = { ...block, text: block.text + following.text };
        next.splice(index + 1, 1);
        commit(next, { key: block.id, at: block.text.length });
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
    if (block.type === "paragraph" || block.type === "lead") {
      const converted = shortcutFor(value);
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
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    block: ItemsBlock,
    index: number,
    item: number,
  ) {
    const el = event.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;
    const atEnd =
      el.selectionStart === el.value.length && el.selectionEnd === el.value.length;
    const current = latest.current;

    if (event.key === "Enter") {
      event.preventDefault();
      const before = el.value.slice(0, el.selectionStart ?? 0);
      const after = el.value.slice(el.selectionEnd ?? 0);
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
        if (block.items[0]) return;
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
        if (items[0]) return;
        items.splice(0, 1);
        const next = [...current];
        next[index] = { ...block, items };
        commit(next, { key: `${block.id}:0`, at: "start" });
        return;
      }

      const caret = items[item - 1].length;
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

    const withPlaceholder = [...latest.current];
    withPlaceholder.splice(at, 0, placeholder);
    commit(withPlaceholder);
    setPending((current) => ({ ...current, [placeholder.id]: "Compressing…" }));

    const clearPending = () =>
      setPending((current) => {
        const next = { ...current };
        delete next[placeholder.id];
        return next;
      });

    const fitted = await fitToUploadLimit(file);

    const drop = (message: string) => {
      clearPending();
      commit(latest.current.filter((block) => block.id !== placeholder.id));
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
    commit(
      latest.current.map((block) =>
        block.id === placeholder.id && block.type === "image"
          ? { ...block, src: uploaded.url }
          : block,
      ),
      { key: `${placeholder.id}:alt`, at: "end" },
    );
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

    // Pasting a drafted article should arrive as paragraphs, not as one wall of
    // text that renders as a single paragraph on the published page.
    const text = event.clipboardData.getData("text/plain");
    if (!text.trim() || active === null) return;

    const block = latest.current[active];
    if (!block || !isTextBlock(block)) return;

    const paragraphs = text
      .split(/\n\s*\n/)
      .map((part) => part.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean);

    if (paragraphs.length < 2) return;

    event.preventDefault();
    const el = event.target as HTMLTextAreaElement;
    const before = el.value.slice(0, el.selectionStart);
    const after = el.value.slice(el.selectionEnd);

    const rest = paragraphs.slice(1).map((part) => makeParagraph(part));
    const tail = rest[rest.length - 1] as TextBlock;
    const caret = tail.text.length;
    tail.text += after;

    const next = [...latest.current];
    next[active] = { ...block, text: before + paragraphs[0] };
    next.splice(active + 1, 0, ...rest);
    commit(next, { key: tail.id, at: caret });
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
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            onClick={() => runTool(tool.kind)}
            title={tool.label}
            className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800"
          >
            <tool.icon className="size-3.5 shrink-0" aria-hidden="true" />
            {tool.label}
          </button>
        ))}
        <span className="ms-auto hidden pe-1 text-[0.6875rem] text-ink-faint sm:inline">
          ## heading · - list · &gt; quote
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

      <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-8" onPaste={handlePaste}>
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
                    dir="auto"
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
                <ul className="space-y-2.5">
                  {block.items.map((item, i) => (
                    <ItemRow
                      key={`${block.id}:${i}`}
                      blockId={block.id}
                      index={i}
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
                </ul>
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
                  dir="auto"
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
                  dir="auto"
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

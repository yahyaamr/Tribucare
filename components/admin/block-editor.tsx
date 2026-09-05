"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Heading2,
  Image as ImageIcon,
  ListChecks,
  List as ListIcon,
  Pilcrow,
  Plus,
  Quote,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { newBlockId } from "@/lib/cms/format";
import type { Block, BlockType } from "@/lib/cms/types";
import { MediaPickerDialog } from "./media-picker";

/**
 * The block editor — Gutenberg's model, restricted to what the site renders.
 *
 * The important constraint is that there is no free-form HTML here. Every
 * block below maps one-to-one onto a treatment the article template already
 * has, so an SEO writer cannot accidentally produce a post that looks foreign
 * to the rest of TribuCare. That is the trade for a WordPress-shaped editor on
 * a site with a strict design system, and it is the right way round: the
 * writer picks *what* a passage is, the design system decides how it looks.
 */

const BLOCK_META: Record<
  BlockType,
  { label: string; hint: string; icon: typeof Pilcrow }
> = {
  lead: { label: "Intro", hint: "Opening paragraph, set slightly larger", icon: Type },
  heading: { label: "Heading", hint: "Section heading", icon: Heading2 },
  paragraph: { label: "Paragraph", hint: "Body text", icon: Pilcrow },
  list: { label: "Bulleted list", hint: "Simple bullet points", icon: ListIcon },
  quote: { label: "Pull quote", hint: "Highlighted quote on dark teal", icon: Quote },
  takeaways: {
    label: "Key takeaways",
    hint: "The mint summary panel",
    icon: ListChecks,
  },
  image: { label: "Image", hint: "Full-width figure with a caption", icon: ImageIcon },
};

const ORDER: BlockType[] = [
  "paragraph",
  "heading",
  "list",
  "quote",
  "takeaways",
  "image",
  "lead",
];

function makeBlock(type: BlockType): Block {
  const id = newBlockId();
  switch (type) {
    case "list":
    case "takeaways":
      return { id, type, items: [""] };
    case "image":
      return { id, type, src: "", alt: "", caption: "" };
    case "quote":
      return { id, type, text: "", attribution: "" };
    default:
      return { id, type, text: "" };
  }
}

const FIELD =
  "w-full rounded-xl border border-brand-200/80 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none";

/** Grows with its content so a long paragraph is fully visible while editing —
 *  a fixed-height textarea is the single most common complaint about writing
 *  in a CMS. */
function AutoTextarea({
  value,
  onChange,
  placeholder,
  minRows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  return (
    <textarea
      value={value}
      rows={Math.max(minRows, value.split("\n").length + 1)}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(FIELD, "resize-y leading-relaxed")}
    />
  );
}

/** The repeatable-row control shared by `list` and `takeaways`. */
function ItemsField({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-brand-400"
          />
          <input
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            onKeyDown={(e) => {
              // Enter adds the next bullet, which is what every list editor
              // does and what fingers expect.
              if (e.key === "Enter") {
                e.preventDefault();
                const next = [...items];
                next.splice(i + 1, 0, "");
                onChange(next);
              }
            }}
            className={cn(FIELD, "flex-1")}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, index) => index !== i))}
            disabled={items.length === 1}
            title="Remove this item"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
          >
            <X className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Remove item {i + 1}</span>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Add item
      </button>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: Block;
  onChange: (block: Block) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  switch (block.type) {
    case "lead":
      return (
        <AutoTextarea
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="The opening paragraph readers see first…"
        />
      );

    case "heading":
      return (
        <input
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Section heading"
          className={cn(FIELD, "font-display text-base font-semibold")}
        />
      );

    case "paragraph":
      return (
        <AutoTextarea
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Write the paragraph…"
        />
      );

    case "list":
      return (
        <ItemsField
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          placeholder="List item"
        />
      );

    case "takeaways":
      return (
        <ItemsField
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          placeholder="A single takeaway"
        />
      );

    case "quote":
      return (
        <div className="space-y-2">
          <AutoTextarea
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="The quote itself, without quotation marks…"
            minRows={2}
          />
          <input
            value={block.attribution ?? ""}
            onChange={(e) => onChange({ ...block, attribution: e.target.value })}
            placeholder="Attribution (defaults to “TribuCare Clinical Editorial”)"
            className={FIELD}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          {block.src ? (
            <div className="flex items-start gap-3">
              <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-brand-50">
                <Image
                  src={block.src}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-brand-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...block, src: "" })}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 py-6 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
            >
              <ImageIcon className="size-4" aria-hidden="true" />
              Choose an image
            </button>
          )}

          <input
            value={block.alt}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Alt text — describe the image for screen readers and search"
            className={FIELD}
          />
          <input
            value={block.caption ?? ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Caption (optional)"
            className={FIELD}
          />

          <MediaPickerDialog
            open={pickerOpen}
            selectedUrl={block.src}
            onClose={() => setPickerOpen(false)}
            onPick={(item) => {
              onChange({ ...block, src: item.url });
              setPickerOpen(false);
            }}
          />
        </div>
      );
  }
}

/** The "+" affordance between blocks. Collapsed to a hairline until hovered or
 *  focused, so a long article isn't a ladder of buttons. */
function Inserter({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative py-1">
      {!open ? (
        <div className="group flex items-center gap-2">
          <span className="h-px flex-1 bg-brand-100" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex size-6 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100 hover:bg-brand-50"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Add a block here</span>
          </button>
          <span className="h-px flex-1 bg-brand-100" />
        </div>
      ) : (
        <div className="rounded-2xl border border-brand-200 bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 pb-1.5">
            <span className="text-[0.6875rem] font-semibold tracking-wide text-ink-faint uppercase">
              Add block
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-6 items-center justify-center rounded text-ink-faint hover:text-ink"
            >
              <X className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Cancel</span>
            </button>
          </div>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {ORDER.map((type) => {
              const meta = BLOCK_META[type];
              return (
                <li key={type}>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(type);
                      setOpen(false);
                    }}
                    title={meta.hint}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start text-xs font-medium text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    <meta.icon className="size-3.5 shrink-0" aria-hidden="true" />
                    {meta.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  function replace(index: number, block: Block) {
    const next = [...blocks];
    next[index] = block;
    onChange(next);
  }

  function insert(index: number, type: BlockType) {
    const next = [...blocks];
    next.splice(index, 0, makeBlock(type));
    onChange(next);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {blocks.length === 0 && <Inserter onAdd={(type) => insert(0, type)} />}

      {blocks.map((block, index) => {
        const meta = BLOCK_META[block.type];
        return (
          <div key={block.id}>
            {index === 0 && <Inserter onAdd={(type) => insert(0, type)} />}

            <article className="card-surface group/block p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2 py-1 text-[0.6875rem] font-semibold tracking-wide text-brand-800 uppercase">
                  <meta.icon className="size-3" aria-hidden="true" />
                  {meta.label}
                </span>

                <div className="ms-auto flex items-center gap-0.5 opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover/block:opacity-100 lg:focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                    className="inline-flex size-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-25"
                  >
                    <ChevronUp className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Move {meta.label} up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === blocks.length - 1}
                    title="Move down"
                    className="inline-flex size-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:opacity-25"
                  >
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Move {meta.label} down</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...blocks];
                      next.splice(index + 1, 0, { ...block, id: newBlockId() });
                      onChange(next);
                    }}
                    title="Duplicate"
                    className="inline-flex size-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-brand-50 hover:text-brand-800"
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Duplicate {meta.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(blocks.filter((_, i) => i !== index))
                    }
                    title="Delete"
                    className="inline-flex size-7 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Delete {meta.label}</span>
                  </button>
                </div>
              </div>

              <BlockFields
                block={block}
                onChange={(next) => replace(index, next)}
              />
            </article>

            <Inserter onAdd={(type) => insert(index + 1, type)} />
          </div>
        );
      })}
    </div>
  );
}

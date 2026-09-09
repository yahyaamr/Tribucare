/**
 * Pure CMS helpers — no storage, no Node built-ins.
 *
 * These are split out of `posts.ts` and `media.ts` deliberately. Both of those
 * reach the filesystem through `store.ts`, so a client component importing
 * `formatPostDate` from `posts.ts` would pull `node:fs` into the browser
 * bundle. The editor, the admin table and the article view all need this
 * formatting on the client, so it lives where both sides can import it.
 */

import { inlineToPlain } from "./rich-text";
import type { Block } from "./types";

/**
 * What a slug may contain.
 *
 * Hyphen-separated is the convention every URL on the site already follows,
 * and it is the one a search engine reads as a word break. An underscore is
 * kept when it is deliberately typed — it is URL-safe and unambiguous — and
 * everything else collapses to a hyphen rather than being carried into a URL
 * that would have to be percent-encoded to be linkable.
 */
const SLUG_SEPARATORS = /[^a-z0-9_]+/g;

const stripAccents = (input: string) =>
  input
    .normalize("NFD")
    // So "Réservoir" slugs as "reservoir" rather than losing the letter
    // entirely to the character class above.
    .replace(/[\u0300-\u036f]/g, "");

export function slugify(input: string) {
  return stripAccents(input.toLowerCase().trim())
    .replace(SLUG_SEPARATORS, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * `slugify` minus the tidying that cannot be typed through.
 *
 * The slug field used to run the full transform on every keystroke, which made
 * a hyphen impossible to type: the moment `my-` was entered, the trailing
 * separator was stripped and the caret was left back at `my`. The only way in
 * was to paste.
 *
 * So while typing, a trailing separator is allowed to stand. A leading one is
 * still removed — a slug cannot start with a hyphen, and there is no
 * intermediate state where one is on its way to being valid. The field
 * normalises on blur, and `uniqueSlug` runs the canonical `slugify` on save
 * regardless, so nothing half-typed can reach a URL.
 */
export function slugifyDraft(input: string) {
  return stripAccents(input.toLowerCase())
    .replace(SLUG_SEPARATORS, "-")
    .replace(/^-+/, "")
    .slice(0, 80);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * `2026-08-10` → `August 10, 2026`.
 *
 * Formatted from the ISO parts by hand rather than through `toLocaleDateString`
 * on purpose: the stored value carries no timezone, so letting `Date` interpret
 * it renders the day before on any machine west of UTC — and since this runs on
 * both the server and the client, that would also be a hydration mismatch.
 */
export function formatPostDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return iso;
  return `${name} ${Number(day)}, ${year}`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Every word the reader actually sees, across every block type. Read through
 *  `inlineToPlain`, so a bolded word counts as one word rather than as its
 *  markup — the read time is about reading, not about tags. */
export function countWords(blocks: Block[]) {
  let words = 0;
  for (const block of blocks) {
    const text =
      block.type === "list" || block.type === "takeaways"
        ? block.items.join(" ")
        : block.type === "image"
          ? (block.caption ?? "")
          : block.text;
    words += inlineToPlain(text).trim().split(/\s+/).filter(Boolean).length;
  }
  return words;
}

/** The unit label is passed in rather than baked in, so the same figure reads
 *  "6 min read" in English and "6 دقائق قراءة" in Arabic. */
export function computeReadTime(blocks: Block[], label = "min read") {
  return `${Math.max(1, Math.round(countWords(blocks) / 200))} ${label}`;
}

/** The read time to display: the author's override when they set one, the
 *  computed figure otherwise. An override is authored text and is shown as
 *  written in both languages. */
export function readTimeFor(
  post: { readTime: string; blocks: Block[] },
  label?: string,
) {
  return post.readTime.trim() || computeReadTime(post.blocks, label);
}

let idCounter = 0;
export function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export const newBlockId = () => newId("b");

/* ----------------------------------------------------------------- media -- */

/** Formats the browser can actually render, which is the only reason to accept
 *  an upload. SVG is deliberately absent: it is a script-execution vector and
 *  nothing here needs a vector cover image. */
export const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["image/gif", "gif"],
]);

export const MAX_UPLOAD_BYTES = 300 * 1024;

export const allowedTypeList = [...ALLOWED_IMAGE_TYPES.keys()].join(",");

export function isAllowedType(type: string) {
  return ALLOWED_IMAGE_TYPES.has(type);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

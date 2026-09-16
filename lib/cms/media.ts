import { getStore } from "./store";
import {
  ALLOWED_IMAGE_TYPES as ALLOWED,
  MAX_UPLOAD_BYTES,
  formatBytes as format,
  isAllowedType,
  slugify,
} from "./format";
import { getAllPosts, getAllPostsStrict, savePost } from "./posts";
import { getAllNews, getAllNewsStrict, saveNews } from "./news";
import type { Block } from "./types";
import { getAuthors } from "./authors";
import type { MediaItem } from "./types";

const MEDIA_PREFIX = "cms/media/";

/** The type table, the size cap and the byte formatter live in `./format` so
 *  the upload UI can import them without dragging storage into the browser
 *  bundle. Re-exported here for server callers. */
export {
  MAX_UPLOAD_BYTES,
  isAllowedType,
  allowedTypeList,
  formatBytes,
} from "./format";

/**
 * A safe, unique, readable storage name.
 *
 * The timestamp prefix is what makes it unique; slugifying the stem is what
 * keeps a path traversal or a stray quote out of the pathname, since the
 * uploaded filename is attacker-controlled in the general case.
 */
function storageName(filename: string, contentType: string) {
  const ext = ALLOWED.get(contentType) ?? "bin";
  const stem = slugify(filename.replace(/\.[^.]+$/, "")) || "image";
  return `${Date.now().toString(36)}-${stem}.${ext}`;
}

/* ------------------------------------------------------------ metadata -- */

/**
 * Alt text and descriptions for the library, in one sidecar object.
 *
 * The library is *derived* — `listMedia` reads a blob listing and
 * `listSiteMedia` reads what the content references — so there is no record
 * per image to hang a caption on. One map keyed by `pathname` covers both
 * kinds, which is why a committed site image can be described exactly like an
 * upload.
 *
 * One object rather than a file per image: the library is a few dozen entries,
 * and a listing that had to fetch a sidecar per card would turn one request
 * into fifty.
 */
const META_PATH = "cms/media-meta.json";

export interface MediaMeta {
  alt: string;
  description: string;
}

const EMPTY_META: MediaMeta = { alt: "", description: "" };

/**
 * A note field, cleaned. The taxonomy's `normaliseNote` — see
 * `lib/cms/categories.ts`. Plain text only: alt text is rendered into an
 * attribute and a description as text, so neither is a fragment and nothing
 * downstream sanitizes them.
 */
export function normaliseNote(value: unknown) {
  return typeof value === "string"
    ? value.replace(/[ \t]+/g, " ").trim().slice(0, 300)
    : "";
}

/** `strict` splits rendering from writing, as everywhere else in `lib/cms`: a
 *  listing degrades to no captions, a writer stops. */
async function readMeta(strict = false): Promise<Record<string, MediaMeta>> {
  const raw = strict
    ? await getStore().read(META_PATH)
    : await getStore()
        .read(META_PATH)
        .catch(() => null);

  if (!raw) return {};

  try {
    const value = JSON.parse(raw) as { meta?: unknown };
    if (!value.meta || typeof value.meta !== "object") return {};
    const out: Record<string, MediaMeta> = {};
    for (const [key, entry] of Object.entries(value.meta)) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as { alt?: unknown; description?: unknown };
      out[key] = {
        alt: normaliseNote(record.alt),
        description: normaliseNote(record.description),
      };
    }
    return out;
  } catch {
    return {};
  }
}

async function writeMeta(meta: Record<string, MediaMeta>) {
  await getStore().put(
    META_PATH,
    JSON.stringify({ meta }, null, 2),
    "application/json",
  );
}

/** Drops entries with nothing in them, so deleting an image's notes does not
 *  leave a key behind and the file stays the size of what is actually written. */
function prune(meta: Record<string, MediaMeta>) {
  return Object.fromEntries(
    Object.entries(meta).filter(([, value]) => value.alt || value.description),
  );
}

/**
 * Writes one image's notes.
 *
 * Only the fields sent are changed, so a caller editing the description
 * cannot blank the alt by omitting it — the same rule `setCategoryMeta`
 * follows.
 */
export async function setMediaMeta(
  pathname: string,
  patch: { alt?: unknown; description?: unknown },
): Promise<{ meta: MediaMeta; changed: boolean }> {
  const meta = await readMeta(true);
  const current = meta[pathname] ?? EMPTY_META;

  const next: MediaMeta = {
    alt: patch.alt !== undefined ? normaliseNote(patch.alt) : current.alt,
    description:
      patch.description !== undefined
        ? normaliseNote(patch.description)
        : current.description,
  };

  // `changed` is what lets the caller skip the content sync, which reads every
  // post and every event. The editor writes on blur, and most blurs leave the
  // field exactly as it was found — tabbing through a caption should not walk
  // the whole store.
  const changed =
    next.alt !== current.alt || next.description !== current.description;

  if (changed) await writeMeta(prune({ ...meta, [pathname]: next }));
  return { meta: next, changed };
}

/**
 * The sidecar key for a public URL.
 *
 * The editors know a cover by its URL and never by its pathname, and the two
 * kinds of image spell that URL differently: an upload is absolute on the blob
 * CDN, where the pathname is everything after the origin, while a committed
 * site image is already root-relative and *is* its own pathname. Both resolve
 * here, so the caller never has to know which kind it is holding.
 *
 * Returns `null` for anything that is neither — a data URI, or an image hosted
 * somewhere else — because there is nothing to key notes against.
 */
export function mediaPathnameFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed.split("?")[0];
  try {
    const { pathname } = new URL(trimmed);
    return pathname.replace(/^\//, "") || null;
  } catch {
    return null;
  }
}

/**
 * Pushes an image's notes out to every article and event using it.
 *
 * The library is the single source of truth for what an image *is*, but an
 * article's `image` block stores its own `alt` and `caption` — and it has to,
 * because `article-body.tsx` renders a `Block[]` and nothing else, on the
 * published page and in the editor preview alike. Making the renderer look
 * every image up would mean handing it a lookup table on both paths, and would
 * change what a block means, which is the one contract this CMS keeps.
 *
 * So the notes are *copied*, and copies are kept honest by rewriting them all
 * in the same operation — exactly how `renameCategory` rewrites every post
 * carrying a renamed category rather than leaving the old name behind. A
 * half-synced caption is the same class of bug as a half-renamed tab.
 *
 * Matched on the resolved pathname, not the raw `src`, so an upload referenced
 * by its CDN URL and a site image referenced by its root-relative path both
 * find their record.
 *
 * Returns how many records changed, which the route reports so a caller can
 * see that an edit travelled.
 */
export async function syncMediaMetaToContent(
  pathname: string,
  meta: MediaMeta,
): Promise<{ posts: number; news: number }> {
  const matches = (block: Block) =>
    block.type === "image" && mediaPathnameFromUrl(block.src) === pathname;

  /** The block with the library's notes on it, or the same object when it
   *  already agrees — identity is what lets the caller skip a needless save. */
  const applied = (block: Block): Block => {
    if (!matches(block)) return block;
    const image = block as Extract<Block, { type: "image" }>;
    if (image.alt === meta.alt && (image.caption ?? "") === meta.description) {
      return block;
    }
    return { ...image, alt: meta.alt, caption: meta.description };
  };

  const [posts, news] = await Promise.all([
    getAllPostsStrict(),
    getAllNewsStrict(),
  ]);

  let changedPosts = 0;
  for (const post of posts) {
    const blocks = post.blocks.map(applied);
    // Reference equality across the whole array: nothing to write means no
    // write, so editing one image does not touch every record in the store.
    if (blocks.every((block, i) => block === post.blocks[i])) continue;
    await savePost({ ...post, blocks });
    changedPosts += 1;
  }

  let changedNews = 0;
  for (const item of news) {
    const blocks = item.blocks.map(applied);
    if (blocks.every((block, i) => block === item.blocks[i])) continue;
    await saveNews({ ...item, blocks });
    changedNews += 1;
  }

  return { posts: changedPosts, news: changedNews };
}

/** One image's notes, by its public URL. */
export async function getMediaMetaByUrl(url: string): Promise<MediaMeta> {
  const pathname = mediaPathnameFromUrl(url);
  if (!pathname) return EMPTY_META;
  return (await readMeta())[pathname] ?? EMPTY_META;
}

/* ---------------------------------------------------------------- lists -- */

export async function listMedia(): Promise<MediaItem[]> {
  let objects;
  try {
    objects = await getStore().list(MEDIA_PREFIX);
  } catch {
    return [];
  }

  // The sidecar is read once for the whole listing, not per card.
  const meta = await readMeta();

  return objects
    .map((o) => ({
      pathname: o.pathname,
      url: o.url,
      filename: o.pathname.slice(MEDIA_PREFIX.length),
      size: o.size,
      uploadedAt: o.uploadedAt,
      source: "upload" as const,
      ...(meta[o.pathname] ?? EMPTY_META),
    }))
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

/**
 * The artwork the site already ships, listed alongside the uploads.
 *
 * Every blog cover written before the panel existed lives in `public/` and was
 * committed with the code, so the media library — which lists blob storage —
 * could not see any of it. That left the picker unable to offer the six images
 * the current articles are actually illustrated with.
 *
 * These are found by reading what posts, news and authors reference rather than
 * by listing a directory, so the library shows artwork in use rather than every
 * file that happens to sit in `public/`. They are returned as ordinary
 * `MediaItem`s so the picker needs no special case to offer them, and marked
 * `source: "site"` so the manager knows not to offer a delete it cannot honour.
 */
export async function listSiteMedia(): Promise<MediaItem[]> {
  const [posts, news, authors] = await Promise.all([
    getAllPosts(),
    getAllNews(),
    getAuthors(),
  ]);

  const urls = new Set<string>();

  const add = (value: string | undefined) => {
    // Site-relative only: an absolute URL is a blob upload, already listed.
    if (value?.startsWith("/") && IMAGE_EXTENSION.test(value)) urls.add(value);
  };

  for (const post of posts) {
    add(post.image);
    for (const block of post.blocks) if (block.type === "image") add(block.src);
  }
  for (const item of news) {
    add(item.image);
    for (const block of item.blocks) if (block.type === "image") add(block.src);
  }
  for (const author of authors) add(author.avatar);

  const meta = await readMeta();
  return Promise.all([...urls].sort().map((url) => toSiteItem(url, meta)));
}

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif|gif)$/i;

async function toSiteItem(
  url: string,
  meta: Record<string, MediaMeta>,
): Promise<MediaItem> {
  return {
    pathname: url,
    url,
    filename: url.split("/").pop() ?? url,
    size: await fileSize(url),
    // Committed with the code, so there is no upload moment to report. The
    // manager shows the source label in place of a date for these.
    uploadedAt: "",
    source: "site",
    // A site image is described exactly like an upload — the sidecar is keyed
    // by pathname, and for these the pathname *is* the URL.
    ...(meta[url] ?? EMPTY_META),
  };
}

/** Best-effort: the byte count matters here because these predate the upload
 *  cap and are several times over it, which is worth seeing before one is
 *  reused. A deployment that cannot stat `public/` reports 0 and shows a dash. */
async function fileSize(url: string) {
  try {
    const { stat } = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    return (await stat(file)).size;
  } catch {
    return 0;
  }
}

/**
 * Stores a file, with its notes if they were given at the same time.
 *
 * `meta` is optional: a paste into the article body uploads an image with
 * nothing to say about it yet, while the library's own upload form can send
 * both fields straight away rather than making someone reopen the card.
 */
/* ----------------------------------------------------------------- webp -- */

/**
 * Everything the library stores is WebP.
 *
 * Done on the **server**, not in the browser, and that is the whole point:
 * there are four ways an image reaches storage — the library page, the library
 * dialog inside an editor, a paste into the article body, and a direct call to
 * the API — and converting at the last of those covers all four at once. A
 * browser-side conversion would have to be added to each, and the one that was
 * forgotten would quietly keep publishing PNGs.
 *
 * `sharp` does the encoding. It is already installed as one of Next's own
 * dependencies (it is what `next/image` optimises with), but it is named in
 * `package.json` because this file imports it directly — a transitive
 * dependency that a future Next release moved or dropped would take uploads
 * with it, silently.
 *
 * Imported dynamically, the way `store.ts` imports the Blob SDK, so a native
 * binary never enters a bundle that merely touches this module's graph.
 */
const WEBP_QUALITY = 82;

/** Tried in order if the first encode somehow lands over the cap — a
 *  well-optimised JPEG can convert to a *larger* WebP, and storing something
 *  over the limit would be a worse outcome than a slightly softer image. */
const WEBP_FALLBACK_QUALITY = [70, 58, 46];

async function toWebp(
  file: File,
): Promise<{ blob: Blob; contentType: string } | { error: string }> {
  // Already WebP: stored byte for byte. Re-encoding would spend a generation
  // of quality to save nothing, and the writer may well have optimised it.
  if (file.type === "image/webp") {
    return { blob: file, contentType: file.type };
  }

  const { default: sharp } = await import("sharp");

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const { pages } = await sharp(input).metadata();
    // An animated GIF has to be read as every frame, or WebP gets the first
    // one and the animation is thrown away. `rotate()` is skipped for those:
    // it is an EXIF auto-orient, which an animation does not carry, and asking
    // for it frame-by-frame is how a converted GIF comes out scrambled.
    const animated = (pages ?? 1) > 1;

    const encode = (quality: number) =>
      (animated
        ? sharp(input, { animated: true })
        : sharp(input).rotate()
      )
        .webp({ quality })
        .toBuffer();

    let out = await encode(WEBP_QUALITY);
    for (const quality of WEBP_FALLBACK_QUALITY) {
      if (out.length <= MAX_UPLOAD_BYTES) break;
      out = await encode(quality);
    }

    return {
      blob: new Blob([new Uint8Array(out)], { type: "image/webp" }),
      contentType: "image/webp",
    };
  } catch {
    // Every type the panel accepts is one sharp reads, so a failure here means
    // the bytes are not the image the browser said they were.
    return {
      error:
        "That image could not be read, so it could not be converted. Re-save it and try again.",
    };
  }
}

export async function uploadMedia(
  file: File,
  meta?: { alt?: unknown; description?: unknown },
): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string }> {
  if (!isAllowedType(file.type)) {
    return {
      ok: false,
      error: `${file.type || "That file type"} is not supported. Use JPG, PNG, WebP, AVIF or GIF.`,
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `That image is ${format(file.size)}. The limit is ${format(MAX_UPLOAD_BYTES)} — compress it first.`,
    };
  }

  // Converted before the storage name is worked out, so the name gets the
  // extension the bytes actually have.
  const converted = await toWebp(file);
  if ("error" in converted) return { ok: false, error: converted.error };

  const pathname = `${MEDIA_PREFIX}${storageName(file.name, converted.contentType)}`;
  const stored = await getStore().put(
    pathname,
    converted.blob,
    converted.contentType,
  );

  const alt = normaliseNote(meta?.alt);
  const description = normaliseNote(meta?.description);
  // Written only when there is something to write, so an ordinary paste does
  // not touch the sidecar at all.
  const notes =
    alt || description
      ? (await setMediaMeta(stored.pathname, { alt, description })).meta
      : EMPTY_META;

  return {
    ok: true,
    item: {
      pathname: stored.pathname,
      url: stored.url,
      filename: stored.pathname.slice(MEDIA_PREFIX.length),
      size: stored.size,
      uploadedAt: stored.uploadedAt,
      source: "upload",
      ...notes,
    },
  };
}

export async function deleteMedia(pathname: string) {
  // Confine deletes to the media prefix so a crafted pathname cannot reach the
  // post records sitting next to it in the same store.
  if (!pathname.startsWith(MEDIA_PREFIX) || pathname.includes("..")) {
    throw new Error("Refusing to delete outside the media library.");
  }
  await getStore().del(pathname);

  // The notes go with the image. Left behind they would be orphaned keys that
  // a later upload reusing the pathname would silently inherit — and the
  // storage name carries a timestamp, so that is unlikely rather than
  // impossible. Best-effort: the image is already gone, and failing the whole
  // delete over its caption would leave the caller with no way forward.
  try {
    const meta = await readMeta(true);
    if (meta[pathname]) {
      delete meta[pathname];
      await writeMeta(prune(meta));
    }
  } catch {
    // Nothing to do — the file is deleted, which is what was asked.
  }
}

import { getStore } from "./store";
import {
  ALLOWED_IMAGE_TYPES as ALLOWED,
  MAX_UPLOAD_BYTES,
  formatBytes as format,
  isAllowedType,
  slugify,
} from "./format";
import { getAllPosts } from "./posts";
import { getAllNews } from "./news";
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

export async function listMedia(): Promise<MediaItem[]> {
  let objects;
  try {
    objects = await getStore().list(MEDIA_PREFIX);
  } catch {
    return [];
  }

  return objects
    .map((o) => ({
      pathname: o.pathname,
      url: o.url,
      filename: o.pathname.slice(MEDIA_PREFIX.length),
      size: o.size,
      uploadedAt: o.uploadedAt,
      source: "upload" as const,
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

  return Promise.all([...urls].sort().map(toSiteItem));
}

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|avif|gif)$/i;

async function toSiteItem(url: string): Promise<MediaItem> {
  return {
    pathname: url,
    url,
    filename: url.split("/").pop() ?? url,
    size: await fileSize(url),
    // Committed with the code, so there is no upload moment to report. The
    // manager shows the source label in place of a date for these.
    uploadedAt: "",
    source: "site",
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

export async function uploadMedia(
  file: File,
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

  const pathname = `${MEDIA_PREFIX}${storageName(file.name, file.type)}`;
  // The File goes straight to the store — no intermediate buffer, so an upload
  // never sits in memory twice.
  const stored = await getStore().put(pathname, file, file.type);

  return {
    ok: true,
    item: {
      pathname: stored.pathname,
      url: stored.url,
      filename: stored.pathname.slice(MEDIA_PREFIX.length),
      size: stored.size,
      uploadedAt: stored.uploadedAt,
      source: "upload",
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
}

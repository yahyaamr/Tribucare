import { getStore } from "./store";
import {
  ALLOWED_IMAGE_TYPES as ALLOWED,
  MAX_UPLOAD_BYTES,
  isAllowedType,
  slugify,
} from "./format";
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
    }))
    .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
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
      error: `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024}MB — compress it first.`,
    };
  }

  const pathname = `${MEDIA_PREFIX}${storageName(file.name, file.type)}`;
  // The File goes straight to the store — no intermediate buffer, so an 8MB
  // upload never sits in memory twice.
  const stored = await getStore().put(pathname, file, file.type);

  return {
    ok: true,
    item: {
      pathname: stored.pathname,
      url: stored.url,
      filename: stored.pathname.slice(MEDIA_PREFIX.length),
      size: stored.size,
      uploadedAt: stored.uploadedAt,
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

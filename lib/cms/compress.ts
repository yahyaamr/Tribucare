import { MAX_UPLOAD_BYTES, formatBytes } from "./format";

/**
 * Browser-side image shrinking, for images that arrive by paste.
 *
 * A pasted screenshot is routinely a multi-megabyte PNG, and the upload cap is
 * 300KB — so without this, pasting into the editor would fail far more often
 * than it worked. Picking from the media library is unaffected: that path still
 * refuses anything over the cap, because a file chosen deliberately is one the
 * editor can compress deliberately.
 *
 * The ceiling exists so this stays a convenience rather than a silent quality
 * setting. Squeezing 300KB out of a 900KB paste is invisible; squeezing it out
 * of a 6MB one is not, and the editor should say so instead of publishing mush.
 */

/** Above this a paste is refused outright rather than compressed. */
export const PASTE_MAX_BYTES = 2 * 1024 * 1024;

/** Long edge, in CSS pixels. The article body renders at 768px wide, so 1600
 *  still covers a 2x display with room to spare. */
const MAX_EDGE = 1600;

/** Tried in order, each pass also shrinking the raster. The first result under
 *  the cap wins, so a modest image gives up almost nothing. */
const QUALITY_STEPS = [0.82, 0.7, 0.58, 0.46, 0.34];

export type FitResult =
  | { ok: true; file: File; compressed: boolean }
  | { ok: false; error: string };

function encode(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  quality: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve<Blob | null>(null);

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
}

function webpName(name: string) {
  const stem = name.replace(/\.[^.]+$/, "") || "pasted-image";
  return `${stem}.webp`;
}

/**
 * Bring a pasted file under the upload cap, or explain why it cannot be.
 *
 * Returns the original untouched when it already fits, so the common case costs
 * nothing and a file the writer already optimised is uploaded exactly as it is.
 */
export async function fitToUploadLimit(file: File): Promise<FitResult> {
  if (file.size <= MAX_UPLOAD_BYTES) {
    return { ok: true, file, compressed: false };
  }

  // Re-encoding an animated GIF through a canvas keeps the first frame and
  // throws the animation away, which is a worse outcome than being told no.
  if (file.type === "image/gif") {
    return {
      ok: false,
      error: `That GIF is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}, and compressing it here would drop the animation — shrink it first.`,
    };
  }

  if (file.size > PASTE_MAX_BYTES) {
    return {
      ok: false,
      error: `That image is ${formatBytes(file.size)}. Anything over ${formatBytes(PASTE_MAX_BYTES)} has to be compressed before it is pasted — the limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, error: "That image could not be read." };
  }

  try {
    let scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));

    for (const quality of QUALITY_STEPS) {
      const blob = await encode(
        bitmap,
        Math.round(bitmap.width * scale),
        Math.round(bitmap.height * scale),
        quality,
      );

      if (blob && blob.size <= MAX_UPLOAD_BYTES) {
        return {
          ok: true,
          file: new File([blob], webpName(file.name), { type: "image/webp" }),
          compressed: true,
        };
      }
      scale *= 0.8;
    }

    return {
      ok: false,
      error: `That image could not be compressed under ${formatBytes(MAX_UPLOAD_BYTES)}. Resize it first.`,
    };
  } finally {
    bitmap.close();
  }
}

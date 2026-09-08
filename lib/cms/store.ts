/**
 * Where the CMS keeps its bytes.
 *
 * There are two implementations behind one interface, chosen at call time by
 * whether `BLOB_READ_WRITE_TOKEN` is set:
 *
 * - **Vercel Blob** in production. Vercel's filesystem is read-only, so a post
 *   saved to disk there survives exactly until the next deploy. Blob is the
 *   one storage product that covers both the post JSON and the uploaded
 *   images, so enabling it is one switch in the Vercel dashboard rather than
 *   two services to wire up.
 * - **The local filesystem** everywhere else, under `.cms-data/` with uploads
 *   in `public/uploads/`. This exists so `npm run dev` works with no
 *   environment set up at all — clone, run, edit.
 *
 * Everything above this file speaks the `CmsStore` interface, so swapping in a
 * database later means writing one more implementation and changing
 * `getStore()`. Nothing in `posts.ts`, `media.ts` or the admin UI would move.
 *
 * ## Two contracts every caller can rely on
 *
 * **`read()` returns `null` only when the object does not exist.** Any other
 * failure throws `StoreUnavailableError`. The distinction is not academic: the
 * vocabulary lists are read-modify-write, and a caller that treats "the read
 * failed" as "the list is empty" writes an empty list back. That is how
 * categories vanished — a blip became a blank file. Absence is a fact about
 * the store; failure is a fact about the network, and only one of them is safe
 * to act on.
 *
 * **A write is visible to the next read on this instance, immediately.** Blob
 * itself confirms a write in well under a second, but two things sit between
 * it and the app: the public CDN, which the SDK's `useCache: false` does not
 * bypass for a public store (it only applies to private ones), and Next's own
 * fetch cache. Reads here go straight to the object with a cache-busting
 * query and `cache: "no-store"`, and every write is also kept in memory for
 * `RECENT_MS`, so the panel reads back what it just saved rather than what a
 * cache remembers. Without this an editor saved, reloaded, saw the old value,
 * and saved again — up to ten times, by their count.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

export interface StoredObject {
  pathname: string;
  /** For blob, the public CDN URL. For the filesystem, a `/uploads/...` path
   *  that Next serves out of `public/`. Only meaningful for media — post JSON
   *  is always read back through `read()`, never over the network. */
  url: string;
  size: number;
  uploadedAt: string;
}

export interface CmsStore {
  list(prefix: string): Promise<StoredObject[]>;
  /** The current bytes, or `null` if and only if the object does not exist.
   *  Throws `StoreUnavailableError` on any other failure. */
  read(pathname: string): Promise<string | null>;
  /** `Blob` covers the upload case directly — a `File` from a multipart form
   *  is already one, so nothing has to be buffered through memory to store it. */
  put(
    pathname: string,
    body: string | Blob,
    contentType: string,
  ): Promise<StoredObject>;
  del(pathname: string): Promise<void>;
}

/**
 * Storage did not answer, or refused. Carries the status an API route should
 * return and a sentence an editor can act on — "wait a minute" is a different
 * instruction from "check your connection", and both are different from
 * silently saving nothing.
 */
export class StoreUnavailableError extends Error {
  constructor(
    message: string,
    public readonly status: 429 | 503 = 503,
  ) {
    super(message);
    this.name = "StoreUnavailableError";
  }
}

function isNotFound(error: unknown) {
  const name = (error as { constructor?: { name?: string } })?.constructor
    ?.name;
  const message = String((error as Error)?.message ?? "");
  return name === "BlobNotFoundError" || /not[ _-]?found|\b404\b/i.test(message);
}

function toUnavailable(error: unknown): StoreUnavailableError {
  if (error instanceof StoreUnavailableError) return error;
  const name = (error as { constructor?: { name?: string } })?.constructor
    ?.name;
  const message = String((error as Error)?.message ?? "");
  if (name === "BlobRateLimited" || /rate[ _-]?limit|\b429\b/i.test(message)) {
    return new StoreUnavailableError(
      "Storage is rate-limited right now. Wait a minute and try again — nothing was changed.",
      429,
    );
  }
  return new StoreUnavailableError(
    "Storage did not answer. Nothing was changed — try again in a moment.",
    503,
  );
}

/**
 * Wraps a route handler so a storage failure becomes a JSON error with the
 * right status, which the editors already display, instead of a bare 500 that
 * they render as "check your connection".
 */
export function guardStore<A extends unknown[]>(
  handler: (...args: A) => Promise<Response>,
): (...args: A) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof StoreUnavailableError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }
  };
}

/* ------------------------------------------------------------------ blob -- */

/**
 * How long a write is remembered in this process. Blob converges far faster
 * than this — the window only has to outlast the caches in front of it. Our
 * own write is always the newest thing this instance knows about, so serving
 * it from memory can never be staler than storage.
 */
const RECENT_MS = 90_000;

interface Recent {
  at: number;
  url: string;
  size: number;
  /** Text bodies are kept; uploads (binary) are remembered only as present. */
  body?: string;
  /** A delete, so a listing hides it and a read returns absent. */
  gone?: boolean;
}

const recent = new Map<string, Recent>();

function fresh(entry: Recent | undefined): Recent | undefined {
  return entry && Date.now() - entry.at < RECENT_MS ? entry : undefined;
}

function remember(pathname: string, entry: Recent) {
  recent.set(pathname, entry);
  if (recent.size > 500) {
    for (const [key, value] of recent) if (!fresh(value)) recent.delete(key);
  }
}

/** The store's public origin, learned from the first object we look up and
 *  kept for the life of the process. Every store has exactly one. */
let baseUrl: string | null = null;

async function learnBaseUrl(pathname: string): Promise<string | null> {
  const { head } = await import("@vercel/blob");
  try {
    const meta = await head(pathname);
    baseUrl = meta.url.slice(0, meta.url.length - pathname.length - 1);
    return baseUrl;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw toUnavailable(error);
  }
}

function blobStore(): CmsStore {
  return {
    async list(prefix) {
      const { list } = await import("@vercel/blob");
      const byPath = new Map<string, StoredObject>();
      let cursor: string | undefined;

      try {
        // `list` pages at 1000; a blog will never approach that, but looping
        // costs nothing and removes a silent ceiling on the media library.
        do {
          const page = await list({ prefix, cursor, limit: 1000 });
          for (const blob of page.blobs) {
            byPath.set(blob.pathname, {
              pathname: blob.pathname,
              url: blob.url,
              size: blob.size,
              uploadedAt: new Date(blob.uploadedAt).toISOString(),
            });
          }
          cursor = page.hasMore ? page.cursor : undefined;
        } while (cursor);
      } catch (error) {
        throw toUnavailable(error);
      }

      // Overlay what this process wrote or deleted since the index caught up.
      for (const [pathname, entry] of recent) {
        if (!pathname.startsWith(prefix) || !fresh(entry)) continue;
        if (entry.gone) byPath.delete(pathname);
        else if (!byPath.has(pathname)) {
          byPath.set(pathname, {
            pathname,
            url: entry.url,
            size: entry.size,
            uploadedAt: new Date(entry.at).toISOString(),
          });
        }
      }

      return [...byPath.values()];
    },

    async read(pathname) {
      const known = fresh(recent.get(pathname));
      if (known?.gone) return null;
      if (known?.body !== undefined) return known.body;

      const base = baseUrl ?? (await learnBaseUrl(pathname));
      if (!base) return null;

      let response: Response;
      try {
        // Straight to the object, past both the CDN and Next's fetch cache.
        response = await fetch(`${base}/${pathname}?nc=${Date.now()}`, {
          cache: "no-store",
        });
      } catch (error) {
        throw toUnavailable(error);
      }
      if (response.status === 404) return null;
      if (response.status === 429) {
        throw toUnavailable(new Error("429 rate limited"));
      }
      if (!response.ok) {
        throw toUnavailable(new Error(`storage responded ${response.status}`));
      }
      return response.text();
    },

    async put(pathname, body, contentType) {
      const { put } = await import("@vercel/blob");
      let blob;
      try {
        blob = await put(pathname, body, {
          access: "public",
          contentType,
          // The pathname *is* the identity here — a random suffix would mean a
          // second save created a second post rather than updating the first.
          addRandomSuffix: false,
          allowOverwrite: true,
        });
      } catch (error) {
        throw toUnavailable(error);
      }
      const size = typeof body === "string" ? body.length : body.size;
      remember(pathname, {
        at: Date.now(),
        url: blob.url,
        size,
        body: typeof body === "string" ? body : undefined,
      });
      if (!baseUrl) {
        baseUrl = blob.url.slice(0, blob.url.length - pathname.length - 1);
      }
      return {
        pathname: blob.pathname,
        url: blob.url,
        size,
        uploadedAt: new Date().toISOString(),
      };
    },

    async del(pathname) {
      const { del } = await import("@vercel/blob");
      try {
        await del(pathname);
      } catch (error) {
        throw toUnavailable(error);
      }
      remember(pathname, { at: Date.now(), url: "", size: 0, gone: true });
    },
  };
}

/* -------------------------------------------------------------------- fs -- */

/** Media lands in `public/` so Next serves it as a static asset; everything
 *  else is private bookkeeping and stays out of the served tree. */
const FS_ROOT = path.join(process.cwd(), ".cms-data");
const FS_PUBLIC = path.join(process.cwd(), "public", "uploads");
const MEDIA_PREFIX = "cms/media/";

function fsTarget(pathname: string) {
  return pathname.startsWith(MEDIA_PREFIX)
    ? path.join(FS_PUBLIC, pathname.slice(MEDIA_PREFIX.length))
    : path.join(FS_ROOT, pathname);
}

function fsUrl(pathname: string) {
  return pathname.startsWith(MEDIA_PREFIX)
    ? `/uploads/${pathname.slice(MEDIA_PREFIX.length)}`
    : `/${pathname}`;
}

function fileStore(): CmsStore {
  return {
    async list(prefix) {
      const dir = path.dirname(fsTarget(`${prefix}x`));
      let names: string[];
      try {
        names = await fs.readdir(dir);
      } catch (error) {
        // No directory yet is a valid, empty store — the seed runs off exactly
        // this. Anything else is a real failure.
        if ((error as { code?: string })?.code === "ENOENT") return [];
        throw toUnavailable(error);
      }

      const out: StoredObject[] = [];
      for (const name of names) {
        const stat = await fs.stat(path.join(dir, name)).catch(() => null);
        if (!stat?.isFile()) continue;
        out.push({
          pathname: `${prefix}${name}`,
          url: fsUrl(`${prefix}${name}`),
          size: stat.size,
          uploadedAt: stat.mtime.toISOString(),
        });
      }
      return out;
    },

    async read(pathname) {
      try {
        return await fs.readFile(fsTarget(pathname), "utf8");
      } catch (error) {
        if ((error as { code?: string })?.code === "ENOENT") return null;
        throw toUnavailable(error);
      }
    },

    async put(pathname, body) {
      const target = fsTarget(pathname);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(
        target,
        typeof body === "string"
          ? body
          : Buffer.from(await body.arrayBuffer()),
      );
      const stat = await fs.stat(target);
      return {
        pathname,
        url: fsUrl(pathname),
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
      };
    },

    async del(pathname) {
      await fs.rm(fsTarget(pathname), { force: true });
    },
  };
}

/* ---------------------------------------------------------------- choose -- */

export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Deliberately re-evaluated per call rather than memoised: it is cheap, and a
 * cached choice would survive a hot reload after the token is added to
 * `.env.local`, leaving the dev server writing to the wrong place.
 */
export function getStore(): CmsStore {
  return isBlobConfigured() ? blobStore() : fileStore();
}

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
  /** Reads the *current* bytes, never a cached copy. */
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

/* ------------------------------------------------------------------ blob -- */

function blobStore(): CmsStore {
  return {
    async list(prefix) {
      const { list } = await import("@vercel/blob");
      const out: StoredObject[] = [];
      let cursor: string | undefined;

      // `list` pages at 1000; a blog will never approach that, but looping
      // costs nothing and removes a silent ceiling on the media library.
      do {
        const page = await list({ prefix, cursor, limit: 1000 });
        for (const blob of page.blobs) {
          out.push({
            pathname: blob.pathname,
            url: blob.url,
            size: blob.size,
            uploadedAt: new Date(blob.uploadedAt).toISOString(),
          });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);

      return out;
    },

    async read(pathname) {
      const { get } = await import("@vercel/blob");
      // `useCache: false` reads from origin rather than the CDN. Blob refuses a
      // `cacheControlMaxAge` under 60s, so without this an editor could save a
      // post, reload, and be handed back the version they just replaced.
      const result = await get(pathname, {
        access: "public",
        useCache: false,
      }).catch(() => null);

      if (!result || result.statusCode !== 200) return null;
      return new Response(result.stream).text();
    },

    async put(pathname, body, contentType) {
      const { put } = await import("@vercel/blob");
      const blob = await put(pathname, body, {
        access: "public",
        contentType,
        // The pathname *is* the identity here — a random suffix would mean a
        // second save created a second post rather than updating the first.
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return {
        pathname: blob.pathname,
        url: blob.url,
        size: typeof body === "string" ? body.length : body.size,
        uploadedAt: new Date().toISOString(),
      };
    },

    async del(pathname) {
      const { del } = await import("@vercel/blob");
      await del(pathname);
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
      } catch {
        // Nothing has been written yet. An empty store is a valid state, not
        // an error — the seed runs off exactly this.
        return [];
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
      return fs.readFile(fsTarget(pathname), "utf8").catch(() => null);
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

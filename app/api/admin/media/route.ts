import { requireSession } from "@/lib/cms/session";
import {
  deleteMedia,
  getMediaMetaByUrl,
  listMedia,
  listSiteMedia,
  mediaPathnameFromUrl,
  setMediaMeta,
  syncMediaMetaToContent,
  uploadMedia,
} from "@/lib/cms/media";
import { revalidateBlog, revalidateNews } from "@/lib/cms/revalidate";

/** Uploads first, then the artwork the site already ships. One list rather than
 *  two endpoints, so the picker offers both without knowing the difference.
 *
 *  `?url=` answers for one image instead: the editors know a cover by its URL
 *  and nothing else, and fetching the whole library to read one caption would
 *  be fifty images of work for two strings. */
export async function GET(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const url = new URL(request.url).searchParams.get("url");
  if (url) {
    return Response.json(
      { meta: await getMediaMetaByUrl(url) },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const [uploads, site] = await Promise.all([listMedia(), listSiteMedia()]);

  return Response.json(
    { items: [...uploads, ...site] },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file was sent." }, { status: 400 });
  }

  // Sent by the library's upload form, absent from an article-body paste.
  const alt = form?.get("alt");
  const description = form?.get("description");

  try {
    const result = await uploadMedia(file, {
      alt: typeof alt === "string" ? alt : undefined,
      description: typeof description === "string" ? description : undefined,
    });
    if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
    return Response.json({ item: result.item }, { status: 201 });
  } catch (error) {
    // Almost always a missing or wrong blob token in production. Say so
    // rather than showing the SEO team a bare 500.
    return Response.json(
      {
        error:
          error instanceof Error
            ? `Upload failed: ${error.message}`
            : "Upload failed.",
      },
      { status: 500 },
    );
  }
}

/**
 * Edits one image's alt text and description, everywhere at once.
 *
 * Works for an upload and for a committed site image alike — the sidecar is
 * keyed by `pathname`, which both have, and describing artwork the site
 * already ships needs no code change even though replacing it would.
 *
 * The write does not stop at the library: every article and event whose body
 * uses this image is rewritten in the same request, so the caption a writer
 * reads on the page can never disagree with the one the library shows. Both
 * sets of public pages are then revalidated, because either could have been
 * the one that changed.
 */
export async function PATCH(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    pathname?: string;
    /** The editors hold a URL and nothing else — see `mediaPathnameFromUrl`. */
    url?: string;
    alt?: string;
    description?: string;
  } | null;

  const pathname =
    body?.pathname ?? (body?.url ? mediaPathnameFromUrl(body.url) : null);

  if (!pathname) {
    return Response.json({ error: "No image specified." }, { status: 400 });
  }

  try {
    const { meta, changed } = await setMediaMeta(pathname, {
      alt: body?.alt,
      description: body?.description,
    });

    // The library first, then the copies. In that order: the sidecar is the
    // source of truth, so it must be right even if a later save fails.
    //
    // Skipped entirely when nothing moved. The editor writes on blur and the
    // sync reads every post and event, so a blur that changed nothing would
    // otherwise be a full pass over the store for no reason.
    const synced = changed
      ? await syncMediaMetaToContent(pathname, meta)
      : { posts: 0, news: 0 };

    if (synced.posts) revalidateBlog();
    if (synced.news) revalidateNews();

    return Response.json({ meta, synced });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save that.",
      },
      { status: 400 },
    );
  }
}

/** The pathname travels as a query parameter rather than a path segment
 *  because it contains slashes (`cms/media/...`). */
export async function DELETE(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const pathname = new URL(request.url).searchParams.get("pathname");
  if (!pathname) {
    return Response.json({ error: "No image specified." }, { status: 400 });
  }

  try {
    await deleteMedia(pathname);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Delete failed." },
      { status: 400 },
    );
  }
}

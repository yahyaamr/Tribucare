import { requireSession } from "@/lib/cms/session";
import { guardStore } from "@/lib/cms/store";
import { revalidateNews } from "@/lib/cms/revalidate";
import {
  addNewsTag,
  deleteNewsTag,
  getNewsTags,
  getNewsTagUsage,
  renameNewsTag,
  setNewsTagLocale,
  setNewsTagSlug,
} from "@/lib/cms/news-tags";
import { LOCALES } from "@/lib/i18n/config";

/**
 * The news vocabulary.
 *
 * The blog's twin at `/api/admin/categories`, with one difference that matters:
 * every write here calls `revalidateNews` and never `revalidateBlog`, so a tag
 * edit refreshes the news surfaces and nothing else.
 */

async function GET_(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  // `?usage=<name>` answers "what would deleting this touch?" — the panel asks
  // before it shows the confirmation, so the warning names real items.
  const usage = new URL(request.url).searchParams.get("usage");
  if (usage) {
    return Response.json(
      { usage: await getNewsTagUsage(usage) },
      { headers: { "cache-control": "no-store" } },
    );
  }

  return Response.json(
    { tags: await getNewsTags() },
    { headers: { "cache-control": "no-store" } },
  );
}

async function POST_(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    locale?: string;
    slug?: string;
  } | null;

  // A tag belongs to one language site, and the editor knows which one because
  // the item being written says so. Defaulted rather than refused, so a caller
  // that predates the field still creates an English tag. The slug is optional
  // in the same way: Settings offers it up front, the editor's inline "Create"
  // row sends only a name and gets one made.
  const locale = LOCALES.find((l) => l === body?.locale) ?? LOCALES[0];
  const result = await addNewsTag(body?.name ?? "", locale, body?.slug);

  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ tag: result.tag, tags: result.tags }, { status: 201 });
}

/**
 * Rename, move between language sites, and move the page.
 *
 * The panel's edit row submits the name and the permalink together, so they
 * are applied in one request: the rename first, because the slug is addressed
 * by name and applying it under the old one would write a second record. The
 * slug is written only when it actually differs, so saving a row untouched
 * moves nothing. `locale` alone, with no `to`, moves the tag between sites —
 * the items carrying it are untouched, since the name has not changed, only
 * which editor is offered it.
 */
async function PUT_(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    from?: string;
    to?: string;
    locale?: string;
    slug?: string;
  } | null;

  if (!body?.from) {
    return Response.json({ error: "No tag given." }, { status: 400 });
  }

  const moveTo = LOCALES.find((l) => l === body.locale);
  if (moveTo && body.to === undefined) {
    const moved = await setNewsTagLocale(body.from, moveTo);
    if (!moved.ok) return Response.json({ error: moved.error }, { status: 400 });
    revalidateNews();
    return Response.json({ tags: moved.tags });
  }

  let tags = await getNewsTags();
  let name = body.from;

  if (body.to !== undefined) {
    const renamed = await renameNewsTag(body.from, body.to);
    if (!renamed.ok) {
      return Response.json({ error: renamed.error }, { status: 400 });
    }
    tags = renamed.tags;
    // Whatever the rename settled on is what the notes must be filed under.
    name = tags.find((t) => t.name.toLowerCase() === body.to!.trim().toLowerCase())
      ? body.to
      : body.from;
  }

  if (body.slug !== undefined) {
    const current = tags.find(
      (t) => t.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (current && current.slug !== body.slug.trim()) {
      const moved = await setNewsTagSlug(name, body.slug);
      if (!moved.ok) return Response.json({ error: moved.error }, { status: 400 });
      tags = moved.tags;
    }
  }

  revalidateNews();
  return Response.json({ tags });
}

/**
 * Delete. Without `?force=true` this reports what would be affected instead of
 * acting. The name travels as a query parameter because it can contain spaces
 * and ampersands.
 */
async function DELETE_(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const force = url.searchParams.get("force") === "true";

  if (!name) return Response.json({ error: "No tag given." }, { status: 400 });

  const result = await deleteNewsTag(name, force);
  if (!result.ok) {
    return Response.json(
      { error: result.error, usage: result.usage },
      { status: 409 },
    );
  }

  revalidateNews();
  return Response.json({ tags: result.tags });
}

// A storage failure becomes a clear JSON error with the right status, which the
// editors display verbatim, rather than a bare 500 they render as "check your
// connection". Nothing is written on the failing path.
export const GET = guardStore(GET_);
export const POST = guardStore(POST_);
export const PUT = guardStore(PUT_);
export const DELETE = guardStore(DELETE_);

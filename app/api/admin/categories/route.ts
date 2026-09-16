import { requireSession } from "@/lib/cms/session";
import { guardStore } from "@/lib/cms/store";
import { revalidateBlog } from "@/lib/cms/revalidate";
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryUsage,
  renameCategory,
  setCategoryLocale,
  setCategorySlug,
} from "@/lib/cms/categories";
import { LOCALES } from "@/lib/i18n/config";

async function GET_(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  // `?usage=<name>` answers "what would deleting this touch?" — the panel asks
  // before it shows the confirmation, so the warning names real posts.
  const usage = new URL(request.url).searchParams.get("usage");
  if (usage) {
    return Response.json(
      { usage: await getCategoryUsage(usage) },
      { headers: { "cache-control": "no-store" } },
    );
  }

  return Response.json(
    { categories: await getCategories() },
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

  // A category belongs to one language site, and the editor knows which one
  // because the post being written says so. Defaulted rather than refused, so
  // a caller that predates the field still creates an English category.
  //
  // The slug is optional in the same way: Settings offers it up front, while
  // the editor's inline "Create" row sends only a name and gets one made.
  const locale = LOCALES.find((l) => l === body?.locale) ?? LOCALES[0];
  const result = await addCategory(body?.name ?? "", locale, body?.slug);

  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  return Response.json(
    { category: result.category, categories: result.categories },
    { status: 201 },
  );
}

/**
 * Rename, move between language sites, and move the page.
 *
 * All three are one verb on one record, and the panel's edit row submits the
 * name and the permalink together, so they are applied in one request: the
 * rename first, because the slug is addressed by name and applying it under
 * the old one would write a second record. A rename also rewrites every post
 * carrying the old name, in the same operation; the slug is written only when
 * it actually differs, so saving a row untouched moves nothing.
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
    return Response.json({ error: "No category given." }, { status: 400 });
  }

  // `locale` without `to` moves the category to the other language site
  // rather than renaming it. The posts carrying it are untouched — the name
  // has not changed, only which editor is offered it.
  const moveTo = LOCALES.find((l) => l === body.locale);
  if (moveTo && body.to === undefined) {
    const moved = await setCategoryLocale(body.from, moveTo);
    if (!moved.ok) return Response.json({ error: moved.error }, { status: 400 });
    revalidateBlog();
    return Response.json({ categories: moved.categories });
  }

  let categories = await getCategories();
  let name = body.from;

  if (body.to !== undefined) {
    const renamed = await renameCategory(body.from, body.to);
    if (!renamed.ok) {
      return Response.json({ error: renamed.error }, { status: 400 });
    }
    categories = renamed.categories;
    // Whatever the rename settled on is what the notes must be filed under.
    name = categories.find(
      (c) => c.name.toLowerCase() === body.to!.trim().toLowerCase(),
    )
      ? body.to
      : body.from;
  }

  if (body.slug !== undefined) {
    const current = categories.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (current && current.slug !== body.slug.trim()) {
      const moved = await setCategorySlug(name, body.slug);
      if (!moved.ok) return Response.json({ error: moved.error }, { status: 400 });
      categories = moved.categories;
    }
  }

  // The category shows on cards, article headers and the /blog filter row.
  revalidateBlog();
  return Response.json({ categories });
}

/**
 * Delete. Without `?force=true` this reports what would be affected instead of
 * acting, so the panel can warn which posts would be left uncategorised.
 *
 * The name travels as a query parameter because it can contain spaces and
 * ampersands ("Dermatology & Tech").
 */
async function DELETE_(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const url = new URL(request.url);
  const name = url.searchParams.get("name");
  const force = url.searchParams.get("force") === "true";

  if (!name) return Response.json({ error: "No category given." }, { status: 400 });

  const result = await deleteCategory(name, force);
  if (!result.ok) {
    return Response.json(
      { error: result.error, usage: result.usage },
      { status: 409 },
    );
  }

  revalidateBlog();
  return Response.json({ categories: result.categories });
}

// A storage failure becomes a clear JSON error with the right status, which the
// editors display verbatim, rather than a bare 500 they render as "check your
// connection". Nothing is written on the failing path.
export const GET = guardStore(GET_);
export const POST = guardStore(POST_);
export const PUT = guardStore(PUT_);
export const DELETE = guardStore(DELETE_);

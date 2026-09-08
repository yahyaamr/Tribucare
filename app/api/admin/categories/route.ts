import { requireSession } from "@/lib/cms/session";
import { guardStore } from "@/lib/cms/store";
import { revalidateBlog } from "@/lib/cms/revalidate";
import {
  addCategory,
  deleteCategory,
  getCategories,
  getCategoryUsage,
  renameCategory,
} from "@/lib/cms/categories";

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

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const result = await addCategory(body?.name ?? "");

  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  return Response.json(
    { category: result.category, categories: result.categories },
    { status: 201 },
  );
}

/** Rename. Rewrites every post carrying the old name in the same operation. */
async function PUT_(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    from?: string;
    to?: string;
  } | null;

  if (!body?.from) {
    return Response.json({ error: "No category given." }, { status: 400 });
  }

  const result = await renameCategory(body.from, body.to ?? "");
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  // The category shows on cards, article headers and the /blog filter row.
  revalidateBlog();
  return Response.json({ categories: result.categories });
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

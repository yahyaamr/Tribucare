import { requireSession } from "@/lib/cms/session";
import { revalidateNews } from "@/lib/cms/revalidate";
import {
  addNewsTag,
  deleteNewsTag,
  getNewsTags,
  getNewsTagUsage,
  renameNewsTag,
} from "@/lib/cms/news-tags";

/**
 * The news vocabulary.
 *
 * The blog's twin at `/api/admin/categories`, with one difference that matters:
 * every write here calls `revalidateNews` and never `revalidateBlog`, so a tag
 * edit refreshes the news surfaces and nothing else.
 */

export async function GET(request: Request) {
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

export async function POST(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
  } | null;
  const result = await addNewsTag(body?.name ?? "");

  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ tag: result.tag, tags: result.tags }, { status: 201 });
}

/** Rename. Rewrites every news item carrying the old name in the same call. */
export async function PUT(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    from?: string;
    to?: string;
  } | null;

  if (!body?.from) {
    return Response.json({ error: "No tag given." }, { status: 400 });
  }

  const result = await renameNewsTag(body.from, body.to ?? "");
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  revalidateNews();
  return Response.json({ tags: result.tags });
}

/**
 * Delete. Without `?force=true` this reports what would be affected instead of
 * acting. The name travels as a query parameter because it can contain spaces
 * and ampersands.
 */
export async function DELETE(request: Request) {
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

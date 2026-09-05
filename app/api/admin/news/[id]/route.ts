import { requireSession } from "@/lib/cms/session";
import { revalidateNews } from "@/lib/cms/revalidate";
import {
  deleteNews,
  getNewsById,
  saveNews,
  uniqueNewsSlug,
  validateNews,
} from "@/lib/cms/news";
import type { NewsItem } from "@/lib/cms/types";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const item = await getNewsById((await params).id);
  if (!item) return Response.json({ error: "Not found." }, { status: 404 });

  return Response.json({ item }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getNewsById(id);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  const body = (await request
    .json()
    .catch(() => null)) as Partial<NewsItem> | null;

  const next: NewsItem = {
    ...existing,
    ...body,
    // The path decides identity, not the payload, and creation time is not
    // the client's to rewrite.
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const errors = validateNews(next, next.status);
  if (Object.keys(errors).length) {
    return Response.json({ errors }, { status: 422 });
  }

  next.slug = await uniqueNewsSlug(next.slug || next.title, next.id);

  const saved = await saveNews(next);
  // Both slugs: renaming a published item leaves the old URL cached, and it
  // has to be refreshed to start 404ing.
  revalidateNews(saved.slug, existing.slug);

  return Response.json({ item: saved });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getNewsById(id);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  await deleteNews(id);
  revalidateNews(existing.slug);

  return Response.json({ ok: true });
}

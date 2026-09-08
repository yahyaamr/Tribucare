import { requireSession } from "@/lib/cms/session";
import { guardStore } from "@/lib/cms/store";
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

async function GET_(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const item = await getNewsById((await params).id);
  if (!item) return Response.json({ error: "Not found." }, { status: 404 });

  return Response.json({ item }, { headers: { "cache-control": "no-store" } });
}

async function PUT_(request: Request, { params }: Context) {
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

  // The uniqueness scan reads every item; only pay for it when the slug is
  // actually new. An unchanged slug is unique by construction.
  if (!next.slug || next.slug !== existing.slug) {
    next.slug = await uniqueNewsSlug(next.slug || next.title, next.id);
  }

  const saved = await saveNews(next);
  // Both slugs: renaming a published item leaves the old URL cached, and it
  // has to be refreshed to start 404ing.
  revalidateNews(saved.slug, existing.slug);

  return Response.json({ item: saved });
}

async function DELETE_(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getNewsById(id);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  await deleteNews(id);
  revalidateNews(existing.slug);

  return Response.json({ ok: true });
}

// A storage failure becomes a clear JSON error with the right status, which the
// editors display verbatim, rather than a bare 500 they render as "check your
// connection". Nothing is written on the failing path.
export const GET = guardStore(GET_);
export const PUT = guardStore(PUT_);
export const DELETE = guardStore(DELETE_);

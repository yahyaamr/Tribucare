import { requireSession } from "@/lib/cms/session";
import { revalidateBlog } from "@/lib/cms/revalidate";
import {
  deletePost,
  getPostById,
  savePost,
  uniqueSlug,
  validatePost,
} from "@/lib/cms/posts";
import type { Post } from "@/lib/cms/types";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const post = await getPostById((await params).id);
  if (!post) return Response.json({ error: "Not found." }, { status: 404 });

  return Response.json({ post }, { headers: { "cache-control": "no-store" } });
}

export async function PUT(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getPostById(id);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Partial<Post> | null;

  const next: Post = {
    ...existing,
    ...body,
    // The path decides identity, not the payload, and creation time is not
    // the client's to rewrite.
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const errors = validatePost(next, next.status);
  if (Object.keys(errors).length) {
    return Response.json({ errors }, { status: 422 });
  }

  next.slug = await uniqueSlug(next.slug || next.title, next.id);

  const saved = await savePost(next);
  // Both slugs: renaming a published post leaves the old URL cached, and it
  // has to be refreshed to start 404ing.
  revalidateBlog(saved.slug, existing.slug);

  return Response.json({ post: saved });
}

export async function DELETE(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const existing = await getPostById(id);
  if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

  await deletePost(id);
  revalidateBlog(existing.slug);

  return Response.json({ ok: true });
}

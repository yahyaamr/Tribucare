import { requireSession } from "@/lib/cms/session";
import { revalidateBlog } from "@/lib/cms/revalidate";
import {
  emptyPost,
  getPostSummaries,
  savePost,
  uniqueSlug,
  validatePost,
} from "@/lib/cms/posts";
import type { Post } from "@/lib/cms/types";

export async function GET() {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { posts: await getPostSummaries() },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const denied = await requireSession();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as Partial<Post> | null;
  const base = emptyPost();

  const draft: Post = {
    ...base,
    ...body,
    // Never trust a client-supplied id or timestamp — the id decides which
    // stored record a save overwrites.
    id: base.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const errors = validatePost(draft, draft.status);
  if (Object.keys(errors).length) {
    return Response.json({ errors }, { status: 422 });
  }

  draft.slug = await uniqueSlug(draft.slug || draft.title, draft.id);

  const saved = await savePost(draft);
  revalidateBlog(saved.slug);

  return Response.json({ post: saved }, { status: 201 });
}

import { requireSession } from "@/lib/cms/session";
import { revalidateBlog } from "@/lib/cms/revalidate";
import { deleteAuthor, getAuthors, updateAuthor } from "@/lib/cms/authors";
import { getAllPosts, savePost } from "@/lib/cms/posts";

type Context = { params: Promise<{ id: string }> };

/** Which posts carry this byline, and therefore what a rename or a delete
 *  would touch. */
async function usageFor(id: string) {
  const posts = await getAllPosts();
  return posts
    .filter((p) => p.authorId === id)
    .map((p) => ({ id: p.id, title: p.title || "(untitled)", status: p.status }));
}

export async function GET(_request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  return Response.json(
    { posts: await usageFor((await params).id) },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PUT(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    role?: string;
    avatar?: string;
  } | null;

  const result = await updateAuthor(id, body ?? {});
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  // The byline is baked into every rendered article and card, so an edit here
  // has to refresh the blog the same way publishing does.
  const affected = await usageFor(id);
  if (affected.length > 0) revalidateBlog();

  return Response.json({
    author: result.author,
    authors: await getAuthors(),
    affected: affected.length,
  });
}

/**
 * Removing an author strips the byline from their posts.
 *
 * Without `?force=true` this reports which posts would be affected rather than
 * doing it, so the panel can warn before anything is lost.
 */
export async function DELETE(request: Request, { params }: Context) {
  const denied = await requireSession();
  if (denied) return denied;

  const { id } = await params;
  const force = new URL(request.url).searchParams.get("force") === "true";
  const affected = await usageFor(id);

  if (affected.length > 0 && !force) {
    return Response.json(
      {
        error: `This author is credited on ${affected.length} post${affected.length === 1 ? "" : "s"}.`,
        posts: affected,
      },
      { status: 409 },
    );
  }

  if (force && affected.length > 0) {
    const posts = await getAllPosts();
    for (const post of posts) {
      if (post.authorId !== id) continue;
      await savePost({ ...post, authorId: "" });
    }
  }

  await deleteAuthor(id);
  if (affected.length > 0) revalidateBlog();

  return Response.json({ authors: await getAuthors() });
}

import { notFound } from "next/navigation";
import { getPostById } from "@/lib/cms/posts";
import { getCategories } from "@/lib/cms/categories";
import { getAuthors } from "@/lib/cms/authors";
import { PostEditor } from "@/components/admin/post-editor";

export const dynamic = "force-dynamic";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const post = await getPostById((await params).id);
  return { title: post?.title || "Edit post" };
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [post, categories, authors] = await Promise.all([
    getPostById(id),
    getCategories(),
    getAuthors(),
  ]);

  if (!post) notFound();

  return (
    <PostEditor
      initialPost={post}
      categories={categories}
      authors={authors}
      isNew={false}
    />
  );
}

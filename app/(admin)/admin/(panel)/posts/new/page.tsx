import { emptyPost } from "@/lib/cms/posts";
import { getCategories } from "@/lib/cms/categories";
import { getAuthors } from "@/lib/cms/authors";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata = { title: "New post" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, authors] = await Promise.all([
    getCategories(),
    getAuthors(),
  ]);

  return (
    <PostEditor
      initialPost={emptyPost()}
      categories={categories}
      authors={authors}
      isNew
    />
  );
}

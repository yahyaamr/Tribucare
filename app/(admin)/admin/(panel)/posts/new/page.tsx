import { emptyPost } from "@/lib/cms/posts";
import { getCategories } from "@/lib/cms/categories";
import { getAuthors } from "@/lib/cms/authors";
import { PostEditor } from "@/components/admin/post-editor";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.posts.addNew };
}
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

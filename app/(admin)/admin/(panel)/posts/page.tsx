import { getPostSummaries } from "@/lib/cms/posts";
import { PostsTable } from "@/components/admin/posts-table";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.posts.title };
}
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <PostsTable initialPosts={await getPostSummaries()} />
    </div>
  );
}

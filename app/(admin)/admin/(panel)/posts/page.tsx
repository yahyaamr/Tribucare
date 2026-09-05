import { getPostSummaries } from "@/lib/cms/posts";
import { PostsTable } from "@/components/admin/posts-table";

export const metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <PostsTable initialPosts={await getPostSummaries()} />
    </div>
  );
}

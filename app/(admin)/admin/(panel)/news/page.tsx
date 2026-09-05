import { getNewsSummaries } from "@/lib/cms/news";
import { NewsTable } from "@/components/admin/news-table";

export const metadata = { title: "News" };
export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <NewsTable initialNews={await getNewsSummaries()} />
    </div>
  );
}

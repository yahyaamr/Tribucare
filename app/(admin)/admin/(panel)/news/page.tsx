import { getNewsSummaries } from "@/lib/cms/news";
import { NewsTable } from "@/components/admin/news-table";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.news.title };
}
export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <NewsTable initialNews={await getNewsSummaries()} />
    </div>
  );
}

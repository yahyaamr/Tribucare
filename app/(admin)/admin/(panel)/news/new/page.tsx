import { emptyNews } from "@/lib/cms/news";
import { getNewsTags } from "@/lib/cms/news-tags";
import { NewsEditor } from "@/components/admin/news-editor";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.news.addNew };
}
export const dynamic = "force-dynamic";

export default async function NewNewsPage() {
  return <NewsEditor initialItem={emptyNews()} tags={await getNewsTags()} isNew />;
}

import { emptyNews } from "@/lib/cms/news";
import { getNewsTags } from "@/lib/cms/news-tags";
import { NewsEditor } from "@/components/admin/news-editor";

export const metadata = { title: "Add news" };
export const dynamic = "force-dynamic";

export default async function NewNewsPage() {
  return <NewsEditor initialItem={emptyNews()} tags={await getNewsTags()} isNew />;
}

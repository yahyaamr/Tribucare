import { notFound } from "next/navigation";
import { getNewsById } from "@/lib/cms/news";
import { getNewsTags } from "@/lib/cms/news-tags";
import { NewsEditor } from "@/components/admin/news-editor";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export const dynamic = "force-dynamic";

/** `params` is a Promise in Next 16 — synchronous access was removed. */
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const item = await getNewsById((await params).id);
  const t = adminStrings(await adminLocale());
  return { title: item?.title || t.common.untitled };
}

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const [item, tags] = await Promise.all([getNewsById(id), getNewsTags()]);

  if (!item) notFound();

  return (
    <NewsEditor initialItem={item} tags={tags} isNew={false} />
  );
}

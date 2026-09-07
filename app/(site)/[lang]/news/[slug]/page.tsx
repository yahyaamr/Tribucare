import { redirect } from "next/navigation";
import { currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";

/** Old item URLs keep working — they point at the same record, now under
 *  `/events/<slug>`. See the note on the index route beside this one. */
export default async function NewsItemRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(localePath(await currentLocale(), `/events/${slug}`));
}

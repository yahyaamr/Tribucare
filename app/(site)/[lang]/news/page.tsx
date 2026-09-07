import { redirect } from "next/navigation";
import { currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";

/**
 * Events and news are one page now.
 *
 * This route stayed reachable — the sitemap listed it and the old items were
 * published under it — so it redirects rather than 404s. Nothing on the site
 * has ever linked here: the footer's "Events & News" and the homepage's
 * "See all events" both point at `/events`, which is why the panel appeared to
 * edit a page that never changed.
 */
export default async function NewsRedirectPage() {
  redirect(localePath(await currentLocale(), "/events"));
}

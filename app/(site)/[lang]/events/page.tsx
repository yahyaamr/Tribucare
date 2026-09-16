import type { Metadata } from "next";
import { EventsListing } from "./listing";
import { content, currentLocale } from "@/content/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content();
  const locale = await currentLocale();
  const m = ui.pageMeta.events;
  return pageMetadata({
    locale,
    path: "/events",
    title: m.title,
    description: m.description,
    ogTitle: m.ogTitle,
    ogDescription: m.ogDescription,
  });
}

export const revalidate = 3600;

/** The index itself lives in `listing.tsx`, because `/events/<tag>` is the
 *  same page with a filter on — see there. */
export default async function EventsListingPage() {
  return <EventsListing />;
}

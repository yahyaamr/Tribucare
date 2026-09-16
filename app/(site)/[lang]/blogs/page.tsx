import type { Metadata } from "next";
import { BlogListing } from "./listing";
import { content, currentLocale } from "@/content/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content();
  const locale = await currentLocale();
  return pageMetadata({
    locale,
    path: "/blogs",
    title: ui.blog.metaTitle,
    description: ui.blog.metaDescription,
    ogTitle: ui.blog.ogTitle,
  });
}

/** Refreshed on publish through `revalidateBlog`; the window is the backstop. */
export const revalidate = 3600;

/** The index itself lives in `listing.tsx`, because `/blogs/<category>` is the
 *  same page with a filter on — see there. */
export default async function BlogListingPage() {
  return <BlogListing />;
}

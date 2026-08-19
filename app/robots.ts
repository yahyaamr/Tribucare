import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Nothing on the site is private, so every route is crawlable. The one thing
 * this file really has to carry is the absolute sitemap URL — robots.txt is
 * where crawlers look for it first, and it is the only place in the sitemap
 * protocol where a relative path is not allowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

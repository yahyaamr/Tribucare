import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Every public route is crawlable. The blog admin is not a public route — it
 * is behind a password, and the pages themselves send `noindex`, but keeping
 * it out of robots.txt as well means a crawler never spends a request finding
 * that out.
 *
 * The other thing this file has to carry is the absolute sitemap URL:
 * robots.txt is where crawlers look for it first, and it is the one place in
 * the sitemap protocol where a relative path is not allowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

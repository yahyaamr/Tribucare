import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Every public route is crawlable, and the admin panel is not named here.
 *
 * It used to be, as `Disallow: /admin`. robots.txt is world-readable and is the
 * first thing a scanner fetches, so a disallow rule is an index of what is
 * worth attacking — it advertised the panel to precisely the audience it was
 * meant to keep out. Nothing is lost by dropping it: the panel already sends
 * `noindex, nofollow` on every page, and behind the knock gate an un-knocked
 * request to `/admin` gets the same 404 as any other unknown URL, so there is
 * nothing for a crawler to reach in the first place.
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
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

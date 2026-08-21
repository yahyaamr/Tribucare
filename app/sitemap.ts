import type { MetadataRoute } from "next";
import { blogPosts, type BlogPost } from "@/content/blogs";
import { products } from "@/content/dermatology";
import { siteUrl } from "@/lib/site";

/**
 * `lastModified` is only emitted where the date is genuinely known — the blog
 * posts carry their own publication date, and the two pages that surface them
 * inherit the newest of those. The marketing pages have no change signal to
 * report, so they omit the field: a `lastmod` stamped with the build time
 * would claim every deploy edited every page, which is the fastest way to get
 * crawlers to stop trusting the value at all.
 */

/**
 * Post dates are human-readable ("August 10, 2026"), so parsing can fail.
 *
 * They also carry no timezone, which makes `new Date` read them as local
 * midnight — on a machine east of UTC that serialises to 21:00 the *previous*
 * day, so the same post would date differently depending on where the site was
 * built. Re-pinning to UTC midnight keeps the output identical everywhere.
 */
function publishedAt(post: BlogPost): Date | undefined {
  const parsed = new Date(post.date);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return new Date(
    Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()),
  );
}

const postDates = blogPosts
  .map(publishedAt)
  .filter((date): date is Date => date !== undefined);

const newestPost = postDates.length
  ? new Date(Math.max(...postDates.map((date) => date.getTime())))
  : undefined;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      ...(newestPost ? { lastModified: newestPost } : {}),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/partner`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/dermatology`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: `${siteUrl}/dermatology/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/blog`,
      ...(newestPost ? { lastModified: newestPost } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPosts.map((post) => {
      const date = publishedAt(post);
      return {
        url: `${siteUrl}/blog/${post.slug}`,
        ...(date ? { lastModified: date } : {}),
        changeFrequency: "yearly" as const,
        priority: 0.6,
      };
    }),
  ];
}

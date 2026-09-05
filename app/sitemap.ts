import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/cms/posts";
import { getPublishedNews } from "@/lib/cms/news";
import type { NewsItem, Post } from "@/lib/cms/types";
import { getContent } from "@/content";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localePath,
  type Locale,
} from "@/lib/i18n/config";
import { siteUrl } from "@/lib/site";

/**
 * `lastModified` is only emitted where the date is genuinely known — the blog
 * posts carry their own publication date, and the two pages that surface them
 * inherit the newest of those. The marketing pages have no change signal to
 * report, so they omit the field: a `lastmod` stamped with the build time
 * would claim every deploy edited every page, which is the fastest way to get
 * crawlers to stop trusting the value at all.
 *
 * Every page is listed once per locale, each entry carrying `alternates` that
 * name both. That is what tells a crawler the two URLs are the same page in
 * two languages rather than duplicate content — without it the Arabic site
 * competes with the English one instead of serving Arabic searchers.
 */

/**
 * Post dates are stored as `yyyy-mm-dd` with no timezone, which makes
 * `new Date` read them as local midnight — on a machine east of UTC that
 * serialises to 21:00 the *previous* day, so the same post would date
 * differently depending on where the site was rendered. Parsing the parts
 * into UTC midnight keeps the output identical everywhere.
 */
function publishedAt(post: Post | NewsItem): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(post.date);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

/** The `alternates.languages` map for one path, in the shape Next expects. */
function alternatesFor(path: string) {
  return {
    languages: {
      ...Object.fromEntries(
        LOCALES.map((locale) => [
          locale,
          `${siteUrl}${localePath(locale, path)}`,
        ]),
      ),
      // The version a searcher gets when neither language matches theirs —
      // English, which holds the site's established URLs.
      "x-default": `${siteUrl}${localePath(DEFAULT_LOCALE, path)}`,
    },
  };
}

/** One entry per locale for a path, each pointing at all of them. */
function entry(
  path: string,
  options: {
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    lastModified?: Date;
  },
): MetadataRoute.Sitemap {
  return LOCALES.map((locale: Locale) => ({
    url: `${siteUrl}${localePath(locale, path)}`,
    ...(options.lastModified ? { lastModified: options.lastModified } : {}),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: alternatesFor(path),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogPosts, newsItems] = await Promise.all([
    getPublishedPosts(),
    getPublishedNews(),
  ]);
  // Product slugs are shared across locales, so the default bundle lists them
  // for both.
  const { products } = getContent();

  const postDates = blogPosts
    .map(publishedAt)
    .filter((date): date is Date => date !== undefined);

  const newestPost = postDates.length
    ? new Date(Math.max(...postDates.map((date) => date.getTime())))
    : undefined;

  const newsDates = newsItems
    .map(publishedAt)
    .filter((date): date is Date => date !== undefined);

  const newestNews = newsDates.length
    ? new Date(Math.max(...newsDates.map((date) => date.getTime())))
    : undefined;

  return [
    ...entry("/", {
      changeFrequency: "monthly",
      priority: 1,
      lastModified: newestPost,
    }),
    ...entry("/partner", { changeFrequency: "monthly", priority: 0.8 }),
    ...entry("/dermatology", { changeFrequency: "monthly", priority: 0.9 }),
    ...products.flatMap((product) =>
      entry(`/dermatology/${product.slug}`, {
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    ...entry("/mlay", { changeFrequency: "monthly", priority: 0.8 }),
    ...entry("/altesse-soin", { changeFrequency: "monthly", priority: 0.8 }),
    ...entry("/events", { changeFrequency: "weekly", priority: 0.8 }),
    ...entry("/blog", {
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: newestPost,
    }),
    ...blogPosts.flatMap((post) =>
      entry(`/blog/${post.slug}`, {
        changeFrequency: "yearly",
        priority: 0.6,
        lastModified: publishedAt(post),
      }),
    ),
    ...entry("/news", {
      changeFrequency: "weekly",
      priority: 0.8,
      lastModified: newestNews,
    }),
    ...newsItems.flatMap((item) =>
      entry(`/news/${item.slug}`, {
        changeFrequency: "yearly",
        priority: 0.6,
        lastModified: publishedAt(item),
      }),
    ),
  ];
}

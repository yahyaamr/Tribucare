import { getStore } from "./store";
import { newBlockId, newId, slugify, todayIso } from "./format";
import type { Block, NewsItem, NewsSummary, PostStatus } from "./types";

/**
 * Storage and validation for news items.
 *
 * Deliberately a sibling of `posts.ts` rather than a generalisation of it. The
 * two share a store and a block model, but nothing else: a news
 * item lives under its own prefix, carries its own vocabulary, and is read and
 * written by its own routes. That separation is the guarantee the news admin
 * cannot reach the blog — there is no shared mutable state for it to reach
 * through.
 *
 * Unlike posts there is no seed. The blog inherited six hand-written articles
 * from `content/blogs.ts`; news starts empty and fills up from the panel, so
 * there is nothing to migrate and no marker file to keep.
 */

const NEWS_PREFIX = "cms/news/";

const newsPath = (id: string) => `${NEWS_PREFIX}${id}.json`;

/* ------------------------------------------------------------------ read -- */

function parseNews(raw: string): NewsItem | null {
  try {
    const value = JSON.parse(raw) as NewsItem & {
      /** Tolerated on read so a record written with a single tag still loads. */
      tag?: string;
      /** News carried a byline briefly. Read off and discarded rather than
       *  spread through, so it is not written back on the next save. */
      authorId?: string;
    };
    // Unroutable and unkeyable, so worse than absent — same rule as posts.
    if (!value?.id || !value?.slug) return null;

    const tags = Array.isArray(value.tags)
      ? value.tags
      : value.tag
        ? [value.tag]
        : [];

    const { authorId, tag, ...rest } = value;
    void authorId;
    void tag;

    return {
      ...rest,
      tags: tags.filter((t) => typeof t === "string" && t.trim()),
      blocks: Array.isArray(value.blocks) ? value.blocks : [],
      seo: value.seo ?? { metaTitle: "", metaDescription: "" },
      featured: Boolean(value.featured),
    };
  } catch {
    return null;
  }
}

/** Newest first; ties broken by most recently touched, so a just-saved draft
 *  sits at the top of the admin list where its editor left it. */
function byDateDesc(a: NewsItem, b: NewsItem) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.updatedAt < b.updatedAt ? 1 : -1;
}

async function readAllNews(): Promise<NewsItem[]> {
  const store = getStore();

  let objects;
  try {
    objects = await store.list(NEWS_PREFIX);
  } catch {
    // Storage unreachable. An empty list renders an empty state; throwing
    // would 500 the public page.
    return [];
  }

  const items = await Promise.all(
    objects
      .filter((o) => o.pathname.endsWith(".json"))
      .map(async (o) => {
        const raw = await store.read(o.pathname).catch(() => null);
        return raw ? parseNews(raw) : null;
      }),
  );

  return items.filter((n): n is NewsItem => n !== null).sort(byDateDesc);
}

export async function getAllNews(): Promise<NewsItem[]> {
  return readAllNews();
}

export async function getPublishedNews(): Promise<NewsItem[]> {
  return (await getAllNews()).filter((n) => n.status === "published");
}

export async function getNewsSummaries(): Promise<NewsSummary[]> {
  const items = await getAllNews();
  return items.map(({ blocks, ...rest }) => {
    void blocks;
    return rest;
  });
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const raw = await getStore()
    .read(newsPath(id))
    .catch(() => null);
  return raw ? parseNews(raw) : null;
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  return (await getAllNews()).find((n) => n.slug === slug) ?? null;
}

/**
 * Every tag actually carried by a published item.
 *
 * What the public filter row offers, so a tab can never return an empty list —
 * the same rule `getPublicCategories` follows for the blog.
 */
export async function getPublicNewsTags(): Promise<string[]> {
  const items = await getPublishedNews();
  const seen = new Map<string, string>();
  for (const tag of items.flatMap((n) => n.tags)) {
    const key = tag.toLowerCase();
    if (!seen.has(key)) seen.set(key, tag);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

/* ----------------------------------------------------------------- write -- */

/** Appends `-2`, `-3`… until free. `excludeId` lets an item keep its own slug
 *  when saved without renaming. Scoped to news, so a news item and a post may
 *  share a slug — they live on different routes. */
export async function uniqueNewsSlug(desired: string, excludeId?: string) {
  const base = slugify(desired) || "news";
  const items = await getAllNews();
  const taken = new Set(
    items.filter((n) => n.id !== excludeId).map((n) => n.slug),
  );

  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function emptyNews(): NewsItem {
  const now = new Date().toISOString();
  return {
    id: newId("n"),
    slug: "",
    title: "",
    excerpt: "",
    tags: [],
    status: "draft",
    date: todayIso(),
    image: "",
    featured: false,
    blocks: [{ id: newBlockId(), type: "lead", text: "" } as Block],
    seo: { metaTitle: "", metaDescription: "" },
    createdAt: now,
    updatedAt: now,
  };
}

export async function saveNews(item: NewsItem): Promise<NewsItem> {
  const next: NewsItem = {
    ...item,
    updatedAt: new Date().toISOString(),
  };

  // Exactly one item leads the index; a second would silently not show.
  if (next.featured) {
    const others = (await getAllNews()).filter(
      (n) => n.id !== next.id && n.featured,
    );
    const store = getStore();
    for (const other of others) {
      await store.put(
        newsPath(other.id),
        JSON.stringify({ ...other, featured: false }, null, 2),
        "application/json",
      );
    }
  }

  await getStore().put(
    newsPath(next.id),
    JSON.stringify(next, null, 2),
    "application/json",
  );
  return next;
}

export async function deleteNews(id: string) {
  await getStore().del(newsPath(id));
}

/* ------------------------------------------------------------ validation -- */

export interface NewsErrors {
  [field: string]: string;
}

/**
 * Only what genuinely breaks a rendered page.
 *
 * Tags are *not* required to publish, unlike a post's categories. The blog's
 * filter row is built from a stored vocabulary and a category-less post would
 * fall out of it; the news filter row is built from the tags items actually
 * carry, so an untagged item still appears under "All".
 */
export function validateNews(item: NewsItem, status: PostStatus): NewsErrors {
  const errors: NewsErrors = {};

  if (!item.title.trim()) errors.title = "A title is required.";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
    errors.date = "Give the news a date.";
  }

  if (status === "published") {
    if (!item.excerpt.trim()) {
      errors.excerpt =
        "A summary is required to publish — it is the card and search description.";
    }
    if (item.blocks.length === 0) {
      errors.blocks = "Add some content before publishing.";
    }
  }

  return errors;
}

/** Re-exported so a server caller has one import for everything news-related. */
export { formatPostDate as formatNewsDate, todayIso, slugify } from "./format";

export type { NewsItem, NewsSummary };

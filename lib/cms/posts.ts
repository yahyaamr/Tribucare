import { getStore } from "./store";
import {
  countWords,
  newBlockId,
  newId,
  slugify,
  todayIso,
} from "./format";
import { ensureAuthorsFor, getAuthorMap, legacyAuthorId } from "./authors";
import type {
  Author,
  Block,
  Post,
  PostStatus,
  PostSummary,
  ResolvedPost,
} from "./types";
import { blogPosts as seedPosts, type BlogPost } from "@/content/blogs";

const POSTS_PREFIX = "cms/posts/";
/** Written once the seed has run, so emptying the blog stays empty rather than
 *  resurrecting the six starter articles on the next page load. */
const SEED_MARKER = "cms/seeded.json";

const postPath = (id: string) => `${POSTS_PREFIX}${id}.json`;

/**
 * Re-exported so server callers have one import for everything post-related.
 * The definitions live in `./format` because the editor and the article view
 * need them on the client, where this file's storage imports cannot follow.
 */
export {
  slugify,
  formatPostDate,
  todayIso,
  countWords,
  computeReadTime,
  readTimeFor,
  newBlockId,
} from "./format";

/* ------------------------------------------------------------- seed ------ */

/** Legacy `content` → ordered blocks.
 *
 *  The order here reproduces the old article template exactly: it rendered the
 *  takeaways panel above the intro, then the intro, then each section as an h2
 *  plus a paragraph, then the pull-quote. Seeded posts therefore look
 *  identical to how they looked before the CMS existed. */
function legacyToBlocks(post: BlogPost): Block[] {
  const blocks: Block[] = [];

  if (post.content.keyTakeaways?.length) {
    blocks.push({
      id: newBlockId(),
      type: "takeaways",
      items: [...post.content.keyTakeaways],
    });
  }

  blocks.push({ id: newBlockId(), type: "lead", text: post.content.intro });

  for (const section of post.content.sections) {
    blocks.push({ id: newBlockId(), type: "heading", text: section.title });
    blocks.push({ id: newBlockId(), type: "paragraph", text: section.body });
  }

  if (post.content.quote) {
    blocks.push({ id: newBlockId(), type: "quote", text: post.content.quote });
  }

  return blocks;
}

/** The seed dates are free text ("August 10, 2026"). Parse them back to ISO so
 *  the stored records are sortable; fall back to today if one is unreadable. */
function legacyDateToIso(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return todayIso();
  return new Date(
    Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()),
  )
    .toISOString()
    .slice(0, 10);
}

function legacyToPost(post: BlogPost): Post {
  const blocks = legacyToBlocks(post);
  const now = new Date().toISOString();
  return {
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    categories: [post.category],
    status: "published",
    date: legacyDateToIso(post.date),
    readTime: post.readTime,
    authorId: legacyAuthorId(post.author.name),
    image: post.image,
    featured: Boolean(post.featured),
    blocks,
    seo: { metaTitle: "", metaDescription: "" },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Copies content/blogs.ts into the store the first time the CMS is used.
 *
 * Runs at most once per store: the marker file means a deliberately emptied
 * blog stays empty. Failures are swallowed rather than thrown — a blog that
 * renders no posts is a much better outcome than a blog that 500s, and the
 * only way this fails is a missing/incorrect blob token, which the admin
 * panel reports directly.
 */
async function ensureSeeded() {
  const store = getStore();
  try {
    if (await store.read(SEED_MARKER)) return;

    const existing = await store.list(POSTS_PREFIX);
    if (existing.length === 0) {
      for (const legacy of seedPosts) {
        const post = legacyToPost(legacy);
        await store.put(
          postPath(post.id),
          JSON.stringify(post, null, 2),
          "application/json",
        );
      }
    }

    await store.put(
      SEED_MARKER,
      JSON.stringify({ seededAt: new Date().toISOString() }),
      "application/json",
    );
  } catch {
    // Storage is unreachable. Callers degrade to an empty list.
  }
}

/* ------------------------------------------------------------------ read -- */

function parsePost(raw: string): Post | null {
  try {
    // Read loosely: records written before a post could hold several
    // categories carry a single `category` string instead.
    const value = JSON.parse(raw) as Post & {
      category?: string;
      author?: { name?: string; role?: string; avatar?: string };
    };
    // A record missing either of these cannot be routed or keyed, so it is
    // worse than absent.
    if (!value?.id || !value?.slug) return null;

    // Migrated on read rather than through a one-off script, so an older
    // record keeps working whether or not anyone has re-saved it.
    const categories = Array.isArray(value.categories)
      ? value.categories
      : value.category
        ? [value.category]
        : [];

    // Same treatment for the byline: records written when the author was
    // three inline fields resolve to the id derived from the name, which is
    // the id `ensureAuthorsFor` gives that person in the author list.
    const authorId =
      typeof value.authorId === "string"
        ? value.authorId
        : legacyAuthorId(value.author?.name ?? "");

    return {
      ...value,
      authorId,
      categories: categories.filter((c) => c.trim()),
      blocks: Array.isArray(value.blocks) ? value.blocks : [],
      seo: value.seo ?? { metaTitle: "", metaDescription: "" },
      featured: Boolean(value.featured),
    };
  } catch {
    return null;
  }
}

/** Newest first, with drafts ahead of published posts of the same date so
 *  work in progress is the first thing the admin list shows. */
function byDateDesc(a: Post, b: Post) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.updatedAt < b.updatedAt ? 1 : -1;
}

/** Stored records, unresolved. Only `savePost` and the resolver want these. */
async function readAllPosts(): Promise<Post[]> {
  await ensureSeeded();
  const store = getStore();

  let objects;
  try {
    objects = await store.list(POSTS_PREFIX);
  } catch {
    return [];
  }

  const posts = await Promise.all(
    objects
      .filter((o) => o.pathname.endsWith(".json"))
      .map(async (o) => {
        const raw = await store.read(o.pathname).catch(() => null);
        return raw ? parsePost(raw) : null;
      }),
  );

  return posts.filter((p): p is Post => p !== null).sort(byDateDesc);
}

/**
 * Every post, with its author attached.
 *
 * The back-fill runs here rather than in the seed because a post can also
 * arrive with an inline byline from an older record that was never re-saved.
 * `ensureAuthorsFor` is idempotent, so once the list holds everyone this is a
 * single read.
 */
export async function getAllPosts(): Promise<ResolvedPost[]> {
  const posts = await readAllPosts();

  const inline = posts
    .map((post) => (post as Post & { author?: Author }).author)
    .filter((a): a is Author => Boolean(a?.name));
  if (inline.length > 0) await ensureAuthorsFor(inline);

  const authors = await getAuthorMap();
  return posts.map((post) => ({
    ...post,
    author: authors.get(post.authorId) ?? null,
  }));
}

export async function getPublishedPosts(): Promise<ResolvedPost[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.status === "published");
}

export async function getPostSummaries(): Promise<PostSummary[]> {
  const posts = await getAllPosts();
  return posts.map(({ blocks, ...rest }) => {
    void blocks;
    return rest;
  });
}

export async function getPostById(id: string): Promise<ResolvedPost | null> {
  await ensureSeeded();
  const raw = await getStore()
    .read(postPath(id))
    .catch(() => null);
  const post = raw ? parsePost(raw) : null;
  if (!post) return null;

  const authors = await getAuthorMap();
  return { ...post, author: authors.get(post.authorId) ?? null };
}

export async function getPostBySlug(slug: string): Promise<ResolvedPost | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/* ----------------------------------------------------------------- write -- */

/** Appends `-2`, `-3`… until the slug is free. `excludeId` lets a post keep
 *  its own slug when it is saved without renaming. */
export async function uniqueSlug(desired: string, excludeId?: string) {
  const base = slugify(desired) || "post";
  const posts = await getAllPosts();
  const taken = new Set(
    posts.filter((p) => p.id !== excludeId).map((p) => p.slug),
  );

  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function emptyPost(): Post {
  const now = new Date().toISOString();
  return {
    id: newId("p"),
    slug: "",
    title: "",
    excerpt: "",
    categories: [],
    status: "draft",
    date: todayIso(),
    readTime: "",
    authorId: "",
    image: "",
    featured: false,
    blocks: [{ id: newBlockId(), type: "lead", text: "" }],
    seo: { metaTitle: "", metaDescription: "" },
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Drops the resolved `author` before writing.
 *
 * Callers hand back whatever `getPostById` / `getAllPosts` gave them, which
 * carries the looked-up author alongside the reference. Storing that copy would
 * re-create exactly the problem the reference exists to solve: a stale name
 * frozen into the post, which `parsePost` would then have to disambiguate
 * against the live record.
 */
function toStored(post: Post | ResolvedPost): Post {
  const { author, ...rest } = post as ResolvedPost;
  void author;
  return rest;
}

export async function savePost(post: Post | ResolvedPost): Promise<Post> {
  const next: Post = { ...toStored(post), updatedAt: new Date().toISOString() };

  // Exactly one post can be featured — the /blog index promotes a single
  // article, so a second one silently wouldn't show.
  if (next.featured) {
    const others = (await getAllPosts()).filter(
      (p) => p.id !== next.id && p.featured,
    );
    const store = getStore();
    for (const other of others) {
      await store.put(
        postPath(other.id),
        JSON.stringify({ ...other, featured: false }, null, 2),
        "application/json",
      );
    }
  }

  await getStore().put(
    postPath(next.id),
    JSON.stringify(next, null, 2),
    "application/json",
  );
  return next;
}

export async function deletePost(id: string) {
  await getStore().del(postPath(id));
}

/* ------------------------------------------------------------ validation -- */

export interface PostErrors {
  [field: string]: string;
}

/** Only the things that genuinely break a rendered page are errors. Everything
 *  else (no cover image, no author) degrades gracefully and is left to the
 *  author's judgement. */
export function validatePost(post: Post, status: PostStatus): PostErrors {
  const errors: PostErrors = {};

  if (!post.title.trim()) errors.title = "A title is required.";

  if (status === "published") {
    if (!post.excerpt.trim()) {
      errors.excerpt =
        "An excerpt is required to publish — it is the card and search description.";
    }
    if (post.categories.length === 0) {
      errors.categories = "Choose at least one category to publish.";
    }
    if (countWords(post.blocks) === 0) {
      errors.blocks = "Add some content before publishing.";
    }
  }

  return errors;
}

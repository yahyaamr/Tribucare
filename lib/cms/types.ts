/**
 * The blog CMS data model.
 *
 * The public site used to read a hand-edited `BlogPost[]` out of
 * content/blogs.ts. That array is now the *seed* — the shapes below are what
 * the admin panel writes and what every blog surface reads.
 *
 * The one substantive change is the article body. `content` was a fixed shape
 * (`intro`, `sections[]`, an optional `quote` and `keyTakeaways`), which meant
 * an author could only ever fill in those slots, in that order. It is now an
 * ordered `blocks[]`, which is what makes a WordPress-style editor possible:
 * add, reorder and delete. Every block type below is something the article
 * template already knew how to render, so nothing new enters the design — see
 * `components/blog/article-body.tsx`, which is the single renderer for both the
 * published page and the editor's preview.
 */

/** A block's `id` is client-generated and only ever used as a React key and a
 *  drag handle — it is never a database key, so collisions across posts are
 *  harmless. */
export type Block =
  /** The opening paragraph. Renders one size up from body copy, as the old
   *  `content.intro` did. */
  | { id: string; type: "lead"; text: string }
  /** An `h2` inside the article body. */
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "paragraph"; text: string }
  /** A plain bulleted list. */
  | { id: string; type: "list"; items: string[] }
  /** The dark pull-quote. `attribution` defaults to the house line the article
   *  template has always used. */
  | { id: string; type: "quote"; text: string; attribution?: string }
  /** The mint "Key Takeaways" panel. */
  | { id: string; type: "takeaways"; items: string[] }
  | { id: string; type: "image"; src: string; alt: string; caption?: string };

export type BlockType = Block["type"];

export type PostStatus = "draft" | "published";

export interface Author {
  /** Stable. Renaming an author keeps the id, so every post that references
   *  them follows the rename rather than being orphaned. */
  id: string;
  name: string;
  role: string;
  /** May be empty — the article and card templates fall back to initials. */
  avatar: string;
}

export interface Post {
  /** Stable identity. The slug can be edited freely without breaking the
   *  editor's URL or orphaning the stored record. */
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** A post can sit in several categories. The first is treated as the
   *  primary one wherever there is only room for a single badge — the article
   *  card's floating pill, the admin list row. */
  categories: string[];
  status: PostStatus;
  /** Publication date as an ISO `yyyy-mm-dd` string. The long-form label the
   *  cards and article header show is derived at render time by
   *  `formatPostDate`, so the stored value stays sortable and unambiguous —
   *  the old free-text "August 10, 2026" was neither. */
  date: string;
  /** Author-overridable. Empty means "compute it from the word count". */
  readTime: string;
  /** A reference, not a copy. Authors are managed once in Settings, so
   *  correcting a name or a photo updates every post they wrote instead of
   *  needing each one re-edited. Empty means the post has no byline. */
  authorId: string;
  /** Cover image. Drives the card, the article hero and the OG image. */
  image: string;
  featured: boolean;
  blocks: Block[];
  seo: {
    /** Both fall back to `title` / `excerpt` when blank. */
    metaTitle: string;
    metaDescription: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * A post with its author reference resolved.
 *
 * `Post` is what is stored; this is what is rendered. Everything that reads
 * posts gets this shape, so no component has to know that `authorId` exists or
 * go looking the author up for itself. `author` is null when the post has no
 * byline, or when its author has since been deleted.
 */
export interface ResolvedPost extends Post {
  author: Author | null;
}

/** What the admin list view needs. Deliberately excludes `blocks`, which is by
 *  far the largest field and never rendered in a list. */
export type PostSummary = Omit<ResolvedPost, "blocks">;

export interface MediaItem {
  /** The blob pathname, e.g. `cms/media/1712345678-hero.webp`. Doubles as the
   *  delete key, so it is URL-encoded wherever it travels in a route. */
  pathname: string;
  /** What goes into `<Image src>`. */
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

/* -------------------------------------------------------------- news ----- */

/**
 * A news item.
 *
 * A deliberately separate record type from `Post`, not a flag on it. The two
 * are different things to a reader — an article is written, a news item is
 * announced — and keeping them apart is what lets the news vocabulary
 * (`tags`) evolve without touching the blog's categories, which is the whole
 * point of managing them separately.
 *
 * The body reuses `Block`, so the editor, the block renderer and the article
 * template are shared rather than reimplemented. Everything that differs is
 * the metadata around it.
 *
 * There is deliberately no byline. An announcement is published by the company,
 * not by a person, so a news item carries no author — which is also why there
 * is no `ResolvedNews`: with nothing to resolve, the stored shape is the
 * rendered shape.
 */
export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /**
   * The news vocabulary. Stored and managed entirely apart from a post's
   * `categories`: renaming or deleting a news tag can never reach the blog,
   * and vice versa.
   */
  tags: string[];
  status: PostStatus;
  /** ISO `yyyy-mm-dd`. The date the news is *dated*, which is what the index
   *  sorts on and the item header shows. */
  date: string;
  image: string;
  /** Exactly one item leads the index, the same way one post leads /blog. */
  featured: boolean;
  blocks: Block[];
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** What the admin list needs — everything but the body. */
export type NewsSummary = Omit<NewsItem, "blocks">;

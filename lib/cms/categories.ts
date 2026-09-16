import { getStore } from "./store";
import { getAllPosts, getAllPostsStrict, savePost } from "./posts";
import { slugifyTaxonomy } from "./format";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { blogCategories } from "@/content/blogs";

/**
 * The category list.
 *
 * The store owns it. The four categories in `content/blogs.ts` are copied in
 * once, the first time the list is read, exactly as the six starter posts are —
 * after that the file is the single source of truth and every category is
 * equally editable.
 *
 * It was briefly modelled the other way, with those four treated as permanent
 * built-ins unioned in at read time. That made renaming one impossible in a way
 * that failed *silently*: the rename wrote the new name, the hardcoded old name
 * came straight back on the next read, and the blog ended up showing both. A
 * category the panel offers to rename has to actually be renameable.
 *
 * What is read is the stored list unioned with whatever the posts actually
 * carry, so a category can never be missing from the list while a post is still
 * filed under it.
 *
 * A category belongs to **one language**. "Skincare Science" and "رول اون" are
 * not two spellings of one shelf, they are the shelves of two different sites,
 * and offering both while writing an Arabic post is offering half a list that
 * cannot be used. The language is stored on the record rather than guessed at
 * render time, because a guess reads the script — and an Arabic category
 * legitimately named `MLAY` has no Arabic script in it to read.
 *
 * The one place a guess is still made is the upgrade of a list written before
 * this field existed, which happens once. A category the posts already carry
 * needs no guess at all: it inherits the language of the post carrying it,
 * which is a fact rather than an inference.
 *
 * A category also has a **permalink**: `/blogs/<slug>` is its own page, the
 * index filtered to it, so a link can carry a filter and a sitemap can list
 * one URL per shelf. The slug is set once from the name and then *frozen* — a
 * rename does not move the page, because a moved page is a link that stops
 * working, and the panel exists to keep links working. It is editable on its
 * own, with that consequence spelled out.
 */

const CATEGORIES_PATH = "cms/categories.json";

/** A category, the language site it belongs to, and its permalink slug. */
export interface Category {
  name: string;
  locale: Locale;
  /** The last segment of `/blogs/<slug>`. Unique across both languages and
   *  never equal to an article's slug, because the two share that path. */
  slug: string;
}

/** The starter list is the English blog's, which is the only one that existed
 *  when it was written. */
const SEED: Category[] = blogCategories
  .filter((c) => c !== "All Articles")
  .map((name) => ({ name, locale: LOCALES[0], slug: slugifyTaxonomy(name) }));

/**
 * The language of a name written before categories had one.
 *
 * Script, because that is all a bare string offers. Used only to upgrade a
 * legacy list — never to classify anything written since, which carries its
 * language explicitly.
 */
const ARABIC = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

function guessLocale(name: string): Locale {
  return ARABIC.test(name) ? "ar" : LOCALES[0];
}

/**
 * The language a category carried on a post belongs to.
 *
 * A post that names exactly one language answers this outright. A record
 * written before the field existed names both, which answers nothing — so
 * those fall back to reading the script, the same one-time guess the stored
 * list gets. Without this, every category on a legacy post would be filed as
 * English, Arabic ones included.
 */
function localeOfPostCategory(name: string, locales: Locale[]): Locale {
  return locales.length === 1 ? locales[0] : guessLocale(name);
}

/** Trimmed, collapsed whitespace, capped. Two categories differing only by
 *  spacing would render as duplicate filter tabs. */
export function normaliseCategory(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 60);
}

/** A slug as typed, reduced to what a permalink may carry. Anything that is
 *  not a string is no slug at all. */
function normaliseSlug(value: unknown) {
  return typeof value === "string" ? slugifyTaxonomy(value) : "";
}

/**
 * Every slug in the list made distinct, in order, by numbering the later
 * duplicates — the same `-2`, `-3` an article slug gets.
 *
 * Two different names can slug the same way ("Skin Care" and "Skin-Care"),
 * and a legacy list is upgraded with a slug derived from each name, so the
 * list has to be squared up after any derivation. First seen keeps the plain
 * slug, which is why the stored list is always passed before anything derived.
 */
function ensureUniqueSlugs(categories: Category[]): Category[] {
  const seen = new Set<string>();
  return categories.map((category) => {
    const base = category.slug || "category";
    let slug = base;
    for (let n = 2; seen.has(slug); n += 1) slug = `${base}-${n}`;
    seen.add(slug);
    return slug === category.slug ? category : { ...category, slug };
  });
}

/**
 * `strict` splits rendering from writing. See `readAuthors` — a page degrades,
 * a writer stops. Strict also matters for the seed below: only a definite
 * absence may seed, never a read that merely failed.
 */
async function readStored(strict = false): Promise<Category[]> {
  const raw = strict
    ? await getStore().read(CATEGORIES_PATH)
    : await getStore()
        .read(CATEGORIES_PATH)
        .catch(() => null);

  // No file at all means the seed has never run. An *empty* file is a
  // deliberately emptied list and is left alone — the same distinction the
  // post seed makes.
  if (raw === null) {
    await writeStored(SEED).catch(() => {});
    return SEED;
  }
  if (!raw) return [];

  try {
    const value = JSON.parse(raw) as { categories?: unknown };
    if (!Array.isArray(value.categories)) return [];
    // Every earlier shape is read: a bare string is a record from before the
    // language existed, and an object without a slug is one from before the
    // permalink did. Both are upgraded on the spot, so the next write persists
    // them. Fields no longer carried — the notes a record briefly had — are
    // simply not read, and fall away on that same write.
    const upgraded = value.categories.flatMap((entry): Category[] => {
      if (typeof entry === "string") {
        const name = normaliseCategory(entry);
        return name
          ? [{ name, locale: guessLocale(name), slug: slugifyTaxonomy(name) }]
          : [];
      }
      if (entry && typeof entry === "object") {
        const record = entry as { name?: unknown; locale?: unknown; slug?: unknown };
        const name =
          typeof record.name === "string" ? normaliseCategory(record.name) : "";
        if (!name) return [];
        const locale = LOCALES.find((l) => l === record.locale) ?? guessLocale(name);
        return [
          { name, locale, slug: normaliseSlug(record.slug) || slugifyTaxonomy(name) },
        ];
      }
      return [];
    });
    return ensureUniqueSlugs(upgraded);
  } catch {
    return [];
  }
}

async function writeStored(categories: Category[]) {
  await getStore().put(
    CATEGORIES_PATH,
    JSON.stringify({ categories }, null, 2),
    "application/json",
  );
}

/**
 * Case-insensitive de-duplication that keeps the first record seen, so
 * "Skincare science" typed later does not shadow "Skincare Science".
 *
 * The key is the name alone and not the name plus its language: a category is
 * one shelf with one name, and letting the same name exist twice would make
 * the Settings list show two identical rows that rename and delete
 * differently. The first record seen wins, which is why the stored list is
 * passed before the one derived from posts — so a category's slug comes from
 * its stored record rather than being re-derived from its name.
 */
function dedupe(categories: Category[]) {
  const seen = new Map<string, Category>();
  for (const entry of categories) {
    const name = normaliseCategory(entry.name);
    if (!name) continue;
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, { name, locale: entry.locale, slug: entry.slug });
    }
  }
  return ensureUniqueSlugs([...seen.values()]);
}

/** Every category the panel knows about, each with the language site it
 *  belongs to and its slug. A category carried by a post inherits that post's
 *  language, and — until it is stored — a slug derived from its name. */
export async function getCategories(): Promise<Category[]> {
  const [stored, posts] = await Promise.all([readStored(), getAllPostsStrict()]);
  return dedupe([
    ...stored,
    ...posts.flatMap((post) =>
      post.categories.map((name) => ({
        name,
        locale: localeOfPostCategory(name, post.locales),
        slug: slugifyTaxonomy(name),
      })),
    ),
  ]).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The filter tabs one language's blog index shows, and the category pages
 * that language has.
 *
 * Only categories with a published post behind them *in this language*, so a
 * tab can never lead to an empty list and a category page cannot exist with
 * nothing on it. Read through `getCategories` rather than derived from the
 * posts alone, so each carries the slug its stored record holds.
 */
export async function getPublicCategories(locale: Locale): Promise<Category[]> {
  const [all, posts] = await Promise.all([getCategories(), getAllPosts()]);
  const carried = new Set(
    posts
      .filter((p) => p.status === "published" && p.locales.includes(locale))
      .flatMap((p) => p.categories.map((name) => name.toLowerCase())),
  );
  return all.filter(
    (c) => c.locale === locale && carried.has(c.name.toLowerCase()),
  );
}

/** The category a `/blogs/<slug>` request is for, if that page exists in this
 *  language. `null` is a 404, the same way an unknown article slug is. */
export async function findPublicCategory(
  slug: string,
  locale: Locale,
): Promise<Category | null> {
  const wanted = normaliseSlug(slug);
  if (!wanted) return null;
  return (
    (await getPublicCategories(locale)).find((c) => c.slug === wanted) ?? null
  );
}

/**
 * Why a slug cannot be used, or `null` when it can.
 *
 * Two things can already own it: another category, in either language, and
 * an article — `/blogs/<slug>` is one or the other, and the route tries the
 * article first, so a category on an article's address would be unreachable.
 * `except` is the category being edited, which may of course keep its own.
 */
async function slugConflict(
  slug: string,
  except?: string,
): Promise<string | null> {
  const [categories, posts] = await Promise.all([
    getCategories(),
    getAllPostsStrict(),
  ]);
  const key = except?.toLowerCase();
  const category = categories.find(
    (c) => c.slug === slug && c.name.toLowerCase() !== key,
  );
  if (category) {
    return `“${slug}” is already the permalink of “${category.name}”.`;
  }
  if (posts.some((p) => p.slug === slug)) {
    return `“${slug}” is already the address of an article. Give the category a different permalink.`;
  }
  return null;
}

/**
 * Creates a category. The slug is taken as given when one is sent and made
 * from the name otherwise — the editor's inline "Create" row sends only a
 * name, while Settings offers the permalink up front.
 */
export async function addCategory(
  name: string,
  locale: Locale,
  slug?: unknown,
): Promise<
  | { ok: true; category: string; categories: Category[] }
  | { ok: false; error: string }
> {
  const clean = normaliseCategory(name);
  if (!clean) return { ok: false, error: "Give the category a name." };

  const existing = await getCategories();
  const match = existing.find((c) => c.name.toLowerCase() === clean.toLowerCase());

  if (match) {
    // A name that already exists on the *other* site is refused rather than
    // quietly reused: selecting it would file this post under a category the
    // Settings list shows in the other language, and renaming it there would
    // silently rename it here.
    if (match.locale !== locale) {
      return {
        ok: false,
        error: `“${match.name}” already exists on the other language site. Give this one a different name.`,
      };
    }
    // Not an error: the caller wanted this category to exist, and it does.
    // Hand back the canonical spelling so the editor selects that rather than
    // adding a near-duplicate.
    return { ok: true, category: match.name, categories: existing };
  }

  const wanted = normaliseSlug(slug) || slugifyTaxonomy(clean) || "category";
  const conflict = await slugConflict(wanted);
  if (conflict) return { ok: false, error: conflict };

  const fresh: Category = { name: clean, locale, slug: wanted };
  const stored = await readStored(true);
  await writeStored([...stored, fresh]);

  return {
    ok: true,
    category: clean,
    categories: dedupe([...existing, fresh]).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}

/** What a category is attached to, and which of those posts would be left
 *  with no category at all if it were removed. */
export interface CategoryUsage {
  posts: { id: string; title: string; status: string; onlyCategory: boolean }[];
  /** Posts for which this is the *only* category. Deleting leaves them
   *  uncategorised, which is the thing worth warning about. */
  orphanCount: number;
}

export async function getCategoryUsage(name: string): Promise<CategoryUsage> {
  const clean = normaliseCategory(name).toLowerCase();
  const posts = await getAllPostsStrict();

  const using = posts.filter((p) =>
    p.categories.some((c) => c.toLowerCase() === clean),
  );

  const rows = using.map((p) => ({
    id: p.id,
    title: p.title || "(untitled)",
    status: p.status,
    onlyCategory: p.categories.length === 1,
  }));

  return { posts: rows, orphanCount: rows.filter((r) => r.onlyCategory).length };
}

/**
 * Renames a category everywhere at once — the stored list and every post
 * carrying it.
 *
 * Done as one operation rather than leaving the old name on posts, because a
 * half-renamed category shows up as two filter tabs on /blog, one of which is
 * the name nobody meant to keep.
 *
 * The slug stays. A renamed shelf is the same shelf, and its page is the same
 * page — moving it would break every link that was ever sent to it. The slug
 * has its own edit, `setCategorySlug`, for when moving is the intent.
 */
export async function renameCategory(
  from: string,
  to: string,
): Promise<{ ok: true; categories: Category[] } | { ok: false; error: string }> {
  const before = normaliseCategory(from);
  const after = normaliseCategory(to);

  if (!after) return { ok: false, error: "Give the category a name." };
  if (before === after) return { ok: true, categories: await getCategories() };

  const existing = await getCategories();
  if (
    existing.some(
      (c) =>
        c.name.toLowerCase() === after.toLowerCase() &&
        c.name.toLowerCase() !== before.toLowerCase(),
    )
  ) {
    return {
      ok: false,
      error: `“${after}” already exists. Rename it or merge by hand instead.`,
    };
  }

  const posts = await getAllPostsStrict();
  for (const post of posts) {
    if (!post.categories.some((c) => c.toLowerCase() === before.toLowerCase())) {
      continue;
    }
    // De-duplicated on write in case a post somehow held both spellings.
    const next = [
      ...new Set(
        post.categories.map((c) =>
          c.toLowerCase() === before.toLowerCase() ? after : c,
        ),
      ),
    ];
    await savePost({ ...post, categories: next });
  }

  const stored = await readStored(true);
  // A rename keeps the record's language and slug: renaming a shelf does not
  // move it to the other site, and does not move its page.
  const current =
    stored.find((c) => c.name.toLowerCase() === before.toLowerCase()) ??
    existing.find((c) => c.name.toLowerCase() === before.toLowerCase());
  const locale = current?.locale ?? LOCALES[0];
  const slug = current?.slug ?? slugifyTaxonomy(after);

  const renamed = stored.map((c) =>
    c.name.toLowerCase() === before.toLowerCase()
      ? { ...c, name: after, locale, slug }
      : c,
  );
  await writeStored(
    dedupe(
      renamed.some((c) => c.name.toLowerCase() === after.toLowerCase())
        ? renamed
        : [...renamed, { name: after, locale, slug }],
    ),
  );

  return { ok: true, categories: await getCategories() };
}

/**
 * Moves a category to the other language site.
 *
 * Needed because the language of a list written before the field existed is
 * inferred from its script, and a category legitimately named in Latin script
 * for the Arabic site — a brand name, a model number — is inferred wrongly.
 * Without this the only remedy would be deleting and re-creating it, which
 * strips it from every post it is on.
 *
 * The posts are untouched: they store the category's *name*, and the name has
 * not changed. What moves is which editor is offered it, and which language's
 * `/blogs/<slug>` answers for it.
 */
export async function setCategoryLocale(
  name: string,
  locale: Locale,
): Promise<{ ok: true; categories: Category[] } | { ok: false; error: string }> {
  const clean = normaliseCategory(name);
  if (!clean) return { ok: false, error: "No category given." };

  const stored = await readStored(true);
  const key = clean.toLowerCase();

  // A category that exists only because a post carries it has no stored
  // record yet; writing one is what makes the choice stick.
  const next = stored.some((c) => c.name.toLowerCase() === key)
    ? stored.map((c) => (c.name.toLowerCase() === key ? { ...c, locale } : c))
    : [...stored, { name: clean, locale, slug: slugifyTaxonomy(clean) }];

  await writeStored(dedupe(next));
  return { ok: true, categories: await getCategories() };
}

/**
 * Moves a category's page.
 *
 * Its own operation, deliberately apart from the rename, because the two have
 * opposite consequences: a rename changes what readers see and keeps every
 * link working, while this keeps what readers see and breaks every link to
 * the old address. The panel says so beside the field.
 *
 * The posts are untouched — they store the name, and the name has not moved.
 */
export async function setCategorySlug(
  name: string,
  slug: unknown,
): Promise<{ ok: true; categories: Category[] } | { ok: false; error: string }> {
  const clean = normaliseCategory(name);
  if (!clean) return { ok: false, error: "No category given." };

  const wanted = normaliseSlug(slug);
  if (!wanted) {
    return { ok: false, error: "Give the permalink some letters or numbers." };
  }

  const conflict = await slugConflict(wanted, clean);
  if (conflict) return { ok: false, error: conflict };

  const stored = await readStored(true);
  const key = clean.toLowerCase();
  const next = stored.some((c) => c.name.toLowerCase() === key)
    ? stored.map((c) => (c.name.toLowerCase() === key ? { ...c, slug: wanted } : c))
    : [
        ...stored,
        {
          name: clean,
          // A category known only from a post: keep the language the list
          // already reports for it rather than re-guessing from the script.
          locale:
            (await getCategories()).find((c) => c.name.toLowerCase() === key)
              ?.locale ?? guessLocale(clean),
          slug: wanted,
        },
      ];

  await writeStored(dedupe(next));
  return { ok: true, categories: await getCategories() };
}

/**
 * Removes a category. `force` also strips it from every post using it.
 *
 * Without `force` this reports what would happen instead of doing it, so the
 * panel can show exactly which posts are affected — and specifically which
 * would be left with no category — before anyone commits.
 */
export async function deleteCategory(
  name: string,
  force = false,
): Promise<
  | { ok: true; categories: Category[] }
  | { ok: false; error: string; usage?: CategoryUsage }
> {
  const clean = normaliseCategory(name);
  const usage = await getCategoryUsage(clean);

  if (usage.posts.length > 0 && !force) {
    return {
      ok: false,
      error: `“${clean}” is used by ${usage.posts.length} post${usage.posts.length === 1 ? "" : "s"}.`,
      usage,
    };
  }

  if (force && usage.posts.length > 0) {
    const posts = await getAllPostsStrict();
    for (const post of posts) {
      if (!post.categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
        continue;
      }
      await savePost({
        ...post,
        categories: post.categories.filter(
          (c) => c.toLowerCase() !== clean.toLowerCase(),
        ),
      });
    }
  }

  const stored = await readStored(true);
  await writeStored(
    stored.filter((c) => c.name.toLowerCase() !== clean.toLowerCase()),
  );
  return { ok: true, categories: await getCategories() };
}

import { getStore } from "./store";
import { getAllPosts, getAllPostsStrict, savePost } from "./posts";
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
 */

const CATEGORIES_PATH = "cms/categories.json";

/** A category and the language site it belongs to. */
export interface Category {
  name: string;
  locale: Locale;
}

/** The starter list is the English blog's, which is the only one that existed
 *  when it was written. */
const SEED: Category[] = blogCategories
  .filter((c) => c !== "All Articles")
  .map((name) => ({ name, locale: LOCALES[0] }));

/**
 * The language of a name written before categories had one.
 *
 * Script, because that is all a bare string offers. Used only to upgrade a
 * legacy list — never to classify anything written since, which carries its
 * language explicitly.
 */
const ARABIC = /[\u0600-\u06ff\u0750-\u077f\ufb50-\ufdff\ufe70-\ufeff]/;

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
    // Both shapes are read: a bare string is a record from before the language
    // existed and is upgraded on the spot, so the next write persists it.
    return value.categories.flatMap((entry): Category[] => {
      if (typeof entry === "string") {
        const name = normaliseCategory(entry);
        return name ? [{ name, locale: guessLocale(name) }] : [];
      }
      if (entry && typeof entry === "object") {
        const record = entry as { name?: unknown; locale?: unknown };
        const name =
          typeof record.name === "string" ? normaliseCategory(record.name) : "";
        if (!name) return [];
        const locale = LOCALES.find((l) => l === record.locale) ?? guessLocale(name);
        return [{ name, locale }];
      }
      return [];
    });
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
 * passed before the one derived from posts.
 */
function dedupe(categories: Category[]) {
  const seen = new Map<string, Category>();
  for (const entry of categories) {
    const name = normaliseCategory(entry.name);
    if (!name) continue;
    const key = name.toLowerCase();
    if (!seen.has(key)) seen.set(key, { name, locale: entry.locale });
  }
  return [...seen.values()];
}

/** Every category the panel knows about, each with the language site it
 *  belongs to. A category carried by a post inherits that post's language. */
export async function getCategories(): Promise<Category[]> {
  const [stored, posts] = await Promise.all([readStored(), getAllPostsStrict()]);
  return dedupe([
    ...stored,
    ...posts.flatMap((post) =>
      post.categories.map((name) => ({
        name,
        locale: localeOfPostCategory(name, post.locales),
      })),
    ),
  ]).sort((a, b) => a.name.localeCompare(b.name));
}

/** Only categories attached to a published post — what the /blog filter row
 *  offers, so a tab can never return an empty list. */
/**
 * The filter tabs one language's blog index shows.
 *
 * Scoped to the locale for the reason the unscoped version existed: a tab with
 * nothing behind it. Once a post can be English-only, counting its categories
 * on the Arabic index would put a tab there that filters to an empty list.
 */
export async function getPublicCategories(locale?: Locale): Promise<string[]> {
  const posts = await getAllPosts();
  return dedupe(
    posts
      .filter(
        (p) =>
          p.status === "published" &&
          (locale === undefined || p.locales.includes(locale)),
      )
      .flatMap((p) =>
        p.categories.map((name) => ({
          name,
          locale: localeOfPostCategory(name, p.locales),
        })),
      ),
  )
    .map((c) => c.name)
    .sort((a, b) => a.localeCompare(b));
}

export async function addCategory(
  name: string,
  locale: Locale,
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

  const stored = await readStored(true);
  await writeStored([...stored, { name: clean, locale }]);

  return {
    ok: true,
    category: clean,
    categories: dedupe([...existing, { name: clean, locale }]).sort((a, b) =>
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
  // A rename keeps the record's language: renaming a shelf does not move it to
  // the other site.
  const locale =
    stored.find((c) => c.name.toLowerCase() === before.toLowerCase())?.locale ??
    existing.find((c) => c.name.toLowerCase() === before.toLowerCase())?.locale ??
    LOCALES[0];

  const renamed = stored.map((c) =>
    c.name.toLowerCase() === before.toLowerCase() ? { name: after, locale } : c,
  );
  await writeStored(
    dedupe(
      renamed.some((c) => c.name.toLowerCase() === after.toLowerCase())
        ? renamed
        : [...renamed, { name: after, locale }],
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
 * not changed. What moves is which editor is offered it.
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
    : [...stored, { name: clean, locale }];

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

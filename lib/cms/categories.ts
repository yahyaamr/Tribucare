import { getStore } from "./store";
import { getAllPosts, savePost } from "./posts";
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
 */

const CATEGORIES_PATH = "cms/categories.json";

const SEED = blogCategories.filter((c) => c !== "All Articles");

/** Trimmed, collapsed whitespace, capped. Two categories differing only by
 *  spacing would render as duplicate filter tabs. */
export function normaliseCategory(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 60);
}

async function readStored(): Promise<string[]> {
  const raw = await getStore()
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
    return value.categories.filter((c): c is string => typeof c === "string");
  } catch {
    return [];
  }
}

async function writeStored(categories: string[]) {
  await getStore().put(
    CATEGORIES_PATH,
    JSON.stringify({ categories }, null, 2),
    "application/json",
  );
}

/** Case-insensitive de-duplication that keeps the first spelling seen, so
 *  "Skincare science" typed later does not shadow "Skincare Science". */
function dedupe(names: string[]) {
  const seen = new Map<string, string>();
  for (const name of names) {
    const clean = normaliseCategory(name);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) seen.set(key, clean);
  }
  return [...seen.values()];
}

export async function getCategories(): Promise<string[]> {
  const [stored, posts] = await Promise.all([readStored(), getAllPosts()]);
  return dedupe([
    ...stored,
    ...posts.flatMap((post) => post.categories),
  ]).sort((a, b) => a.localeCompare(b));
}

/** Only categories attached to a published post — what the /blog filter row
 *  offers, so a tab can never return an empty list. */
export async function getPublicCategories(): Promise<string[]> {
  const posts = await getAllPosts();
  return dedupe(
    posts.filter((p) => p.status === "published").flatMap((p) => p.categories),
  ).sort((a, b) => a.localeCompare(b));
}

export async function addCategory(
  name: string,
): Promise<{ ok: true; category: string; categories: string[] } | { ok: false; error: string }> {
  const clean = normaliseCategory(name);
  if (!clean) return { ok: false, error: "Give the category a name." };

  const existing = await getCategories();
  const match = existing.find((c) => c.toLowerCase() === clean.toLowerCase());
  // Not an error: the caller wanted this category to exist, and it does. Hand
  // back the canonical spelling so the editor selects that rather than adding
  // a near-duplicate.
  if (match) return { ok: true, category: match, categories: existing };

  const stored = await readStored();
  await writeStored([...stored, clean]);

  return {
    ok: true,
    category: clean,
    categories: dedupe([...existing, clean]).sort((a, b) => a.localeCompare(b)),
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
  const posts = await getAllPosts();

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
): Promise<{ ok: true; categories: string[] } | { ok: false; error: string }> {
  const before = normaliseCategory(from);
  const after = normaliseCategory(to);

  if (!after) return { ok: false, error: "Give the category a name." };
  if (before === after) return { ok: true, categories: await getCategories() };

  const existing = await getCategories();
  if (
    existing.some(
      (c) =>
        c.toLowerCase() === after.toLowerCase() &&
        c.toLowerCase() !== before.toLowerCase(),
    )
  ) {
    return {
      ok: false,
      error: `“${after}” already exists. Rename it or merge by hand instead.`,
    };
  }

  const posts = await getAllPosts();
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

  const stored = await readStored();
  const renamed = stored.map((c) =>
    c.toLowerCase() === before.toLowerCase() ? after : c,
  );
  await writeStored(
    dedupe(
      renamed.some((c) => c.toLowerCase() === after.toLowerCase())
        ? renamed
        : [...renamed, after],
    ),
  );

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
  | { ok: true; categories: string[] }
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
    const posts = await getAllPosts();
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

  const stored = await readStored();
  await writeStored(
    stored.filter((c) => c.toLowerCase() !== clean.toLowerCase()),
  );
  return { ok: true, categories: await getCategories() };
}

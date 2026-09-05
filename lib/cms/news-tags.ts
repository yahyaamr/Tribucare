import { getStore } from "./store";
import { getAllNews, saveNews } from "./news";

/**
 * The news tag vocabulary.
 *
 * A deliberate copy of `categories.ts` rather than a shared implementation,
 * because the requirement is precisely that the two cannot touch: renaming a
 * news tag must never rewrite a post, and deleting a blog category must never
 * reach a news item. Sharing one module parameterised by "kind" would put a
 * single wrong argument between the news panel and the blog's data — this way
 * there is no argument to get wrong. The two files are small and the duplicated
 * logic is stable; if you change one, read the other and decide deliberately
 * whether the change belongs there too.
 *
 * Unlike the blog's categories there is no seed list. The blog inherited four
 * categories from `content/blogs.ts`; news starts with nothing and the panel
 * fills it in, so a tag only ever exists because someone typed it.
 */

const TAGS_PATH = "cms/news-tags.json";

/** Trimmed, whitespace collapsed, capped. Two tags differing only by spacing
 *  would render as duplicate filter tabs. */
export function normaliseTag(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 60);
}

async function readStored(): Promise<string[]> {
  const raw = await getStore()
    .read(TAGS_PATH)
    .catch(() => null);

  if (!raw) return [];

  try {
    const value = JSON.parse(raw) as { tags?: unknown };
    if (!Array.isArray(value.tags)) return [];
    return value.tags.filter((t): t is string => typeof t === "string");
  } catch {
    return [];
  }
}

async function writeStored(tags: string[]) {
  await getStore().put(
    TAGS_PATH,
    JSON.stringify({ tags }, null, 2),
    "application/json",
  );
}

/** Case-insensitive de-duplication keeping the first spelling seen, so a
 *  "product launch" typed later does not shadow "Product Launch". */
function dedupe(names: string[]) {
  const seen = new Map<string, string>();
  for (const name of names) {
    const clean = normaliseTag(name);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) seen.set(key, clean);
  }
  return [...seen.values()];
}

/**
 * The stored list unioned with whatever items actually carry, so a tag can
 * never be missing from the panel while a news item is still filed under it.
 */
export async function getNewsTags(): Promise<string[]> {
  const [stored, items] = await Promise.all([readStored(), getAllNews()]);
  return dedupe([...stored, ...items.flatMap((n) => n.tags)]).sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function addNewsTag(
  name: string,
): Promise<
  { ok: true; tag: string; tags: string[] } | { ok: false; error: string }
> {
  const clean = normaliseTag(name);
  if (!clean) return { ok: false, error: "Give the tag a name." };

  const existing = await getNewsTags();
  const match = existing.find((t) => t.toLowerCase() === clean.toLowerCase());
  // Not an error: the caller wanted this tag to exist, and it does. Hand back
  // the canonical spelling so the editor selects that rather than adding a
  // near-duplicate.
  if (match) return { ok: true, tag: match, tags: existing };

  const stored = await readStored();
  await writeStored([...stored, clean]);

  return {
    ok: true,
    tag: clean,
    tags: dedupe([...existing, clean]).sort((a, b) => a.localeCompare(b)),
  };
}

/** What a tag is attached to, and which items would be left untagged. */
export interface NewsTagUsage {
  items: { id: string; title: string; status: string; onlyTag: boolean }[];
  /** Items for which this is the *only* tag — the thing worth warning about. */
  orphanCount: number;
}

export async function getNewsTagUsage(name: string): Promise<NewsTagUsage> {
  const clean = normaliseTag(name).toLowerCase();
  const items = await getAllNews();

  const using = items.filter((n) =>
    n.tags.some((t) => t.toLowerCase() === clean),
  );

  const rows = using.map((n) => ({
    id: n.id,
    title: n.title || "(untitled)",
    status: n.status,
    onlyTag: n.tags.length === 1,
  }));

  return { items: rows, orphanCount: rows.filter((r) => r.onlyTag).length };
}

/**
 * Renames a tag everywhere at once — the stored list and every item carrying
 * it — because a half-renamed tag shows up as two filter tabs on /news, one of
 * which nobody meant to keep.
 */
export async function renameNewsTag(
  from: string,
  to: string,
): Promise<{ ok: true; tags: string[] } | { ok: false; error: string }> {
  const before = normaliseTag(from);
  const after = normaliseTag(to);

  if (!after) return { ok: false, error: "Give the tag a name." };
  if (before === after) return { ok: true, tags: await getNewsTags() };

  const existing = await getNewsTags();
  if (
    existing.some(
      (t) =>
        t.toLowerCase() === after.toLowerCase() &&
        t.toLowerCase() !== before.toLowerCase(),
    )
  ) {
    return {
      ok: false,
      error: `“${after}” already exists. Rename it or merge by hand instead.`,
    };
  }

  for (const item of await getAllNews()) {
    if (!item.tags.some((t) => t.toLowerCase() === before.toLowerCase())) {
      continue;
    }
    const next = [
      ...new Set(
        item.tags.map((t) =>
          t.toLowerCase() === before.toLowerCase() ? after : t,
        ),
      ),
    ];
    await saveNews({ ...item, tags: next });
  }

  const stored = await readStored();
  const renamed = stored.map((t) =>
    t.toLowerCase() === before.toLowerCase() ? after : t,
  );
  await writeStored(
    dedupe(
      renamed.some((t) => t.toLowerCase() === after.toLowerCase())
        ? renamed
        : [...renamed, after],
    ),
  );

  return { ok: true, tags: await getNewsTags() };
}

/**
 * Removes a tag. `force` also strips it from every item using it.
 *
 * Without `force` this reports what would happen instead of doing it, so the
 * panel can name the affected items before anyone commits.
 */
export async function deleteNewsTag(
  name: string,
  force = false,
): Promise<
  | { ok: true; tags: string[] }
  | { ok: false; error: string; usage?: NewsTagUsage }
> {
  const clean = normaliseTag(name);
  const usage = await getNewsTagUsage(clean);

  if (usage.items.length > 0 && !force) {
    return {
      ok: false,
      error: `“${clean}” is used by ${usage.items.length} news item${usage.items.length === 1 ? "" : "s"}.`,
      usage,
    };
  }

  if (force && usage.items.length > 0) {
    for (const item of await getAllNews()) {
      if (!item.tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
        continue;
      }
      await saveNews({
        ...item,
        tags: item.tags.filter((t) => t.toLowerCase() !== clean.toLowerCase()),
      });
    }
  }

  const stored = await readStored();
  await writeStored(
    stored.filter((t) => t.toLowerCase() !== clean.toLowerCase()),
  );
  return { ok: true, tags: await getNewsTags() };
}

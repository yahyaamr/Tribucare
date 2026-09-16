import { getStore } from "./store";
import { getAllNews, getAllNewsStrict, saveNews } from "./news";
import { slugifyTaxonomy } from "./format";
import { LOCALES, type Locale } from "@/lib/i18n/config";

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
 *
 * A tag belongs to **one language**, on the same reasoning as a category:
 * "Congress" and "مؤتمرات" are not two spellings of one filter tab, they are
 * the tabs of two different sites, and offering both while writing an Arabic
 * item is offering half a list that cannot be used. The language is stored on
 * the record rather than guessed at render time, because a guess reads the
 * script — and an Arabic tag legitimately named `MLAY` has no Arabic script in
 * it to read.
 *
 * The one place a guess is still made is the upgrade of a list written before
 * this field existed, which happens once. A tag the items already carry needs
 * no guess at all: it inherits the language of the item carrying it, which is
 * a fact rather than an inference.
 *
 * A tag also has a **permalink**: `/events/<slug>` is its own page, the index
 * filtered to it. Set once from the name and then frozen — see the category
 * file for why a rename does not move a page — and editable on its own.
 */

const TAGS_PATH = "cms/news-tags.json";

/** A tag, the language site it belongs to, and its permalink slug. */
export interface NewsTag {
  name: string;
  locale: Locale;
  /** The last segment of `/events/<slug>`. Unique across both languages and
   *  never equal to an item's slug, because the two share that path. */
  slug: string;
}

/**
 * The language of a name written before tags had one.
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
 * The language a tag carried on an item belongs to.
 *
 * An item that names exactly one language answers this outright. A record
 * written before the field existed names both, which answers nothing — so
 * those fall back to reading the script, the same one-time guess the stored
 * list gets. Without this, every tag on a legacy item would be filed as
 * English, Arabic ones included.
 */
function localeOfItemTag(name: string, locales: Locale[]): Locale {
  return locales.length === 1 ? locales[0] : guessLocale(name);
}

/** Trimmed, whitespace collapsed, capped. Two tags differing only by spacing
 *  would render as duplicate filter tabs. */
export function normaliseTag(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 60);
}

function normaliseSlug(value: unknown) {
  return typeof value === "string" ? slugifyTaxonomy(value) : "";
}

/** Every slug in the list made distinct, in order — see the category file. */
function ensureUniqueSlugs(tags: NewsTag[]): NewsTag[] {
  const seen = new Set<string>();
  return tags.map((tag) => {
    const base = tag.slug || "tag";
    let slug = base;
    for (let n = 2; seen.has(slug); n += 1) slug = `${base}-${n}`;
    seen.add(slug);
    return slug === tag.slug ? tag : { ...tag, slug };
  });
}

/** `strict` splits rendering from writing. See `readAuthors`. */
async function readStored(strict = false): Promise<NewsTag[]> {
  const raw = strict
    ? await getStore().read(TAGS_PATH)
    : await getStore()
        .read(TAGS_PATH)
        .catch(() => null);

  if (!raw) return [];

  try {
    const value = JSON.parse(raw) as { tags?: unknown };
    if (!Array.isArray(value.tags)) return [];
    // Every earlier shape is read and upgraded on the spot — a bare string
    // from before the language existed, an object without a slug from before
    // the permalink did. Fields no longer carried are not read, and fall away
    // on the next write.
    const upgraded = value.tags.flatMap((entry): NewsTag[] => {
      if (typeof entry === "string") {
        const name = normaliseTag(entry);
        return name
          ? [{ name, locale: guessLocale(name), slug: slugifyTaxonomy(name) }]
          : [];
      }
      if (entry && typeof entry === "object") {
        const record = entry as { name?: unknown; locale?: unknown; slug?: unknown };
        const name =
          typeof record.name === "string" ? normaliseTag(record.name) : "";
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

async function writeStored(tags: NewsTag[]) {
  await getStore().put(
    TAGS_PATH,
    JSON.stringify({ tags }, null, 2),
    "application/json",
  );
}

/**
 * Case-insensitive de-duplication keeping the first record seen, so a
 * "product launch" typed later does not shadow "Product Launch".
 *
 * The key is the name alone and not the name plus its language: a tag is one
 * filter tab with one name, and letting the same name exist twice would make
 * the Settings list show two identical rows that rename and delete
 * differently. The first record seen wins, which is why the stored list is
 * passed before the one derived from items — so a tag's slug comes from its
 * stored record rather than being re-derived from its name.
 */
function dedupe(tags: NewsTag[]) {
  const seen = new Map<string, NewsTag>();
  for (const entry of tags) {
    const name = normaliseTag(entry.name);
    if (!name) continue;
    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, { name, locale: entry.locale, slug: entry.slug });
    }
  }
  return ensureUniqueSlugs([...seen.values()]);
}

/**
 * The stored list unioned with whatever items actually carry, so a tag can
 * never be missing from the panel while a news item is still filed under it.
 * A tag carried by an item inherits that item's language.
 */
export async function getNewsTags(): Promise<NewsTag[]> {
  const [stored, items] = await Promise.all([readStored(), getAllNewsStrict()]);
  return dedupe([
    ...stored,
    ...items.flatMap((item) =>
      item.tags.map((name) => ({
        name,
        locale: localeOfItemTag(name, item.locales),
        slug: slugifyTaxonomy(name),
      })),
    ),
  ]).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The filter tabs one language's events index shows, and the tag pages that
 * language has — only tags with a published item behind them in this
 * language, so neither a tab nor a page can be empty.
 */
export async function getPublicNewsTags(locale: Locale): Promise<NewsTag[]> {
  const [all, items] = await Promise.all([getNewsTags(), getAllNews()]);
  const carried = new Set(
    items
      .filter((n) => n.status === "published" && n.locales.includes(locale))
      .flatMap((n) => n.tags.map((name) => name.toLowerCase())),
  );
  return all.filter(
    (t) => t.locale === locale && carried.has(t.name.toLowerCase()),
  );
}

/** The tag an `/events/<slug>` request is for, if that page exists in this
 *  language. `null` is a 404, the same way an unknown item slug is. */
export async function findPublicNewsTag(
  slug: string,
  locale: Locale,
): Promise<NewsTag | null> {
  const wanted = normaliseSlug(slug);
  if (!wanted) return null;
  return (
    (await getPublicNewsTags(locale)).find((t) => t.slug === wanted) ?? null
  );
}

/** Why a slug cannot be used, or `null` when it can — see the category file. */
async function slugConflict(
  slug: string,
  except?: string,
): Promise<string | null> {
  const [tags, items] = await Promise.all([getNewsTags(), getAllNewsStrict()]);
  const key = except?.toLowerCase();
  const tag = tags.find((t) => t.slug === slug && t.name.toLowerCase() !== key);
  if (tag) return `“${slug}” is already the permalink of “${tag.name}”.`;
  if (items.some((n) => n.slug === slug)) {
    return `“${slug}” is already the address of an event or news item. Give the category a different permalink.`;
  }
  return null;
}

/**
 * Creates a tag. The slug is taken as given when one is sent and made from
 * the name otherwise — the editor's inline "Create" row sends only a name,
 * while Settings offers the permalink up front.
 */
export async function addNewsTag(
  name: string,
  locale: Locale,
  slug?: unknown,
): Promise<
  { ok: true; tag: string; tags: NewsTag[] } | { ok: false; error: string }
> {
  const clean = normaliseTag(name);
  if (!clean) return { ok: false, error: "Give the tag a name." };

  const existing = await getNewsTags();
  const match = existing.find((t) => t.name.toLowerCase() === clean.toLowerCase());

  if (match) {
    // A name that already exists on the *other* site is refused rather than
    // quietly reused: selecting it would file this item under a tag the
    // Settings list shows in the other language, and renaming it there would
    // silently rename it here.
    if (match.locale !== locale) {
      return {
        ok: false,
        error: `“${match.name}” already exists on the other language site. Give this one a different name.`,
      };
    }
    // Not an error: the caller wanted this tag to exist, and it does. Hand
    // back the canonical spelling so the editor selects that rather than
    // adding a near-duplicate.
    return { ok: true, tag: match.name, tags: existing };
  }

  const wanted = normaliseSlug(slug) || slugifyTaxonomy(clean) || "tag";
  const conflict = await slugConflict(wanted);
  if (conflict) return { ok: false, error: conflict };

  const fresh: NewsTag = { name: clean, locale, slug: wanted };
  const stored = await readStored(true);
  await writeStored([...stored, fresh]);

  return {
    ok: true,
    tag: clean,
    tags: dedupe([...existing, fresh]).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
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
  const items = await getAllNewsStrict();

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
 * it — because a half-renamed tag shows up as two filter tabs on /events, one
 * of which nobody meant to keep. The slug stays: a renamed tab is the same
 * page, and moving it would break every link sent to it.
 */
export async function renameNewsTag(
  from: string,
  to: string,
): Promise<{ ok: true; tags: NewsTag[] } | { ok: false; error: string }> {
  const before = normaliseTag(from);
  const after = normaliseTag(to);

  if (!after) return { ok: false, error: "Give the tag a name." };
  if (before === after) return { ok: true, tags: await getNewsTags() };

  const existing = await getNewsTags();
  if (
    existing.some(
      (t) =>
        t.name.toLowerCase() === after.toLowerCase() &&
        t.name.toLowerCase() !== before.toLowerCase(),
    )
  ) {
    return {
      ok: false,
      error: `“${after}” already exists. Rename it or merge by hand instead.`,
    };
  }

  for (const item of await getAllNewsStrict()) {
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

  const stored = await readStored(true);
  const current =
    stored.find((t) => t.name.toLowerCase() === before.toLowerCase()) ??
    existing.find((t) => t.name.toLowerCase() === before.toLowerCase());
  const locale = current?.locale ?? LOCALES[0];
  const slug = current?.slug ?? slugifyTaxonomy(after);

  const renamed = stored.map((t) =>
    t.name.toLowerCase() === before.toLowerCase()
      ? { ...t, name: after, locale, slug }
      : t,
  );
  await writeStored(
    dedupe(
      renamed.some((t) => t.name.toLowerCase() === after.toLowerCase())
        ? renamed
        : [...renamed, { name: after, locale, slug }],
    ),
  );

  return { ok: true, tags: await getNewsTags() };
}

/**
 * Moves a tag to the other language site. The items are untouched: they
 * store the tag's *name*, and the name has not changed. What moves is which
 * editor is offered it, and which language's `/events/<slug>` answers for it.
 */
export async function setNewsTagLocale(
  name: string,
  locale: Locale,
): Promise<{ ok: true; tags: NewsTag[] } | { ok: false; error: string }> {
  const clean = normaliseTag(name);
  if (!clean) return { ok: false, error: "No tag given." };

  const stored = await readStored(true);
  const key = clean.toLowerCase();

  const next = stored.some((t) => t.name.toLowerCase() === key)
    ? stored.map((t) => (t.name.toLowerCase() === key ? { ...t, locale } : t))
    : [...stored, { name: clean, locale, slug: slugifyTaxonomy(clean) }];

  await writeStored(dedupe(next));
  return { ok: true, tags: await getNewsTags() };
}

/** Moves a tag's page. Apart from the rename for the reason the category
 *  file gives: one keeps links working, the other breaks them. */
export async function setNewsTagSlug(
  name: string,
  slug: unknown,
): Promise<{ ok: true; tags: NewsTag[] } | { ok: false; error: string }> {
  const clean = normaliseTag(name);
  if (!clean) return { ok: false, error: "No tag given." };

  const wanted = normaliseSlug(slug);
  if (!wanted) {
    return { ok: false, error: "Give the permalink some letters or numbers." };
  }

  const conflict = await slugConflict(wanted, clean);
  if (conflict) return { ok: false, error: conflict };

  const stored = await readStored(true);
  const key = clean.toLowerCase();
  const next = stored.some((t) => t.name.toLowerCase() === key)
    ? stored.map((t) => (t.name.toLowerCase() === key ? { ...t, slug: wanted } : t))
    : [
        ...stored,
        {
          name: clean,
          locale:
            (await getNewsTags()).find((t) => t.name.toLowerCase() === key)
              ?.locale ?? guessLocale(clean),
          slug: wanted,
        },
      ];

  await writeStored(dedupe(next));
  return { ok: true, tags: await getNewsTags() };
}

/**
 * Removes a tag. `force` also strips it from every item using it.
 *
 * Without `force` this reports what would happen instead of acting, so the
 * panel can name the affected items before anyone commits.
 */
export async function deleteNewsTag(
  name: string,
  force = false,
): Promise<
  | { ok: true; tags: NewsTag[] }
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
    for (const item of await getAllNewsStrict()) {
      if (!item.tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
        continue;
      }
      await saveNews({
        ...item,
        tags: item.tags.filter((t) => t.toLowerCase() !== clean.toLowerCase()),
      });
    }
  }

  const stored = await readStored(true);
  await writeStored(
    stored.filter((t) => t.name.toLowerCase() !== clean.toLowerCase()),
  );
  return { ok: true, tags: await getNewsTags() };
}

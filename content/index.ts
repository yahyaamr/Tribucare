import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { data as en, type ContentData } from "./en";
import { ar } from "./ar";

/**
 * Locale-aware content.
 *
 * Arabic is a **deep override** of English rather than a full copy, which is
 * deliberate on three counts:
 *
 * - Slugs, hrefs, image paths, icon keys and numeric dimensions are the same in
 *   both languages. Restating them in the Arabic file would be several hundred
 *   lines of duplication whose only possible contribution is drift — and a slug
 *   that drifted would break the language switch, which relies on the two
 *   locales sharing a path.
 * - Brand names — MLAY, Rejuran, Zimmer, Altesse Soin — are not translated, so
 *   they inherit rather than being retyped and risked.
 * - Anything not yet translated falls back to English. A new English section
 *   added later shows up in English on the Arabic site instead of rendering
 *   blank or throwing.
 */

/**
 * Recursive partial for the override file.
 *
 * Three things it has to do beyond a plain `Partial`:
 *
 * - **Widen string literals.** The English content is `as const`, so
 *   `hero.eyebrow` is typed as its own English sentence, not `string`. Left
 *   alone that would reject every Arabic translation as "not assignable".
 * - **Drop `readonly`**, for the same reason.
 * - **Allow a partial element inside an array**, so Arabic can translate one
 *   field of one item and inherit the rest of it.
 */
export type DeepPartial<T> = T extends string
  ? string
  : T extends number | boolean | null | undefined
    ? T
    : T extends readonly (infer U)[]
      ? DeepPartial<U>[]
      : T extends object
        ? { -readonly [K in keyof T]?: DeepPartial<T[K]> }
        : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

/**
 * Merges `override` onto `base`.
 *
 * Arrays merge **by index** rather than being replaced wholesale. That is what
 * lets the Arabic file give a translated `title` for the third vertical while
 * that vertical keeps its English icon key and image path — replacing the array
 * would drop everything the override did not restate.
 */
function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;

  if (Array.isArray(base)) {
    const patch = Array.isArray(override) ? override : [];
    return base.map((item, i) =>
      i < patch.length ? deepMerge(item, patch[i]) : item,
    ) as T;
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(override)) {
      out[key] = deepMerge(
        (base as Record<string, unknown>)[key],
        override[key],
      );
    }
    return out as T;
  }

  return override as T;
}

// Built once at module load. The merge walks the whole content tree, and doing
// it per request would repeat that on every page render for no benefit — the
// inputs are static.
const BUNDLES: Record<Locale, ContentData> = {
  en,
  ar: deepMerge(en, ar),
};

/** Groups a product list into its categories, preserving first-seen order. */
function groupByCategory<T extends { category: string }>(items: T[]) {
  const order: string[] = [];
  for (const item of items) {
    if (!order.includes(item.category)) order.push(item.category);
  }
  return order.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  }));
}

/**
 * The content for a locale, plus the helpers bound to it.
 *
 * The helpers used to be module-level functions closing over the English
 * arrays, which meant an Arabic page calling `categoriesFor` would have
 * silently rendered English products. Binding them here makes that
 * impossible.
 */
export function getContent(locale: Locale = DEFAULT_LOCALE) {
  const bundle = BUNDLES[locale] ?? BUNDLES[DEFAULT_LOCALE];

  return {
    ...bundle,
    categoriesFor: (line: "devices" | "injectables") =>
      groupByCategory(bundle.products.filter((p) => p.line === line)),
    productBySlug: (slug: string) =>
      bundle.products.find((p) => p.slug === slug),
  };
}

export type Content = ReturnType<typeof getContent>;

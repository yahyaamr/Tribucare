import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/i18n/config";

/**
 * On-demand refresh for the public pages, after any create, update or delete.
 *
 * The site's pages are ISR-cached (`revalidate = 3600` on each route, and the
 * store's reads are ordinary fetches — see `store.ts`), so without these a
 * published edit would sit invisible until the window aged out.
 *
 * Every path here is the **route-file path**, not the URL in the address bar.
 * `proxy.ts` rewrites `/blogs` onto `/en/blogs`, and `revalidatePath` keys its
 * cache entries by the route that rendered them — so `revalidatePath("/blogs")`
 * matches nothing, quietly. (The reference spells this out under "Using
 * revalidatePath with rewrites".) The pattern form, `/[lang]/blogs/[slug]` with
 * type `"page"`, clears every language and every slug under it in one call;
 * the literal per-locale paths are passed as well so the specific record
 * refreshes even if a pattern ever misses.
 */

/** Every page that renders posts: the blog index, the article, and the
 *  homepage rail. The sitemap lists articles too. */
export function revalidateBlog(...slugs: (string | undefined)[]) {
  revalidatePath("/[lang]", "page");
  revalidatePath("/[lang]/blogs", "page");
  revalidatePath("/[lang]/blogs/[slug]", "page");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    if (!slug) continue;
    for (const locale of LOCALES) revalidatePath(`/${locale}/blogs/${slug}`);
  }
}

/**
 * Every page that renders events & news: the /events index, the item page,
 * the homepage carousel, the rail on /dermatology — and the retired
 * /news/[slug], which still resolves a slug to its /events address and so
 * still depends on the record existing.
 *
 * Kept separate from `revalidateBlog` rather than folded into it: a news edit
 * has no business busting the blog's cache, and the two lists of paths are the
 * evidence that the two content types do not touch.
 */
export function revalidateNews(...slugs: (string | undefined)[]) {
  revalidatePath("/[lang]", "page");
  revalidatePath("/[lang]/dermatology", "page");
  revalidatePath("/[lang]/events", "page");
  revalidatePath("/[lang]/events/[slug]", "page");
  revalidatePath("/[lang]/news/[slug]", "page");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    if (!slug) continue;
    for (const locale of LOCALES) {
      revalidatePath(`/${locale}/events/${slug}`);
    }
  }
}

/** The careers cards live in one section of the homepage. */
export function revalidateCareers() {
  revalidatePath("/[lang]", "page");
  for (const locale of LOCALES) revalidatePath(`/${locale}`);
}

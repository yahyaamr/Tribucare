import { revalidatePath } from "next/cache";

/**
 * Refreshes every surface that renders posts, after any create, update or
 * delete.
 *
 * The blog pages are ISR-cached, so without this a published edit would sit
 * invisible until the cache aged out. All of them are listed rather than just
 * the article itself: an edit that shows on /blog but not on the homepage rail
 * is the kind of inconsistency nobody reports and everybody notices.
 *
 * `/blog/[slug]` is passed with the `"page"` type because it is a dynamic
 * segment — `revalidatePath` requires the second argument for those and does
 * nothing at all without it. The literal `/blog/<slug>` is passed as well so
 * the specific article refreshes even if the pattern form misses.
 */
export function revalidateBlog(...slugs: (string | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/blog/[slug]", "page");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/blog/${slug}`);
  }
}

/**
 * Refreshes every surface that renders news, after any create, update or
 * delete.
 *
 * Kept separate from `revalidateBlog` rather than folded into it: a news edit
 * has no business busting the blog's cache, and the two lists of paths are the
 * evidence that the two content types do not touch. `/news/[slug]` needs the
 * `"page"` type because it is a dynamic segment, and the literal path is passed
 * too so the specific item refreshes even if the pattern form misses.
 */
export function revalidateNews(...slugs: (string | undefined)[]) {
  revalidatePath("/news");
  revalidatePath("/sitemap.xml");
  revalidatePath("/news/[slug]", "page");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/news/${slug}`);
  }
}

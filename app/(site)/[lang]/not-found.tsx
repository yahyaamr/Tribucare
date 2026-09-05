import { NotFoundView } from "@/components/site/not-found-view";
import { currentLocale } from "@/content/server";

/**
 * The 404 page under a locale, inside the site's chrome.
 *
 * A nested `not-found.tsx` renders for `notFound()` thrown inside its segment;
 * `[...rest]/page.tsx` throws for any path nothing else matched, so every
 * unknown public URL lands here in the visitor's language. Paths that never
 * reach `[lang]` at all fall to `app/not-found.tsx`.
 */
export default async function NotFound() {
  return <NotFoundView locale={await currentLocale()} />;
}

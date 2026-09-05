import { notFound } from "next/navigation";

/**
 * Catch-all for unknown paths under a locale.
 *
 * A nested `not-found.tsx` only renders for `notFound()` thrown inside its
 * segment; a URL that matches no route at all falls through to the app-level
 * default, which sits outside both root layouts and so carries no chrome.
 * This route exists to turn the one into the other: it matches whatever
 * nothing else did and throws, and `../not-found.tsx` renders inside the site
 * layout — header, footer, fonts and the right language.
 *
 * Every unknown public path arrives here, including `/fr/…`: the proxy
 * rewrites any non-locale first segment onto `/en/…`, so the layout's own
 * locale check is never what a visitor's typo reaches.
 */
export default function CatchAllNotFound() {
  notFound();
}

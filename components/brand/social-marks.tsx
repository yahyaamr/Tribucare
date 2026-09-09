import type { SVGProps } from "react";

/**
 * The three social brand marks, as inline SVG.
 *
 * These are the one deliberate exception to "the icon language is lucide":
 * `lucide-react` carries no brand icons at all — there is no `Linkedin`,
 * `Facebook` or `Instagram` in the package — and a brand mark cannot be
 * substituted or redrawn from the site's own vocabulary, because it is only
 * recognisable in its official geometry. So they are drawn here, once, and
 * every social link on the site resolves to this file.
 *
 * Glyph only: the "in", the "f", the camera outline — never the enclosing
 * rounded square each of the three also publishes. A boxed mark would put a
 * square tile inside the circular `icon-disc` plate, and a square icon tile is
 * the one shape AGENTS.md rules out by name.
 *
 * Filled rather than stroked, which is the one way they differ from a lucide
 * icon — an outlined "f" is not Facebook's mark. Filled glyphs read heavier at
 * the same box size, so callers set them a step smaller than the `size-5` a
 * stroked icon takes in the same plate.
 *
 * No `width`/`height` and `fill="currentColor"`, so the caller's size class and
 * the plate's colour drive them exactly as they drive a lucide icon. Each keeps
 * its own source viewBox rather than being renormalised to 24×24, because
 * refitting the path data by hand is how a brand mark quietly stops matching
 * the brand.
 */
type MarkProps = SVGProps<SVGSVGElement>;

export function LinkedInMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
    </svg>
  );
}

export function FacebookMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 320 512" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M80 299.3V512h116V299.3h86.5l18-97.8H196v-33.9c0-51.6 20.2-71.4 72.5-71.4 16.3 0 29.4.4 37 1.2V7.9C291.4 4 256.4 0 236.2 0 129.3 0 80 50.5 80 159.4v42.1H14v97.8h66z" />
    </svg>
  );
}

export function InstagramMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );
}

/**
 * `icon` keys in `contact.social`, resolved to components — the same
 * key-to-component indirection `nav` and `coreValues` use for their lucide
 * icons, so content stays a plain serialisable table with no imports in it.
 */
export const SOCIAL_MARKS: Record<
  string,
  (props: MarkProps) => React.JSX.Element
> = {
  linkedin: LinkedInMark,
  facebook: FacebookMark,
  instagram: InstagramMark,
};

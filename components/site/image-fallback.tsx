import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * What a media band shows when its image is missing.
 *
 * One placeholder for the whole site, public and panel. Every card, hero and
 * thumbnail that renders a stored image renders this when there is none —
 * previously each surface invented its own: the post card went blank, the news
 * card showed a newspaper, the event card a calendar, the admin list a document.
 * Four answers to one question, none of which said the thing worth saying.
 *
 * `ImageOff` says it: an image belongs here and is not set. A subject icon
 * (a newspaper, a calendar) reads as decoration and hides the gap instead —
 * which is how an article shipped with no cover and nobody noticed.
 *
 * Fills its parent, so the caller keeps owning the band's size and radius. It
 * is `aria-hidden`: a missing decorative image is nothing for a screen reader
 * to announce, and the surrounding card already carries the accessible name.
 */
export function ImageFallback({
  className,
  iconClassName,
}: {
  className?: string;
  /** Size the glyph to the band — `size-5` in a list row, `size-12` in a hero. */
  iconClassName?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-full items-center justify-center bg-brand-50",
        className,
      )}
    >
      <ImageOff className={cn("size-8 text-brand-300", iconClassName)} />
    </span>
  );
}

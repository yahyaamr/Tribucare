import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The official TribuCare mark, supplied as artwork.
 *
 * This replaced a hand-built SVG reconstruction. The official lock-up differs
 * from that reconstruction in ways worth knowing: the shield is flat teal rather
 * than a gradient, and "care" is orange, not teal.
 *
 * Because the artwork is raster, tone can't be driven by `currentColor` the way
 * it was in the SVG. `light` is therefore a second file with the teal wordmark
 * knocked out to white — the shield and the orange "care" are untouched, which
 * is the same treatment the SVG's light tone applied.
 */

const LOCKUP = {
  colour: { src: "/brand/logos/tribucare.webp", width: 483, height: 179 },
  light: { src: "/brand/logos/tribucare-light.webp", width: 483, height: 179 },
} as const;

const MARK = {
  src: "/brand/logos/tribucare-mark.webp",
  width: 155,
  height: 179,
} as const;

/** Shield only, no wordmark. Decorative by default. */
export function TribuMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={MARK.src}
      alt=""
      aria-hidden="true"
      width={MARK.width}
      height={MARK.height}
      priority={priority}
      className={cn("h-9 w-auto object-contain", className)}
    />
  );
}

/**
 * Full lock-up: shield + "Tribu / care".
 *
 * `markClassName` sets the lock-up's height, keeping the call sites that sized
 * the old shield with it working unchanged — in the official artwork the shield
 * and the wordmark share a baseline and cap height, so an `h-*` there lands the
 * shield at the same size it was before.
 */
export function TribuLogo({
  className,
  tone = "colour",
  markClassName,
  alt = "TribuCare",
  priority = false,
}: {
  className?: string;
  tone?: "colour" | "light";
  markClassName?: string;
  /** Pass "" where an ancestor already names the link, so it isn't read twice. */
  alt?: string;
  priority?: boolean;
}) {
  const art = LOCKUP[tone];

  return (
    <Image
      src={art.src}
      alt={alt}
      width={art.width}
      height={art.height}
      priority={priority}
      className={cn(
        "h-9 w-auto object-contain",
        markClassName,
        className,
      )}
    />
  );
}

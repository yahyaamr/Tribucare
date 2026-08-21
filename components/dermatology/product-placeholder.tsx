import Image from "next/image";
import { brandLogos } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Stands in for a product shot until TribuCare supplies one.
 *
 * What it deliberately is NOT is a photograph of some other device. Putting a
 * stock or manufacturer image under the name of a specific regulated product
 * misrepresents that product — the same failure as inventing its specification
 * — and the photographs themselves belong to other companies. So this is drawn
 * rather than sourced: the manufacturer's own mark on the soft mint disc every
 * product shot on this site stands on, built from tokens that already exist.
 *
 * It reads as a considered empty state rather than a broken one, it says whose
 * product the card is for, and nobody can mistake it for the product. Supply a
 * real `image` and it disappears on its own — see content/dermatology.ts.
 */
export function ProductPlaceholder({
  brand,
  className,
}: {
  brand: string;
  className?: string;
}) {
  const logo = brandLogos[brand];

  return (
    <div
      className={cn("absolute inset-0 grid place-items-center", className)}
      aria-hidden="true"
    >
      {/* The same mint disc a real product shot would sit on, so the card's
          proportions do not shift when the photograph arrives.

          Sized off HEIGHT, not width: the card's media band is wider than it is
          tall, and a width-derived disc overflowed it and came out clipped flat
          at the top and bottom. Height-derived, it stays a whole circle in the
          card band and in the taller slot on the product page alike. */}
      <div className="absolute top-1/2 left-1/2 aspect-square h-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-100/90 to-brand-50/30" />

      {logo ? (
        <Image
          src={logo.src}
          alt=""
          width={logo.width}
          height={logo.height}
          className="relative h-7 w-auto max-w-[9rem] object-contain opacity-70"
        />
      ) : (
        /* AMI and Kiusera carry no mark in the deck yet, so the name stands in
           for one rather than leaving the plate blank. */
        <span className="relative font-display text-lg font-semibold tracking-[-0.01em] text-brand-700/70">
          {brand}
        </span>
      )}

      <span className="eyebrow absolute right-3.5 bottom-3 text-[0.5625rem] text-ink-faint/60">
        Image to follow
      </span>
    </div>
  );
}

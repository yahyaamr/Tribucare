"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Slide = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Per-slide classes, appended after the shared `imageClassName`. */
  imageClassName?: string;
};

/** How long each slide holds before the crossfade to the next begins. */
const DWELL = 5200;

/**
 * The dermatology hero shot, cycling through its slides on a slow crossfade.
 *
 * The slides are stacked and cross-faded on opacity alone — no transform, no
 * scale — so the shot never appears to move against the wave field behind it,
 * and the whole thing composites. Under `prefers-reduced-motion` the timer
 * never starts and slide one simply stays put.
 *
 * Two shapes, because the hero renders this twice: `fill` for the desktop copy
 * hung off the section's bottom-right corner, and `flow` for the stacked copy
 * below lg, which has to keep its own intrinsic height. In `flow` the first
 * slide stays in the layout and only fades — the others are laid over it — so
 * the box is sized by a real image rather than by restated aspect-ratio maths.
 */
export function HeroSlideshow({
  slides,
  sizes,
  shape = "fill",
  className,
  imageClassName,
  alt = "",
  priority = false,
}: {
  slides: readonly Slide[];
  sizes: string;
  shape?: "fill" | "flow";
  className?: string;
  imageClassName?: string;
  alt?: string;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      DWELL,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className={cn("relative", className)}>
      {slides.map((slide, i) => {
        // Only the first slide of a `flow` stack sits in the layout; every
        // other slide, in either shape, is laid over the box it defines.
        const inFlow = shape === "flow" && i === 0;

        return (
          <Image
            key={`${slide.src}-${i}`}
            src={slide.src}
            // One accessible name for the set, on the slide that holds the
            // layout — the rest are the same subject and would only repeat it.
            alt={i === 0 ? alt : ""}
            {...(inFlow
              ? { width: slide.width, height: slide.height }
              : { fill: true })}
            sizes={sizes}
            priority={priority && i === 0}
            className={cn(
              "transition-opacity duration-[var(--duration-reveal)] ease-[var(--ease-out)]",
              !inFlow && "absolute inset-0",
              i === index ? "opacity-100" : "opacity-0",
              imageClassName,
              slide.imageClassName,
            )}
          />
        );
      })}
    </div>
  );
}

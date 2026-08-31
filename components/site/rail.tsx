"use client";

import { useRef } from "react";
import { useEasedScroll } from "@/components/site/use-eased-scroll";
import { cn } from "@/lib/utils";

/**
 * Horizontal card rail — the site's one "more cards than fit" row.
 *
 * `useEasedScroll` gives it click-and-drag panning and eases a *horizontal*
 * wheel gesture (trackpad swipe, shift+wheel) onto `scrollLeft`. A plain
 * vertical wheel is deliberately left alone — no `data-lenis-prevent` here — so
 * it scrolls the page at the same speed as anywhere else rather than being
 * captured or re-timed by the rail. `rail-fade` supplies the soft edges and the
 * inset that keeps the rail level with the content above it; `touch-action:
 * pan-x` (in the `rail` utility) does the same axis split for touch.
 */
export function Rail({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  useEasedScroll(ref, { axis: "x", drag: true });

  return (
    <ul
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        "rail rail-fade cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {children}
    </ul>
  );
}

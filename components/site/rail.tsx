"use client";

import { useRef } from "react";
import { useEasedScroll } from "@/components/site/use-eased-scroll";
import { cn } from "@/lib/utils";

/**
 * Horizontal card rail — the site's one "more cards than fit" row.
 *
 * A plain overflow-x container ignores a vertical wheel, so a mouse user has no
 * way to move it. `useEasedScroll` maps the wheel onto `scrollLeft`, eases it,
 * adds click-and-drag panning, and hands the page back at either end — see that
 * file for why each of those is needed. `rail-fade` supplies the soft edges and
 * the inset that keeps the rail level with the content above it.
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
      data-lenis-prevent
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

"use client";

import { useRef } from "react";
import { useEasedScroll } from "@/components/site/use-eased-scroll";
import { cn } from "@/lib/utils";

/**
 * A vertical scrolling column of cards, unframed.
 *
 * The vertical counterpart to `<Rail>`, sharing its wheel handling: the wheel
 * scrolls this column rather than the page, eased to match Lenis, and hands the
 * page back at either end instead of trapping the cursor.
 *
 * `scroll-subtle` themes the scrollbar — without a frame around the column the
 * default OS bar is the loudest thing in the section. No `overscroll-contain`:
 * the wheel is already handled explicitly, and containing the axis would only
 * stop *touch* from chaining to the page at the ends, which is the one case
 * where chaining is the correct behaviour.
 */
export function ScrollColumn({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  useEasedScroll(ref, { axis: "y" });

  return (
    <ul
      ref={ref}
      data-lenis-prevent
      aria-label={ariaLabel}
      className={cn("scroll-subtle overflow-y-auto", className)}
    >
      {children}
    </ul>
  );
}

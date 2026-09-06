"use client";

import { Children, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSwipe } from "@/components/site/use-swipe";
import { cn } from "@/lib/utils";

/**
 * One card at a time, stepped with arrows — the mobile shape of every card row
 * that is a <Rail> (or a multi-column grid) on desktop.
 *
 * A rail needs room for two-and-a-bit cards to read as a rail. Below the width
 * where it gets that, this shows a single card with a prev/next pair instead.
 * Same counter and arrow row as <EventCarousel>; the cards passed in are
 * unchanged. **Change one of the two and change the other.**
 *
 * The arrows are not the only way through: `useSwipe` steps the same cards on a
 * horizontal drag, and hands every vertical one to the page untouched.
 */
export function CardStepper({
  children,
  className,
  "aria-label": ariaLabel,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  /** `dark` for the deep-teal grounds the rails sit on; `light` elsewhere. */
  tone?: "light" | "dark";
}) {
  const items = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const dark = tone === "dark";
  const viewport = useRef<HTMLDivElement>(null);

  const step = (delta: number) => {
    setDirection(delta);
    setIndex((i) => (i + delta + items.length) % items.length);
  };

  useSwipe(viewport, step);

  const arrow = cn(
    "size-11",
    dark
      ? "icon-disc-dark hover:bg-brand-600/40 hover:text-white"
      : "icon-disc hover:bg-brand-100 hover:text-brand-700",
  );

  return (
    <div aria-label={ariaLabel} className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-4 pb-5">
        <p
          className={cn(
            "text-[0.8125rem] tabular-nums",
            dark ? "text-brand-100/50" : "text-ink-faint",
          )}
        >
          <span className={dark ? "text-brand-100/90" : "text-ink"}>
            {String(index + 1).padStart(2, "0")}
          </span>{" "}
          / {String(items.length).padStart(2, "0")}
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous card"
            className={cn(arrow, "hover:-translate-x-0.5 rtl:hover:translate-x-0.5")}
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next card"
            className={cn(arrow, "hover:translate-x-0.5 rtl:hover:-translate-x-0.5")}
          >
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* The swipe surface is this wrapper, not the card below it: `key` swaps
          that one out on every step, and listeners bound there would be left on
          a detached node after the first swipe. */}
      <div ref={viewport} className="swipe-x">
        <div
          key={index}
          className={cn(
            "animate-in fade-in duration-[var(--duration-slow)] ease-[var(--ease-out)] motion-reduce:animate-none",
            "[&_.rail-item]:w-full",
            direction > 0 ? "slide-in-from-right-6" : "slide-in-from-left-6",
          )}
        >
          {items[index]}
        </div>
      </div>
    </div>
  );
}

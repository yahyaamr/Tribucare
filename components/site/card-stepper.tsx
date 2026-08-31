"use client";

import { Children, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One card at a time, stepped with arrows — the mobile shape of every card row
 * that is a <Rail> (or a multi-column grid) on desktop.
 *
 * A rail is a horizontal scroller, and on a touchscreen a vertical swipe that
 * starts on one drags the row sideways before the page moves — the row eats the
 * gesture, runs its whole length, and only then hands the page back. Below the
 * width where that trade is worth it, this shows a single card with a prev/next
 * pair instead, so a finger scroll is only ever a page scroll. Same counter and
 * arrow row as <EventCarousel>; the cards passed in are unchanged.
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

  const step = (delta: number) => {
    setDirection(delta);
    setIndex((i) => (i + delta + items.length) % items.length);
  };

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
            className={cn(arrow, "hover:-translate-x-0.5")}
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next card"
            className={cn(arrow, "hover:translate-x-0.5")}
          >
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </button>
        </div>
      </div>

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
  );
}

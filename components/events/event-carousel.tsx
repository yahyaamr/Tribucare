"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { cn } from "@/lib/utils";
import type { ContentData } from "@/content/en";

type Event = React.ComponentProps<typeof EventCard>["event"];

/**
 * One event at a time, stepped with arrows.
 *
 * The rail this replaced needed room for two-and-a-bit cards to read as a rail;
 * beside the lanyard there is only ever room for one, so the row of arrows does
 * the job the drag gesture used to. Card, badges and rhythm are untouched —
 * this is `<EventCard>` in a different frame, not a second kind of event card.
 */
export function EventCarousel({
  items,
  href,
  labels,
}: {
  labels: ContentData["ui"]["events"];
  items: readonly Event[];
  /** Passed straight to the card, so the whole card is a link. */
  href?: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const step = (delta: number) => {
    setDirection(delta);
    setIndex((i) => (i + delta + items.length) % items.length);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 pb-5">
        <p className="text-[0.8125rem] tabular-nums text-brand-100/50">
          <span className="text-brand-100/90">
            {String(index + 1).padStart(2, "0")}
          </span>{" "}
          / {String(items.length).padStart(2, "0")}
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous event"
            className="icon-disc-dark size-11 hover:-translate-x-0.5 rtl:hover:translate-x-0.5 hover:bg-brand-600/40 hover:text-white"
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next event"
            className="icon-disc-dark size-11 hover:translate-x-0.5 rtl:hover:-translate-x-0.5 hover:bg-brand-600/40 hover:text-white"
          >
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        key={index}
        className={cn(
          "animate-in fade-in duration-[var(--duration-slow)] ease-[var(--ease-out)] motion-reduce:animate-none",
          direction > 0 ? "slide-in-from-right-6" : "slide-in-from-left-6",
        )}
      >
        <EventCard
          labels={labels}
          event={items[index]}
          href={href}
          sizes="(max-width: 1024px) 100vw, 30rem"
        />
      </div>
    </div>
  );
}

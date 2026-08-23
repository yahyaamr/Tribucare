"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The layered card stack — each card holds still while the next rides up over
 * it. The pinning itself is CSS (`.stack-card` in globals.css); this publishes
 * the one number CSS cannot work out for itself.
 *
 * Where the viewport holds a whole card the stylesheet pins by the card's top
 * edge and steps each card a little lower, so the previous card's top edge
 * stays visible behind it. That is the desktop stack and it needs nothing from
 * here.
 *
 * Where the card is TALLER than the viewport — every phone, and portrait
 * tablets, because the card's grid is single-column below `lg` and it runs
 * ~1080px — a top-pin is wrong: it freezes the card the moment its top meets
 * the header, with a third of the copy still below the fold, and lets the next
 * card climb over writing nobody has read. Such a card has to pin by its LAST
 * LINE instead: hold it exactly when its bottom edge lands on the bottom of the
 * screen, which is the moment the reader finishes it.
 *
 * That offset is `viewportHeight - cardHeight`, and it is what gets measured
 * here and written out as `--stack-read`. It is negative whenever the card
 * overflows the screen, which is precisely what makes the card scroll its whole
 * length before it catches.
 *
 * Why it can't be CSS: `top` accepts no term for the element's own height, and
 * a percentage there resolves against the containing block, not the box. The
 * obvious CSS answer — `bottom: 0` — is a trap: bottom-pinning also drags cards
 * that have not been reached yet *up* into view, so all three collapse onto the
 * same line from first paint.
 */

/**
 * Header clearance, matching the floor `--stack-top` clamps to on desktop. A
 * card that fits below it is pinned there and shown whole, rather than being
 * tucked under the bar to buy a tail it doesn't need.
 */
const HEADER = 88;

/**
 * Breathing space held under a pinned card, so the card lands with the section
 * visible beneath it rather than jammed against the bottom of the screen.
 *
 * Must stay smaller than the list's row gap (`gap-40`, 10rem, set on
 * <CardStack> in expertise.tsx) — that gap is what times the beat between a
 * card catching and the next one reaching it, and a tail wider than the gap
 * would put the next card on screen before this one had settled.
 */
const TAIL = 64;

export function CardStack({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cards = Array.from(el.children) as HTMLElement[];
    if (cards.length === 0) return;

    const measure = () => {
      const view = window.innerHeight;
      let tallest = 0;
      for (const card of cards) {
        const height = card.offsetHeight;
        tallest = Math.max(tallest, height);
        // A card short enough to stand clear of the header is pinned there and
        // read whole, exactly as the desktop stack does. A taller one is pinned
        // by its last line instead, held one TAIL above the bottom of the
        // screen so it settles with air beneath it.
        const offset =
          height <= view - HEADER ? HEADER : view - height - TAIL;
        card.style.setProperty("--stack-read", `${offset}px`);
      }
      // Every card is stretched to match whichever is naturally tallest, so the
      // stack reads as one consistent object rather than three different sizes.
      // Set on the list rather than per-card so a card growing to meet it does
      // not itself get measured as the new tallest on the next pass.
      el.style.setProperty("--stack-card-height", `${tallest}px`);
    };

    measure();

    // A card's height moves with text reflow, late image layout and rotation,
    // and the offset is only correct for the height it was taken from — so it
    // is remeasured rather than read once on mount.
    const observer = new ResizeObserver(measure);
    for (const card of cards) observer.observe(card);
    // ResizeObserver catches the card changing; this catches the *viewport*
    // changing under a card whose height didn't.
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <ul ref={ref} aria-label={ariaLabel} className={cn(className)}>
      {children}
    </ul>
  );
}

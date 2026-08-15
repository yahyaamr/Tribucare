"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type RevealFrom = "up" | "down" | "left" | "right" | "scale" | "mask";

type RevealTag = "div" | "section" | "li" | "article" | "header" | "span" | "p";

/**
 * One IntersectionObserver instance for the whole page rather than one per
 * element. On a page with ~90 revealed nodes that is the difference between 90
 * observers each with their own callback and a single entry list per frame.
 */
let sharedObserver: IntersectionObserver | null = null;

function observe(el: HTMLElement) {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "in";
          sharedObserver?.unobserve(entry.target);
        }
      },
      // Fires a little before the element's top edge clears the fold, so the
      // motion reads as "already arriving" rather than starting late.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
  }
  sharedObserver.observe(el);
  return () => sharedObserver?.unobserve(el);
}

/**
 * Scroll-reveal wrapper. Ships as `data-reveal="pending"` in the server HTML;
 * the hidden styling is neutralised by a <noscript> override, so content
 * degrades to fully visible without JavaScript.
 *
 * Direction, travel distance and duration are all CSS custom properties, so a
 * variant costs no extra JavaScript — see the `[data-reveal]` block in
 * globals.css.
 */
export function Reveal({
  children,
  delay = 0,
  from = "up",
  travel,
  duration,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Stagger offset in ms. */
  delay?: number;
  /** Which direction the element travels from. */
  from?: RevealFrom;
  /** Travel distance, e.g. "32px". Defaults to 20px via CSS. */
  travel?: string;
  /** Override the reveal duration in ms. */
  duration?: number;
  className?: string;
  as?: RevealTag;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.dataset.reveal = "in";
      return;
    }

    // Already past the fold on load (e.g. a deep link, or a restored scroll
    // position) — show it immediately rather than waiting for a scroll that
    // may never come.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.dataset.reveal = "in";
      return;
    }

    return observe(el);
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref across the small union of allowed tags
      ref={ref}
      data-reveal="pending"
      data-reveal-from={from}
      style={
        {
          "--reveal-delay": `${delay}ms`,
          ...(travel ? { "--reveal-travel": travel } : {}),
          ...(duration ? { "--reveal-duration": `${duration}ms` } : {}),
        } as React.CSSProperties
      }
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}

/**
 * Headline line-rise. Each line is clipped by its own wrapper and slides up
 * into view, which is why the lines have to be authored rather than measured —
 * splitting on rendered line boxes would mean reading layout on every resize.
 *
 * Pass the lines the design already breaks by hand:
 *   <LineReveal lines={["Advancing beauty.", <Accent key="a">Empowering care.</Accent>]} />
 */
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 90,
  as: Tag = "h2",
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Gap between consecutive lines, in ms. */
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        // The clipping wrapper is what gets observed; the inner span is what
        // travels (see the mask rules in globals.css).
        //
        // `pb-[0.12em]` keeps descenders (g, y, p) from being sheared by the
        // clip; the negative margin gives the space straight back so line
        // rhythm is unchanged.
        <Reveal
          as="span"
          key={i}
          from="mask"
          delay={delay + i * stagger}
          duration={900}
          className={cn(
            "block overflow-hidden pb-[0.12em] mb-[-0.12em]",
            lineClassName,
          )}
        >
          <span className="block">{line}</span>
        </Reveal>
      ))}
    </Tag>
  );
}

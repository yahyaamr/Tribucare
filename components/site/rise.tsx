"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";

/**
 * Scroll-driven rise. The child starts `distance` px below its layout position
 * and eases up into it as the element scrolls into view, then stays put.
 *
 * Distinct from `Parallax`, which drifts continuously and never settles. This
 * one resolves to zero and clamps, so the layer arrives at the position the
 * design specifies and holds there while you read.
 *
 * Position is measured by walking `offsetTop`, not `getBoundingClientRect`:
 * this is designed to sit inside a `Parallax`, and a rect would include the
 * parent's live transform, so the trigger point would shift depending on where
 * the page happened to be when it was measured.
 */
export function Rise({
  children,
  distance = 80,
  className,
}: {
  children: React.ReactNode;
  /** How far below its resting position the layer starts, in px. */
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const geometry = useRef<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      geometry.current = null;
      el.style.transform = "";
      return;
    }

    const measure = () => {
      let top = 0;
      let node: HTMLElement | null = el;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      geometry.current = { top, height: el.offsetHeight };
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Applies the offset for a given scroll position. Shared by the mount pass
  // below and the Lenis subscription, so both use identical maths.
  const applyOffset = (scroll: number) => {
    const el = ref.current;
    const geo = geometry.current;
    if (!el || !geo) return;

    // Starts when the element's top edge touches the viewport bottom and lands
    // when its centre reaches the viewport centre. Tying the end to the
    // element's own height is what keeps the travel *visible*: a fixed window
    // finishes while the layer is still mostly below the fold, so the rise has
    // already happened by the time you can see it.
    const start = geo.top - window.innerHeight;
    const span = (geo.height + window.innerHeight) / 2;
    const progress =
      span > 0 ? Math.min(1, Math.max(0, (scroll - start) / span)) : 1;

    // easeOutQuad, not cubic: cubic spends most of its travel in the first
    // fraction of the window, which here is still below the fold — the layer
    // would be all but settled by the time it is on screen. Quad keeps the
    // movement spread across the part of the scroll you can actually see.
    const eased = 1 - Math.pow(1 - progress, 2);
    const offset = (1 - eased) * distance;

    el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  };

  // Lenis only emits while scrolling, so the starting offset has to be written
  // once on mount — otherwise the layer sits at its resting position until the
  // first wheel event and then jumps down to begin the rise.
  useEffect(() => {
    applyOffset(window.scrollY);
  });

  useLenis(({ scroll }) => applyOffset(scroll));

  return (
    <div ref={ref} className={cn(className)} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

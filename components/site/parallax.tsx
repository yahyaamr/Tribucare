"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";

/**
 * Scroll parallax for section media.
 *
 * Driven off Lenis's own scroll value rather than a separate `scroll` listener,
 * so the offset is computed from the same eased position the page is painted
 * at. A second listener would sample the *native* scroll top and drift a frame
 * behind the smoothed content, which reads as the layer jittering.
 *
 * Geometry is measured once (and on resize) and cached, so the per-frame work
 * is arithmetic plus one transform write — no `getBoundingClientRect` in the
 * scroll path, which would force layout on every frame.
 */
export function Parallax({
  children,
  speed = 0.12,
  className,
}: {
  children: React.ReactNode;
  /**
   * Fraction of the element's travel through the viewport to offset by.
   * Positive moves the layer *against* the scroll (it appears further away).
   * Keep under ~0.2 or the layer visibly detaches from its container.
   */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const geometry = useRef({ center: 0, enabled: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      geometry.current.enabled = false;
      return;
    }

    const measure = () => {
      const rect = el.getBoundingClientRect();
      geometry.current = {
        center: rect.top + window.scrollY + rect.height / 2,
        enabled: true,
      };
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

  useLenis(
    ({ scroll }) => {
      const el = ref.current;
      if (!el || !geometry.current.enabled) return;

      const viewportCenter = scroll + window.innerHeight / 2;
      const offset = (geometry.current.center - viewportCenter) * speed;

      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    },
    [speed],
  );

  return (
    <div ref={ref} className={cn(className)} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

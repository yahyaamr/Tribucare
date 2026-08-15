"use client";

import { useEffect, useRef } from "react";

/**
 * Pointer-reactive float. Eases a translate + slight 3D tilt toward the
 * cursor's position in the viewport, so the mark drifts as the mouse moves.
 *
 * - transform only, driven by rAF, so it never triggers layout
 * - the loop parks itself once it has settled and restarts on the next move
 * - opts out entirely for reduced-motion and for coarse/touch pointers
 *
 * The parent supplies `perspective`; this element owns the transform, so keep
 * positioning offsets (centering, nudges) on a wrapper rather than here.
 */
export function Floating({
  children,
  className,
  shift = 26,
  tilt = 6,
  ease = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  /** Peak translation in px at the edge of the viewport. */
  shift?: number;
  /** Peak rotation in degrees. */
  tilt?: number;
  /** Lerp factor per frame — lower is heavier. */
  ease?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let running = false;

    const tick = () => {
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      el.style.transform =
        `translate3d(${(x * shift).toFixed(2)}px, ${(y * shift * 0.75).toFixed(2)}px, 0) ` +
        `rotateY(${(x * tilt).toFixed(2)}deg) rotateX(${(-y * tilt * 0.7).toFixed(2)}deg)`;

      if (Math.abs(targetX - x) > 0.0005 || Math.abs(targetY - y) > 0.0005) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [ease, shift, tilt]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

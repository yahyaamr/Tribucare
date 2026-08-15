"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, type LenisRef } from "lenis/react";

/** Matches `scroll-padding-top` in globals.css — clears the notched header. */
const ANCHOR_OFFSET = -80;

/**
 * Site-wide smooth scrolling.
 *
 * Wheel input is eased; touch is deliberately left native (`syncTouch: false`)
 * because momentum scrolling on mobile is already excellent and re-driving it
 * from JavaScript costs frames for no gain.
 *
 * Lenis honours `prefers-reduced-motion` itself (`respectReducedMotion`), where
 * it forces `lerp: 1` so scroll tracks the input device exactly and programmatic
 * scrolls land instantly — so this stays mounted rather than being torn down,
 * and anchor handling keeps working identically for those users.
 *
 * Rendered with `root`, so it adds no wrapper element and `children` stay server
 * components.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Next scrolls to top across route changes, but Lenis owns the scroll
  // position and would otherwise ease all the way back up from wherever the
  // previous page left off. Reset instantly instead — unless the destination
  // names an anchor, which Lenis is already scrolling to.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (window.location.hash) return;
    ref.current?.lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <ReactLenis
      root
      ref={ref}
      options={{
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset: ANCHOR_OFFSET },
        autoRaf: true,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

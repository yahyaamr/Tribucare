"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Shell } from "@/components/site/shell";

// WebGL + rapier's wasm both need a browser, and `ssr: false` is only legal
// inside a Client Component — hence this thin wrapper between the server-
// rendered section and the canvas itself.
const Lanyard = dynamic(() => import("./lanyard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/60" />
    </div>
  ),
});

/** CSS px the card measures top to bottom. */
const CARD_HEIGHT = 545;

/** How far the strap hangs before the card starts, in CSS px. */
const STRAP_LENGTH = 410;

// The card is 2.25 world units tall and its centre rides 1.5 units below the
// last rope link, so both numbers above come straight back out as scene units.
const SCALE = CARD_HEIGHT / 2.25;
const SEGMENT_LENGTH = (STRAP_LENGTH / SCALE + 1.125 - 1.5) / 3;

/** Start fetching the 3D bundle this far before the section reaches the fold. */
const PRELOAD_MARGIN = "600px";

/**
 * Gate + host for the draggable 3D card.
 *
 * The scene costs roughly 3MB across three.js, rapier's wasm, the GLB and its
 * texture, so what it must never do is load where it cannot be seen. Two things
 * decide that, and both have to hold before `Lanyard` is even imported:
 *
 * - `enableQuery` — the media query for the layout this instance belongs to.
 *   `why.tsx` mounts one host for desktop and one for landscape tablet, and CSS
 *   shows exactly one; without this both would still *mount*, so every phone
 *   downloaded the whole scene twice to render `display: none`. That was the
 *   single largest cost on the page.
 * - proximity — even on a qualifying viewport nothing is fetched until the
 *   section is within `PRELOAD_MARGIN` of the fold, so the hero's own images
 *   are not competing with 3MB of scene for bandwidth during LCP.
 *
 * Once mounted it stays mounted (rebuilding a physics world on every pass is
 * worse than keeping one idle), but the render loop and the simulation are both
 * parked whenever the section is off screen — see the `running` prop.
 */
export function LanyardCanvas({ enableQuery }: { enableQuery: string }) {
  const host = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const [anchorX, setAnchorX] = useState<number | null>(null);

  /** Viewport qualifies for this instance. */
  const [enabled, setEnabled] = useState(false);
  /** Close enough to be worth downloading — latches on, never back off. */
  const [mounted, setMounted] = useState(false);
  /** Actually on screen, so the loop should be burning frames. */
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(enableQuery);
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [enableQuery]);

  useEffect(() => {
    const el = host.current;
    if (!el || !enabled) return;

    // Two thresholds off one element: the outer margin decides when to fetch,
    // the unmargined one decides when to run.
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMounted(true);
        preload.disconnect();
      },
      { rootMargin: `${PRELOAD_MARGIN} 0px ${PRELOAD_MARGIN} 0px` },
    );
    preload.observe(el);

    const activity = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting),
      { threshold: 0 },
    );
    activity.observe(el);

    return () => {
      preload.disconnect();
      activity.disconnect();
    };
  }, [enabled]);

  // The canvas spans the whole section so the card can swing across all of it,
  // but the band should still hang over the column the copy is laid out on.
  // Measuring a stand-in for that column keeps the two in step at any width,
  // rather than restating the grid's arithmetic here.
  useLayoutEffect(() => {
    const el = host.current;
    if (!el || !mounted) return;

    const measure = () => {
      if (!host.current || !column.current) return;
      const outer = host.current.getBoundingClientRect();
      const inner = column.current.getBoundingClientRect();
      setAnchorX(inner.left + inner.width / 2 - outer.left);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div ref={host} className="relative h-full w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-0"
      >
        <Shell className="h-full">
          <div className="grid h-full lg:grid-cols-2 lg:gap-10">
            <div ref={column} />
          </div>
        </Shell>
      </div>

      {mounted && (
        <Lanyard
          // Softened from the small-card default in step with the bigger scale:
          // gravity in px/s² is `gravity * scale`, so this keeps the swing at the
          // pace it read at before rather than making a large card twitch.
          gravity={[0, -15, 0]}
          scale={SCALE}
          anchorX={anchorX}
          segmentLength={SEGMENT_LENGTH}
          running={running}
          // Front is full-bleed artwork; the back keeps the padded logo it had.
          frontImage="/brand/card-front.webp"
          frontFit="cover"
          frontPadding={0}
          backImage="/brand/logos/tribucare-light.webp"
          imageFit="contain"
          faceColor="#0a5251"
          lanyardImage="/lanyard/lanyard.png"
          lanyardWidth={1}
          className="absolute inset-0"
        />
      )}
    </div>
  );
}

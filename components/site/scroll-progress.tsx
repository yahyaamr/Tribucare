"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";

/**
 * Reading-progress rail under the header.
 *
 * Where the browser supports scroll-driven animations the whole thing runs on
 * the compositor from CSS alone (see `.scroll-progress` in globals.css) and
 * this component writes nothing. The Lenis subscription is only a fallback for
 * browsers without `animation-timeline`.
 *
 * Support is resolved lazily inside the callback rather than in state: it is a
 * fixed property of the environment, so putting it in state would only add a
 * render, and computing it during the first render would disagree with the
 * server (where `CSS` does not exist) and break hydration.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isNative = useRef<boolean | null>(null);

  useLenis(({ progress }) => {
    if (isNative.current === null) {
      isNative.current =
        typeof CSS !== "undefined" &&
        (CSS.supports?.("animation-timeline", "scroll()") ?? false);
    }
    if (isNative.current) return;

    ref.current?.style.setProperty("--scroll-progress", String(progress));
  });

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden",
        className,
      )}
    >
      <div
        ref={ref}
        className="scroll-progress h-full bg-gradient-to-r from-signal-500 to-circuit-400"
      />
    </div>
  );
}

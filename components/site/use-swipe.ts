"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Horizontal swipe for a stepped carousel — the touch half of the arrow pair.
 *
 * `<CardStepper>` and `<EventCarousel>` show one card at a time because a rail
 * has no room to read as a rail on a phone. That trade left the arrows as the
 * only way through the set, which is not how a card row behaves on a
 * touchscreen; this adds the gesture back without turning the row into a
 * scroller again.
 *
 * **The axis is decided once and then held for the life of the gesture.** A
 * finger that starts out scrolling the page keeps scrolling it even if it
 * drifts sideways on the way down, so a card never slides out from under a
 * vertical scroll. The container carries `swipe-x` (`touch-action: pan-y`), so
 * the browser owns the vertical and this owns the horizontal — the two can
 * never both act on one gesture.
 *
 * Every listener is passive: the gesture is read, never cancelled. Nothing here
 * runs for a mouse or trackpad, which keep the arrows.
 */

/** Below this the gesture was a tap, or a press that wandered. */
const THRESHOLD = 44;

/** Travel before the gesture commits to an axis. */
const AXIS_LOCK = 10;

export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (delta: 1 | -1) => void,
) {
  // Held in a ref so a caller passing a fresh closure each render — which both
  // carousels do — does not tear down and rebind the listeners every render.
  const handler = useRef(onSwipe);
  useEffect(() => {
    handler.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /**
     * Same conversion `useEasedScroll` makes: under `direction: rtl` the next
     * card lies to the *left*, so the finger travels the other way to reach it.
     */
    const sign = getComputedStyle(el).direction === "rtl" ? -1 : 1;

    let startX = 0;
    let startY = 0;
    /** `null` until the gesture has travelled far enough to commit. */
    let horizontal: boolean | null = null;
    let swallowClick = false;

    const onStart = (event: TouchEvent) => {
      // Never let a flag outlive the gesture that set it and eat a real tap.
      swallowClick = false;
      // A second finger is a pinch, not a swipe — sit the whole gesture out.
      if (event.touches.length !== 1) {
        horizontal = false;
        return;
      }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      horizontal = null;
    };

    const onMove = (event: TouchEvent) => {
      if (horizontal !== null || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      horizontal = Math.abs(dx) > Math.abs(dy);
    };

    const onEnd = (event: TouchEvent) => {
      const claimed = horizontal;
      horizontal = null;
      if (!claimed) return;
      // The browser was told to ignore the horizontal (`pan-y`), so it still
      // reads this gesture as a tap and would follow the card's link on the way
      // out. The card is a link over its whole face, so every swipe would
      // navigate. Same guard `useEasedScroll` puts on a mouse drag.
      swallowClick = true;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      if (Math.abs(dx) < THRESHOLD) return;
      handler.current(dx * sign < 0 ? 1 : -1);
    };

    const onCancel = () => {
      horizontal = null;
    };

    const onClick = (event: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onCancel, { passive: true });
    el.addEventListener("click", onClick, true);

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
      el.removeEventListener("click", onClick, true);
    };
  }, [ref]);
}

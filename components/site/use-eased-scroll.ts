"use client";

import { useEffect, type RefObject } from "react";
import { useLenis } from "lenis/react";

/**
 * Wheel handling for a scroll container nested inside the Lenis-driven page.
 *
 * A **horizontal rail** (`axis: "x"`) claims only a gesture that is itself
 * horizontal — a sideways trackpad swipe, or shift+wheel — which it eases
 * through its own rAF loop and keeps from reaching Lenis with `stopPropagation`.
 * Every other wheel it ignores entirely: the rail carries no
 * `data-lenis-prevent`, so a plain vertical wheel bubbles straight to Lenis and
 * the page scrolls at exactly the speed it does everywhere else. Nothing here
 * forwards or re-times a vertical wheel — doing so is what used to make
 * scrolling over a rail feel slower than scrolling anywhere else.
 *
 * A **vertical column** (`axis: "y"`, and it sets `data-lenis-prevent` itself)
 * takes every wheel, eases it the same way, and at either end forwards the
 * leftover to Lenis so the page scroll continues past it. Easing rather than
 * writing the offset straight matters because a hard step per notch stutters
 * beside the eased page; the hand-off matters because `data-lenis-prevent`
 * otherwise leaves the gesture dead under the cursor.
 *
 * Touch is untouched — Lenis runs `syncTouch: false`, so native panning already
 * works and chains to the page at the ends. A rail also carries
 * `touch-action: pan-x`, so a vertical finger drag is never claimed by it.
 *
 * **Everything below works in a logical 0 → max space, not in `scrollLeft`.**
 * Under `direction: rtl` a horizontal scroller starts at 0 on its *right* edge
 * and runs *negative* to `-(scrollWidth - clientWidth)`. Written against
 * `scrollLeft` directly, `clamp()` pinned every position to 0 and the rail
 * could not be moved at all — by wheel, by drag or by either end check. One
 * `AXIS_SIGN` conversion on read and write keeps the rest of this file in the
 * coordinate space it was written for, in both directions.
 */

/** Matches the `lerp` Lenis runs on the document, so the two feel identical. */
const LERP = 0.12;

/**
 * How close to an end counts as being at it. Scroll offsets are fractional on
 * scaled displays, so anything within this distance is snapped flush — a
 * container resting 2px short of the top clips the first card for no reason the
 * user can see or correct.
 */
const EDGE = 2;

export function useEasedScroll(
  ref: RefObject<HTMLElement | null>,
  {
    axis = "y",
    drag = false,
  }: {
    axis?: "x" | "y";
    /** Enable click-and-drag panning. Used by horizontal rails. */
    drag?: boolean;
  } = {},
) {
  const lenis = useLenis();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const horizontal = axis === "x";
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /**
     * +1 where the scroll offset counts up from the start, -1 where it counts
     * down. Only a horizontal scroller in an RTL container is the latter: it
     * reports 0 at the right-hand start and negative offsets from there, which
     * is the CSSOM behaviour every current browser implements. Vertical scroll
     * has no such flip.
     */
    const sign =
      horizontal && getComputedStyle(el).direction === "rtl" ? -1 : 1;

    /** Distance from the start, always positive — whichever way the DOM counts. */
    const position = () =>
      horizontal ? sign * el.scrollLeft : el.scrollTop;
    const moveTo = (value: number) => {
      if (horizontal) el.scrollLeft = sign * value;
      else el.scrollTop = value;
    };
    const maxScroll = () =>
      horizontal
        ? el.scrollWidth - el.clientWidth
        : el.scrollHeight - el.clientHeight;
    const clamp = (value: number) =>
      Math.max(0, Math.min(value, maxScroll()));

    let target = position();
    /**
     * The glide's own position, held here rather than read back from the DOM
     * each frame.
     *
     * Browsers quantise `scrollTop`/`scrollLeft` to physical pixels, so on a
     * scaled display a written 1.76 reads back as 2. Feeding that reading into
     * the next frame makes the loop stop converging: it writes a value, reads a
     * larger one, computes the same difference again and never closes the last
     * couple of pixels — leaving the container permanently short of the top
     * with the first card clipped.
     */
    let current = position();
    let animating = false;
    let frame = 0;

    const stop = () => {
      cancelAnimationFrame(frame);
      animating = false;
    };

    const tick = () => {
      const diff = target - current;
      // Under half a pixel there is nothing left to see; land it exactly.
      if (Math.abs(diff) < 0.5) {
        current = target;
        moveTo(target);
        animating = false;
        return;
      }
      current += diff * LERP;
      moveTo(current);
      frame = requestAnimationFrame(tick);
    };

    const onWheel = (event: WheelEvent) => {
      if (horizontal) {
        // A horizontal rail only claims a gesture that is itself horizontal — a
        // sideways trackpad swipe, or shift+wheel. A plain vertical wheel is
        // left completely untouched: the rail carries no `data-lenis-prevent`,
        // so the event bubbles to Lenis and the page scrolls at exactly the
        // speed it does everywhere else. Nothing here forwards, eases or
        // rewrites it — that is what kept scrolling over a rail feeling slower
        // than scrolling anywhere else.
        const lateral =
          event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
        if (!lateral) return;
        // Ours now — keep Lenis's page-level handler from also acting on it.
        event.stopPropagation();
      }

      // Horizontal rails read deltaX; shift+wheel lands on deltaY in some
      // browsers, so fall back to it. A vertical column only wants deltaY.
      //
      // A wheel delta is physical — positive moves the view right — so it needs
      // the same conversion as the offset to become "distance further from the
      // start". In RTL that flips: revealing the next card means moving the
      // view *left*, which is exactly what a native RTL scroller does with the
      // same gesture.
      const delta =
        sign * (horizontal ? event.deltaX || event.deltaY : event.deltaY);
      if (!delta) return;

      event.preventDefault();

      const max = maxScroll();
      // Boundaries are measured against the target, not the live position:
      // mid-glide the container is still behind, and testing it would hand the
      // page the wheel while there was visibly road left.
      const from = animating ? target : position();
      // Slack at both ends: scroll offsets are fractional on scaled displays,
      // so an exact comparison never matches and the wheel gets stuck there.
      const atStart = from <= EDGE;
      const atEnd = from >= max - EDGE;

      if (max <= 0 || (delta < 0 && atStart) || (delta > 0 && atEnd)) {
        // Pin to the edge before handing the page the gesture. That same slack
        // is what let the container come to rest a pixel or two short of the
        // top — enough to leave the first card visibly clipped at the moment
        // the user believes they are scrolled all the way up.
        if (max > 0) {
          stop();
          target = delta < 0 ? 0 : max;
          current = target;
          moveTo(target);
        }
        // A vertical column hands the leftover gesture on to the page so the
        // scroll continues past it. A horizontal rail has nothing sensible to
        // do with a sideways swipe once it is at its end, and it already let
        // every vertical wheel through, so it just stops here.
        if (!horizontal) {
          // Vertical only, where `sign` is 1 and `delta` is already physical.
          if (lenis) lenis.scrollTo(lenis.targetScroll + delta);
          else window.scrollBy(0, delta);
        }
        return;
      }

      target = clamp(from + delta);
      // Land exactly on an end rather than a fraction away from it, so "fully
      // scrolled" always shows the whole first or last card.
      if (target <= EDGE) target = 0;
      else if (target >= max - EDGE) target = max;

      if (reduceMotion) {
        current = target;
        moveTo(target);
        return;
      }

      if (!animating) {
        // Re-sync before a fresh glide: the container may have been moved by
        // something other than this loop (a drag, a scrollbar, keyboard focus).
        current = position();
        animating = true;
        frame = requestAnimationFrame(tick);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    let dragging = false;
    let startPointer = 0;
    let startOffset = 0;
    let moved = false;

    const onPointerDown = (event: PointerEvent) => {
      // Touch already pans natively; hijacking it would fight the OS.
      if (event.pointerType === "touch") return;
      // Grabbing kills any glide still in flight — a drag should track the
      // cursor exactly, not fight a tween headed for an old target.
      stop();
      dragging = true;
      moved = false;
      startPointer = horizontal ? event.clientX : event.clientY;
      startOffset = position();
      el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const travel = (horizontal ? event.clientX : event.clientY) - startPointer;
      if (Math.abs(travel) > 3) moved = true;
      // Same conversion: the cursor moves in physical pixels, `current` counts
      // from the start. Dragging right in an RTL rail pulls the next card in,
      // just as dragging left does in an LTR one.
      current = clamp(startOffset - sign * travel);
      moveTo(current);
      // Keep the wheel's target in step, or the next notch would jump back to
      // wherever the container was before the drag.
      target = current;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      // A drag released just shy of an end would otherwise leave the first or
      // last card clipped by a pixel or two, same as the wheel could.
      const max = maxScroll();
      if (current <= EDGE) current = 0;
      else if (current >= max - EDGE) current = max;
      moveTo(current);
      target = current;
    };

    // A drag that ends on a card would otherwise fire that card's click.
    const onClick = (event: MouseEvent) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
    };

    if (drag) {
      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerup", onPointerUp);
      el.addEventListener("pointercancel", onPointerUp);
      el.addEventListener("click", onClick, true);
    }

    return () => {
      el.removeEventListener("wheel", onWheel);
      if (drag) {
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", onPointerUp);
        el.removeEventListener("pointercancel", onPointerUp);
        el.removeEventListener("click", onClick, true);
      }
      cancelAnimationFrame(frame);
    };
  }, [ref, axis, drag, lenis]);
}

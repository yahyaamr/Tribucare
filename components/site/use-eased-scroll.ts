"use client";

import { useEffect, type RefObject } from "react";
import { useLenis } from "lenis/react";

/**
 * Wheel handling for any scroll container nested inside the Lenis-driven page.
 *
 * Lenis owns wheel input site-wide, so a nested scroller needs
 * `data-lenis-prevent` to see the event at all — and once it has it, two things
 * have to be done by hand:
 *
 * 1. **Easing.** Writing the delta straight to the scroll offset moves the
 *    container one hard step per notch, which reads as stuttering beside the
 *    eased page. Each notch moves a *target* instead and a rAF loop chases it,
 *    matching Lenis's own lerp.
 * 2. **Handing the page back.** At either end the gesture is forwarded to Lenis
 *    explicitly. Letting the event through instead does nothing visible: the
 *    native scroll it causes is overwritten on Lenis's next frame, so the page
 *    sits frozen under the cursor.
 *
 * Touch is untouched — Lenis runs `syncTouch: false`, so native panning already
 * works and chains to the page at the ends.
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

    const position = () => (horizontal ? el.scrollLeft : el.scrollTop);
    const moveTo = (value: number) => {
      if (horizontal) el.scrollLeft = value;
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
      // A horizontal rail takes whichever axis the user leaned on — trackpads
      // send deltaX, a wheel only ever has deltaY. A vertical column only ever
      // wants deltaY.
      const delta = horizontal
        ? Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY
        : event.deltaY;
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
        if (lenis) lenis.scrollTo(lenis.targetScroll + delta);
        else window.scrollBy(0, delta);
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
      current = clamp(startOffset - travel);
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

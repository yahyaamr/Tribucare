"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useSwipe } from "@/components/site/use-swipe";

/**
 * Full-window viewing for a product page's photographs.
 *
 * The page stays a server component: the header shot and the gallery tiles are
 * rendered where they always were, and each gets a `<LightboxTrigger>` laid
 * over it with the card-link overlay pattern. The provider holds the one list
 * of images both draw from, so the arrows walk the header shot and the gallery
 * as a single set, in the order the page shows them.
 */

type Labels = { open: string; close: string; prev: string; next: string };

const LightboxContext = createContext<{
  open: (src: string, trigger: HTMLElement) => void;
  label: string;
} | null>(null);

export function ProductLightbox({
  images,
  alt,
  labels,
  children,
}: {
  /** Header shot first, then the gallery. Duplicates are dropped. */
  images: string[];
  alt: string;
  labels: Labels;
  children: ReactNode;
}) {
  const set = [...new Set(images.filter(Boolean))];
  const [index, setIndex] = useState<number | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const open = (src: string, from: HTMLElement) => {
    const i = set.indexOf(src);
    if (i === -1) return;
    trigger.current = from;
    setIndex(i);
  };

  return (
    <LightboxContext.Provider value={{ open, label: labels.open }}>
      {children}
      {index !== null && (
        <Viewer
          images={set}
          index={index}
          alt={alt}
          labels={labels}
          onStep={(delta) =>
            setIndex((i) => (i === null ? i : (i + delta + set.length) % set.length))
          }
          onClose={() => {
            setIndex(null);
            trigger.current?.focus();
          }}
        />
      )}
    </LightboxContext.Provider>
  );
}

/** The whole image becomes the button, one accessible name per image. */
export function LightboxTrigger({ src }: { src: string }) {
  const ctx = useContext(LightboxContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      aria-label={ctx.label}
      onClick={(event) => ctx.open(src, event.currentTarget)}
      className="absolute inset-0 cursor-zoom-in"
    />
  );
}

function Viewer({
  images,
  index,
  alt,
  labels,
  onStep,
  onClose,
}: {
  images: string[];
  index: number;
  alt: string;
  labels: Labels;
  onStep: (delta: 1 | -1) => void;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const closeRef = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const many = images.length > 1;

  useSwipe(viewport, (delta) => {
    if (many) onStep(delta);
  });

  // Held in a ref so the listener below binds once, not on every step.
  const handlers = useRef({ onStep, onClose });
  useEffect(() => {
    handlers.current = { onStep, onClose };
  }, [onStep, onClose]);

  useEffect(() => {
    // Under `dir="rtl"` the next image lies to the left, as on the page.
    const rtl = document.documentElement.dir === "rtl";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlers.current.onClose();
      if (!many) return;
      if (event.key === "ArrowRight") handlers.current.onStep(rtl ? -1 : 1);
      if (event.key === "ArrowLeft") handlers.current.onStep(rtl ? 1 : -1);
    };

    // Lenis owns the scroll position, so locking `body` overflow is not enough
    // — it has to be told to stop.
    lenis?.stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();

    return () => {
      lenis?.start();
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [lenis, many]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      ref={viewport}
      className="swipe-x fixed inset-0 z-100 flex items-center justify-center"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={labels.close}
        onClick={onClose}
        className="absolute inset-0 bg-brand-950/90 backdrop-blur-sm"
      />

      {/* Click-through, so a tap beside the photograph lands on the backdrop
          and closes; the swipe is read on the dialog itself. */}
      <div className="pointer-events-none relative h-full w-full px-4 py-20 sm:px-24">
        <div className="relative h-full w-full">
          <Image
            key={images[index]}
            src={images[index]}
            alt={alt}
            fill
            sizes="100vw"
            quality={90}
            className="object-contain"
          />
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className="icon-disc-dark absolute top-4 end-4 size-11 hover:bg-brand-600/40 hover:text-white"
      >
        <X className="size-4.5" aria-hidden="true" />
      </button>

      {many && (
        <>
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label={labels.prev}
            className="icon-disc-dark absolute start-4 top-1/2 size-11 -translate-y-1/2 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0 hover:bg-brand-600/40 hover:text-white"
          >
            <ArrowLeft className="size-4.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label={labels.next}
            className="icon-disc-dark absolute end-4 top-1/2 size-11 -translate-y-1/2 max-sm:top-auto max-sm:bottom-4 max-sm:translate-y-0 hover:bg-brand-600/40 hover:text-white"
          >
            <ArrowRight className="size-4.5" aria-hidden="true" />
          </button>
          <p
            aria-live="polite"
            className="absolute bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 font-display text-sm tabular-nums text-brand-200"
          >
            {index + 1} / {images.length}
          </p>
        </>
      )}
    </div>,
    document.body,
  );
}

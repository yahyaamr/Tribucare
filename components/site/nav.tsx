"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import {
  Gem,
  Handshake,
  Home,
  Layers,
  Menu,
  Newspaper,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TribuLogo } from "@/components/brand/logo";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { nav } from "@/content/site";

/**
 * Section id a nav link points at, or null for a plain route.
 *
 * The links are authored as `/#expertise` rather than `#expertise` so they
 * resolve from any page, so this has to read the fragment rather than test for
 * a leading "#".
 */
function sectionIdOf(href: string) {
  const [, id] = href.split("#");
  return id || null;
}

/** Section ids the nav links point at, for active-state tracking (including hero #top). */
const SECTION_IDS = [
  "top",
  ...nav
    .map((item) => sectionIdOf(item.href))
    .filter((id): id is string => id !== null),
];

/** `icon` keys in `nav`, resolved to components. */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  layers: Layers,
  gem: Gem,
  newspaper: Newspaper,
  handshake: Handshake,
};

/* --------------------------------------------------------------------------
   Header geometry.
   The shape and the content are painted as two separate layers — the shape
   carries the drop-shadow, which must not sit on an ancestor of the nav text
   (a filter re-rasterises its whole subtree and softens type). Both layers are
   built from these same constants, so the surface can never drift out of
   register with the content standing on it.

   `--notch` is the fillet radius. It must never exceed the bar's inset, or the
   fillet would run off the side of the viewport.
   -------------------------------------------------------------------------- */
/**
 * `STRIP` is the shallow full-width band the bar hangs from, and `BAR` is the
 * dropped centre section. Across the middle of the header — everywhere the logo,
 * links and CTA actually stand — the two are one continuous white surface, so
 * the height the content has to centre itself in is *both* of them: `SHELL`.
 *
 * Centring within `BAR` alone is what made the header look top-heavy. The strip
 * then landed entirely above the content, so the gap over the CTA was the strip
 * plus half the bar's slack while the gap under it was only half the slack —
 * 19.5px against 11.5px. Sizing the content row to `SHELL` splits that slack
 * evenly and costs no height.
 *
 * `SHELL` must stay equal to `STRIP + BAR`, or the content row and the surface
 * it stands on stop sharing a bottom edge and the progress rail drifts off it.
 * It is sized off the tallest thing standing in it (the CTA, 37px) plus ~11px of
 * air top and bottom — enough that the pill is not crowded by the fillets, while
 * still sitting well clear of the 68px this header used to occupy. To grow it,
 * step `SHELL` and `BAR` together by the same amount (one unit = 4px, so 2px of
 * it lands above the content and 2px below) — that keeps the pair adding up and
 * the extra air split evenly.
 *
 * `--notch` is the fillet radius; it scales with the strip, since a deep fillet
 * hanging off a shallow ledge reads as a wave rather than a fair.
 */
const STRIP = "h-3";
const BAR = "h-13";
const SHELL = "h-16";
const INSET = "mx-5 sm:mx-8 lg:mx-12 xl:mx-auto max-w-[78rem]";
const BAR_PAD = "px-5 md:px-7 lg:px-9";
const BAR_RADIUS = "rounded-b-[1rem] lg:rounded-b-[1.25rem]";
const NOTCH = "[--notch:1.5rem] lg:[--notch:2rem]";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const lenis = useLenis();

  // Reads scroll from the Lenis instance the page is actually eased by, so the
  // header's state change lands on the same frame as the content it sits over.
  useLenis(({ scroll }) => {
    setScrolled(scroll > 24);
    if (pathname === "/" && scroll < 100) {
      setActiveSection("top");
    }
  });

  useEffect(() => {
    if (SECTION_IDS.length === 0) return;

    const sections = SECTION_IDS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // A detection band across the upper third of the viewport: whichever
    // section occupies it is the one being read.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    // Lenis owns the scroll position, so locking `body` overflow is not enough
    // — it has to be told to stop.
    lenis?.stop();
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    return () => {
      lenis?.start();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="relative">
        {/* ---- Shape layer ------------------------------------------------
            Pure geometry, no text. The full-width strip and the dropped centre
            bar are one continuous white surface; the two fillets fair the step
            between them into a curve. `drop-shadow` (not `box-shadow`) is what
            lets the shadow follow that fillet outline rather than a rectangle. */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 transition-[filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "[filter:drop-shadow(0_10px_26px_rgb(7_42_42/0.16))]"
              : "[filter:drop-shadow(0_6px_18px_rgb(7_42_42/0.08))]",
          )}
        >
          <div className={cn(STRIP, "bg-white")} />
          <div className={cn("relative bg-white", INSET, BAR, BAR_RADIUS, NOTCH)}>
            <span className="notch-fillet notch-fillet-left absolute top-0 right-full bg-white" />
            <span className="notch-fillet notch-fillet-right absolute top-0 left-full bg-white" />
          </div>
        </div>

        {/* ---- Content layer ----------------------------------------------
            One row spanning the strip and the bar together, so `items-center`
            centres against the full height of the surface below rather than
            against the bar alone. */}
        <div className="relative">
          <div
            className={cn(
              "relative flex items-center justify-between gap-6",
              INSET,
              SHELL,
              BAR_PAD,
            )}
          >
            <Link
              href="/"
              aria-label="TribuCare — home"
              className="shrink-0 rounded-md transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99]"
            >
              <TribuLogo
                tone="colour"
                markClassName="h-7 md:h-8"
                alt=""
                priority
              />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {nav.map((item) => {
                  const sectionId = sectionIdOf(item.href);
                  // Section links follow the scroll; plain routes follow the
                  // URL, so /blog and its posts both light the Blog pill.
                  const isActive =
                    item.href === "/"
                      ? pathname === "/" &&
                        (activeSection === "top" || activeSection === null)
                      : sectionId !== null
                        ? sectionId === activeSection
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
                  const Icon = ICONS[item.icon];

                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        // Named explicitly because the label is clipped to zero
                        // width while collapsed, and Chrome drops clipped text
                        // from the accessibility tree — leaving the link
                        // unnamed. The visible copy is hidden from assistive
                        // tech below so it is not announced twice.
                        aria-label={item.label}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "group flex items-center rounded-lg px-3.5 py-2.5 text-[0.9rem] font-medium transition-colors duration-300",
                          isActive
                            ? "bg-brand-900 text-white shadow-[0_6px_14px_-8px_rgb(7_42_42/0.65)]"
                            : "text-ink-soft hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700",
                        )}
                      >
                        <Icon
                          aria-hidden="true"
                          className={cn(
                            "size-[1.125rem] shrink-0 transition-colors duration-300",
                            // Held back from the label so the pill reads as a
                            // word with a mark beside it, not two equal weights.
                            isActive && "text-white/70",
                          )}
                        />
                        {/* Collapsing track: the 0fr→1fr column animates the
                            label's width, which `overflow-hidden` clips as it
                            goes. The gap lives on the inner span rather than the
                            anchor, so it collapses with the label instead of
                            leaving a dead margin next to a lone icon.

                            Presentational only — the anchor's `aria-label`
                            carries the name in every state. */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                            isActive
                              ? "grid-cols-[1fr]"
                              : "grid-cols-[0fr] group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]",
                          )}
                        >
                          <span className="overflow-hidden">
                            <span className="block pl-2 whitespace-nowrap">
                              {item.label}
                            </span>
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/partner"
                className="hidden rounded-lg bg-brand-700 px-5 py-2.5 text-[0.875rem] font-semibold text-white transition-colors duration-300 hover:bg-brand-800 sm:inline-flex"
              >
                Partner With Us
              </Link>

              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                // Matched to the CTA's 37px so the two sit in the shorter bar
                // with the same air around them; still a 36px touch target.
                className="-mr-1 grid size-9 place-items-center rounded-lg text-brand-800 transition-colors hover:bg-brand-50 lg:hidden"
              >
                {/* Both icons are mounted and cross-faded, so the swap animates
                    instead of popping. */}
                <span className="relative grid size-5 place-items-center">
                  <Menu
                    className={cn(
                      "absolute size-5 transition-all duration-300",
                      open ? "rotate-90 scale-75 opacity-0" : "opacity-100",
                    )}
                    aria-hidden="true"
                  />
                  <X
                    className={cn(
                      "absolute size-5 transition-all duration-300",
                      open ? "opacity-100" : "-rotate-90 scale-75 opacity-0",
                    )}
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>

            {/* Inset to the bar's padding so the rail stops short of the
                rounded bottom corners instead of overhanging them. */}
            <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px md:inset-x-7 lg:inset-x-9">
              <ScrollProgress />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Mobile panel ------------------------------------------------
          A separate inset card below the bar rather than a full-bleed sheet, so
          it reads as part of the same island language. Height animates via the
          0fr→1fr grid track, which also clips the card's top margin when
          closed. `inert` keeps the collapsed panel out of the tab order without
          `hidden`, which cannot be transitioned. */}
      <div
        id="mobile-nav"
        ref={panelRef}
        inert={!open}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div
            className={cn(
              "mt-2 rounded-[1.5rem] bg-white p-5 shadow-[0_18px_40px_-20px_rgb(7_42_42/0.35)]",
              INSET,
            )}
          >
            <nav aria-label="Primary — mobile">
              <ul className="flex flex-col">
                {nav.map((item, i) => (
                  <li
                    key={item.href}
                    // Links cascade in behind the panel opening; on close they
                    // all leave together so the panel does not feel sticky.
                    className={cn(
                      "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0",
                    )}
                    style={{
                      transitionDelay: open ? `${80 + i * 45}ms` : "0ms",
                    }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 border-b border-brand-50 py-3.5 font-display text-xl font-medium text-ink transition-colors hover:text-brand-600"
                    >
                      <span className="eyebrow text-signal-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                href="/partner"
                onClick={() => setOpen(false)}
                className={cn(
                  "mt-5 flex w-full items-center justify-center rounded-lg bg-brand-700 px-6 py-3.5 font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{
                  transitionDelay: open ? `${80 + nav.length * 45}ms` : "0ms",
                }}
              >
                Partner With Us
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

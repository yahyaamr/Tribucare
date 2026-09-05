"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { LanguageSwitch } from "@/components/site/language-switch";
import { localePath, splitLocale, type Locale } from "@/lib/i18n/config";
import type { ContentData } from "@/content/en";

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

/** Section ids the nav links point at, for active-state tracking (including
 *  hero #top). Derived from the links rather than hardcoded, so adding a nav
 *  item cannot silently lose its active state. */
function sectionIdsOf(items: ContentData["nav"]) {
  return [
    "top",
    ...items
      .map((item) => sectionIdOf(item.href))
      .filter((id): id is string => id !== null),
  ];
}

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
 * `STRIP` is the shallow full-width band the bar hangs from, and the bar is the
 * dropped centre section below it. Across the middle of the header — everywhere the logo,
 * links and CTA actually stand — the two are one continuous white surface, so
 * the height the content has to centre itself in is *both* of them: `SHELL`.
 *
 * Centring within the bar alone is what made the header look top-heavy. The strip
 * then landed entirely above the content, so the gap over the CTA was the strip
 * plus half the bar's slack while the gap under it was only half the slack —
 * 19.5px against 11.5px. Sizing the content row to `SHELL` splits that slack
 * evenly and costs no height.
 *
 * `SHELL` must stay equal to `STRIP + BAR_MIN`, or the content row and the
 * surface it stands on stop sharing a bottom edge and the progress rail drifts
 * off it. It is sized off the tallest thing standing in it (the CTA, 37px) plus
 * ~11px of air top and bottom — enough that the pill is not crowded by the
 * fillets, while still sitting well clear of the 68px this header used to
 * occupy. To grow it, step `SHELL` and `BAR_MIN` together by the same amount
 * (one unit = 4px, so 2px of it lands above the content and 2px below) — that
 * keeps the pair adding up and the extra air split evenly.
 *
 * `BAR_MIN` is a FLOOR rather than a height, because the bar stretches: with
 * the mobile menu open the surface grows to cover the links, and the shape
 * layer resolves its height from the content instead of being told it. The
 * floor is what holds the closed header at exactly the size it has always been.
 *
 * `--notch` is the fillet radius; it scales with the strip, since a deep fillet
 * hanging off a shallow ledge reads as a wave rather than a fair.
 */
const STRIP = "h-3";
const BAR_MIN = "min-h-13";
const SHELL = "h-16";
const INSET = "mx-5 sm:mx-8 lg:mx-12 xl:mx-auto max-w-[78rem]";
const BAR_PAD = "px-5 md:px-7 lg:px-9";
const BAR_RADIUS = "rounded-b-[1rem] lg:rounded-b-[1.25rem]";
const NOTCH = "[--notch:1.5rem] lg:[--notch:2rem]";

/**
 * The header.
 *
 * Content arrives as props rather than being imported: this is a client
 * component, and `next/root-params` — how every server component here reads the
 * locale — cannot be called from one. The site layout, which is a server
 * component, reads the bundle and hands down the parts the header needs.
 */
export function SiteNav({
  locale,
  nav,
  ui,
}: {
  locale: Locale;
  nav: ContentData["nav"];
  ui: ContentData["ui"];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rawPathname = usePathname();
  const lenis = useLenis();

  // Under the proxy, `usePathname` reports the rewritten path — English pages
  // read as `/en/…` here while the address bar shows `/…`. Every comparison
  // below is against the locale-stripped form so both languages behave alike.
  const pathname = splitLocale(rawPathname ?? "/").path;
  const sectionIds = useMemo(() => sectionIdsOf(nav), [nav]);
  const href = (path: string) => localePath(locale, path);

  // Reads scroll from the Lenis instance the page is actually eased by, so the
  // header's state change lands on the same frame as the content it sits over.
  useLenis(({ scroll }) => {
    setScrolled(scroll > 24);
    if (pathname === "/" && scroll < 100) {
      setActiveSection("top");
    }
  });

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const sections = sectionIds.map((id) =>
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
  }, [pathname, sectionIds]);

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
            "absolute inset-0 flex flex-col transition-[filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "[filter:drop-shadow(0_10px_26px_rgb(7_42_42/0.16))]"
              : "[filter:drop-shadow(0_6px_18px_rgb(7_42_42/0.08))]",
          )}
        >
          <div className={cn(STRIP, "shrink-0 bg-white")} />
          {/* Height carrier. `flex-1`, not a fixed height: this layer is
              `inset-0` on a wrapper the content layer sizes, so it resolves to
              whatever the row plus the open menu comes to. That is what makes
              the surface itself stretch — the menu is not a card below the
              header, it is the header being taller. `BAR_MIN` is the floor that
              holds the closed shape at its usual h-13.

              The bar is a plain block INSIDE this rather than being the flex
              item itself, and that nesting is load-bearing: `INSET` ends in
              `xl:mx-auto`, and an auto cross-axis margin cancels a flex item's
              stretch. As a flex item the bar therefore sized to fit-content —
              zero, its only children being absolutely positioned fillets — and
              the two notch arcs collapsed back-to-back in the middle of the
              screen. Kept as a block, `INSET` means what it means everywhere
              else on the site. */}
          <div className={cn("flex-1", BAR_MIN)}>
            <div
              className={cn(
                "relative h-full bg-white",
                INSET,
                BAR_RADIUS,
                NOTCH,
              )}
            >
              <span className="notch-fillet notch-fillet-left absolute top-0 right-full bg-white" />
              <span className="notch-fillet notch-fillet-right absolute top-0 left-full bg-white" />
            </div>
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
              href={href("/")}
              // The home link is in view on every page, so a prefetch here
              // pulled the homepage's ~110KB payload on every load — on the
              // homepage itself included, since the internal path is `/en`.
              prefetch={false}
              aria-label={ui.homeAria}
              className="shrink-0 rounded-md transition-transform duration-300 hover:scale-[1.03] active:scale-[0.99]"
            >
              <TribuLogo
                tone="colour"
                markClassName="h-7 md:h-8"
                alt=""
                priority
                sizes="(min-width: 768px) 6rem, 5rem"
              />
            </Link>

            <nav aria-label={ui.primaryNav} className="hidden lg:block">
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
                        href={href(item.href)}
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
                            <span className="block ps-2 whitespace-nowrap">
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
                href={href("/partner")}
                className="hidden rounded-lg bg-brand-700 px-5 py-2.5 text-[0.875rem] font-semibold text-white transition-colors duration-300 hover:bg-brand-800 sm:inline-flex"
              >
                {ui.partnerCta}
              </Link>

              {/* Sits between the CTA and the menu trigger so it is reachable
                  at every width — the CTA hides below `sm`, the switch does
                  not. */}
              <LanguageSwitch locale={locale} label={ui.languageSwitch} />

              <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? ui.closeMenu : ui.openMenu}
                // Matched to the CTA's 37px so the two sit in the shorter bar
                // with the same air around them; still a 36px touch target.
                className="-me-1 grid size-9 place-items-center rounded-lg text-brand-800 transition-colors hover:bg-brand-50 lg:hidden"
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

          {/* ---- Mobile panel --------------------------------------------
              Deliberately NOT a card. It sits inside the content layer with no
              ground, no rounding and no shadow of its own, so what the eye
              follows is the bar behind it growing — the header becoming a
              taller header rather than a second surface arriving under it.

              The 0fr→1fr grid track is the only thing animating: it changes
              this element's height, which sizes the wrapper, which the shape
              layer fills. One transition drives the whole stretch, so the
              surface and its contents can never disagree about the height.

              `inert` keeps the collapsed panel out of the tab order without
              `hidden`, which cannot be transitioned. */}
          <div
            id="mobile-nav"
            ref={panelRef}
            inert={!open}
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
              INSET,
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="min-h-0">
              {/* Padding matches the bar's own, so the links stand on the same
                  gutter the logo does. */}
              <div className={cn(BAR_PAD, "pt-1 pb-5")}>
                <nav aria-label={ui.primaryNavMobile}>
                  <ul className="flex flex-col">
                    {nav.map((item, i) => {
                      // The same mark the desktop pill uses, so a link is the
                      // same object in both layouts. It replaces the old 01/02
                      // numbering, which named a link's position in the list
                      // rather than the place it goes.
                      const Icon = ICONS[item.icon];

                      return (
                        <li
                          key={item.href}
                          // Each link follows the surface down rather than
                          // racing it: the first waits out the opening third of
                          // the stretch, then they cascade. On close the delays
                          // are dropped so they clear together and the bar is
                          // never seen shrinking through live text.
                          className={cn(
                            "transition-[opacity,transform] duration-[460ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                            open
                              ? "translate-y-0 opacity-100"
                              : "translate-y-2 opacity-0",
                          )}
                          style={{
                            transitionDelay: open ? `${140 + i * 55}ms` : "0ms",
                          }}
                        >
                          <a
                            href={href(item.href)}
                            onClick={() => setOpen(false)}
                            // `items-center`, not the baseline the numerals sat
                            // on: an icon has no baseline to share with the
                            // label, and aligning one to it hangs it low.
                            className="flex items-center gap-4 border-b border-brand-50 py-3.5 font-display text-xl font-medium text-ink transition-colors hover:text-brand-600"
                          >
                            {/* Keeps the numerals' orange, so the accent stays
                                where it was and only the glyph changes. */}
                            <Icon
                              aria-hidden="true"
                              className="size-5 shrink-0 text-signal-500"
                            />
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    href={href("/partner")}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "mt-5 flex w-full items-center justify-center rounded-lg bg-brand-700 px-6 py-3.5 font-semibold text-white transition-[opacity,transform] duration-[460ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0",
                    )}
                    style={{
                      transitionDelay: open
                        ? `${140 + nav.length * 55}ms`
                        : "0ms",
                    }}
                  >
                    {ui.partnerCta}
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

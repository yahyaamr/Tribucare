"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { CardStack } from "@/components/site/card-stack";
import { TribuMark } from "@/components/brand/logo";
import {
  BrandLogo,
  VerticalCard,
} from "@/components/sections/vertical-card";
import type { ContentData } from "@/content/en";
import { type Locale } from "@/lib/i18n/config";

const DERMATOLOGY_STACK_BRANDS = [
  { name: "Rejuran", className: "h-5 max-w-[6.5rem]" },
  { name: "beaumed", className: "h-4 max-w-[5.25rem]" },
  { name: "Zimmer Medical", className: "h-3.5 max-w-[5rem]" },
  { name: "IDS", className: "h-4.5 max-w-[3.5rem]" },
  { name: "AGEX Beauty", className: "h-4 max-w-[5rem]" },
  { name: "BV Laser", className: "h-4 max-w-[5.25rem]" },
] as const;

/**
 * Renamed from `Expertise` and given props: the homepage's section list still
 * calls `<Expertise />` with no props, through the thin server wrapper in
 * `expertise.tsx`'s sibling that reads the content. Splitting it that way keeps
 * the "sections take no props" convention at the call site while letting a
 * client component receive what it cannot import.
 */
export function ExpertiseView({
  verticals,
  brandLogos,
  ui,
  locale,
}: {
  verticals: ContentData["verticals"];
  brandLogos: ContentData["brandLogos"];
  ui: ContentData["ui"]["sections"]["expertise"];
  locale: Locale;
}) {
  const [stackExpanded, setStackExpanded] = useState(false);

  return (
    <section id="expertise" className="ground-light relative py-24 md:py-32">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>{ui.eyebrow}</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
              lines={[
                ui.headlineLead,
                <span key="accent" className="text-brand-600">
                  {ui.headlineAccent}
                </span>,
              ]}
            />
          </div>
          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
{ui.intro}
            </p>
          </Reveal>
        </div>

        {/* Hierarchy connector: TribuCare → three verticals with brand logos.
            Pinned to `dir="ltr"` so it renders identically in both locales. It is
            a diagram, not a line of text — there is no reading order in it to
            mirror, and mirroring it only moved parts of it: the stems and dots
            follow the logical `start-1/2`, but the `-translate-x-1/2` that
            recentres each one is physical, so under RTL the 144px brand plates
            landed 144px left of the stems they hang from. Decorative and
            `aria-hidden`, so the fixed direction costs nothing. */}
        <div aria-hidden="true" dir="ltr" className="mt-16 hidden md:block">
          <div className="flex justify-center">
            <TribuMark className="h-[57px] w-auto" />
          </div>
          <div className="relative mt-4 h-28">
            <span className="absolute top-0 start-1/2 h-7 w-px -translate-x-1/2 bg-brand-400/70" />
            <div className="grid h-full grid-cols-3 gap-6">
              {[
                { name: "Rejuran", className: "h-5 max-w-[6.5rem]" },
                { name: "MLAY", className: "h-[16px] max-w-[5.25rem]" },
                { name: "Altesse Soin", className: "h-[22px] max-w-[7rem]" },
              ].map((item, i) => (
                <div key={item.name} className="group relative flex flex-col items-center">
                  <span
                    className={cn(
                      "absolute top-7 h-px bg-brand-400/45",
                      i === 0 && "end-[-12px] start-1/2",
                      i === 1 && "end-[-12px] start-[-12px]",
                      i === 2 && "end-1/2 start-[-12px]",
                    )}
                  />
                  <span className="absolute top-7 h-6 start-1/2 w-px -translate-x-1/2 bg-brand-400/45" />
                  <span className="absolute top-[50px] start-1/2 size-2 -translate-x-1/2 rounded-full bg-signal-500" />
                  {i === 0 ? (
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={stackExpanded}
                      onClick={() => setStackExpanded((prev) => !prev)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setStackExpanded((prev) => !prev);
                        }
                      }}
                      className={cn(
                        "absolute top-16 start-1/2 z-20 w-36 -translate-x-1/2 cursor-pointer select-none",
                        stackExpanded && "is-expanded",
                      )}
                    >
                      {DERMATOLOGY_STACK_BRANDS.map((brand, idx) => {
                        const isTop = idx === 0;
                        const zIndex = 60 - idx * 10;
                        const defaultY = `${idx * 5}px`;
                        const hoverY = `${idx * 26}px`;

                        return (
                          <div
                            key={brand.name}
                            style={
                              {
                                zIndex,
                                "--default-y": defaultY,
                                "--hover-y": hoverY,
                              } as React.CSSProperties
                            }
                            className={cn(
                              "flex h-9.5 w-full items-center justify-center rounded-xl border border-brand-200/80 bg-white shadow-sm backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                              isTop
                                ? "relative group-hover:border-brand-400 group-hover:shadow-md"
                                : "absolute top-0 start-0 group-hover:border-brand-300 group-hover:shadow-md",
                              stackExpanded
                                ? "translate-y-[var(--hover-y)] border-brand-300 shadow-md"
                                : "translate-y-[var(--default-y)] group-hover:translate-y-[var(--hover-y)]",
                            )}
                          >
                            <BrandLogo
                              brandLogos={brandLogos}
                              name={brand.name}
                              className={cn(
                                brand.className,
                                !isTop &&
                                  (stackExpanded
                                    ? "opacity-100"
                                    : "opacity-80 transition-opacity duration-300 group-hover:opacity-100"),
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="absolute top-16 start-1/2 flex h-9.5 w-36 -translate-x-1/2 items-center justify-center rounded-xl border border-brand-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-brand-400 hover:shadow-md">
                      <BrandLogo brandLogos={brandLogos} name={item.name} className={item.className} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-width cards that stack into layers as you scroll. Where the
            viewport holds a whole card it pins by the card's top edge; where it
            does not, <CardStack> measures the offset that pins it by its last
            line instead, so the next card never arrives before this one has
            been read. See `.stack-card` in globals.css. */}
        {/* `gap-40` is not decorative space — below `lg` no gap is ever seen at
            rest, because a card catches before the next one arrives. It is the
            beat: the distance the next card must travel after this one pins,
            so the card settles, holds with air beneath it, and only then is
            reached. `lg:gap-8` restores the ordinary gap for the desktop
            stack, which pins by the top edge and needs no such delay. */}
        <CardStack className="mt-16 flex flex-col gap-40 md:mt-24 lg:gap-8">
          {verticals.map((vertical, i) => (
            <li
              key={vertical.id}
              className="stack-card"
              style={
                {
                  // Clears the notched header with room to breathe, so a pinned
                  // card fits comfortably with top and bottom padding on laptop screens.
                  "--stack-top": `clamp(4.5rem, ${5.5 + i * 1.25}dvh, ${6 + i * 1.5}rem)`,
                } as React.CSSProperties
              }
            >
              <Reveal from="scale" travel="34px">
                <VerticalCard
                  vertical={vertical}
                  brandLogos={brandLogos}
                  locale={locale}
                />
              </Reveal>
            </li>
          ))}
        </CardStack>
      </Shell>
    </section>
  );
}

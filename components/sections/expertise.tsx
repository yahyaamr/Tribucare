"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { CardStack } from "@/components/site/card-stack";
import { WaveField } from "@/components/brand/wave-field";
import { TribuLogo, TribuMark } from "@/components/brand/logo";
import { verticals, brandLogos } from "@/content/site";

function BrandLogo({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const logo = brandLogos[name];
  if (!logo) return <span className="font-semibold text-ink">{name}</span>;
  return (
    <Image
      src={logo.src}
      alt={name}
      width={logo.width}
      height={logo.height}
      className={cn("w-auto object-contain", className || "h-5 max-w-[6.5rem]")}
    />
  );
}

/** The card's call to action, and the overlay that makes the whole card it. */
const CTA_CLASS =
  "mt-8 inline-flex items-center gap-1.5 self-start text-[1rem] font-semibold text-brand-600 transition-colors hover:text-brand-800 lg:mt-[clamp(1.25rem,3dvh,2rem)]";

function CardCta({ href, label }: { href: string; label: string }) {
  const inner = (
    <>
      {label}
      <ArrowUpRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
      <span className="absolute inset-0" aria-hidden="true" />
    </>
  );

  return href.startsWith("/") ? (
    <Link href={href} className={CTA_CLASS}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={CTA_CLASS}>
      {inner}
    </a>
  );
}

const DERMATOLOGY_STACK_BRANDS = [
  { name: "Rejuran", className: "h-5 max-w-[6.5rem]" },
  { name: "beaumed", className: "h-4 max-w-[5.25rem]" },
  { name: "Zimmer Medical", className: "h-3.5 max-w-[5rem]" },
  { name: "IDS", className: "h-4.5 max-w-[3.5rem]" },
  { name: "AGEX Beauty", className: "h-4 max-w-[5rem]" },
  { name: "BV Laser", className: "h-4 max-w-[5.25rem]" },
] as const;

export function Expertise() {
  const [stackExpanded, setStackExpanded] = useState(false);

  return (
    <section id="expertise" className="ground-light relative py-24 md:py-32">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>Our Expertise</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
              lines={[
                "One company.",
                <span key="accent" className="text-brand-600">
                  Three connected verticals.
                </span>,
              ]}
            />
          </div>
          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
              Dermatology technology, home beauty devices and medicated skincare
              are not three separate businesses. They are one route to market —
              the same clinical knowledge, distribution infrastructure and
              support teams applied at every level of the category.
            </p>
          </Reveal>
        </div>

        {/* Hierarchy connector: TribuCare → three verticals with brand logos */}
        <div aria-hidden="true" className="mt-16 hidden md:block">
          <div className="flex justify-center">
            <TribuMark className="h-[57px] w-auto" />
          </div>
          <div className="relative mt-4 h-28">
            <span className="absolute top-0 left-1/2 h-7 w-px -translate-x-1/2 bg-brand-400/70" />
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
                      i === 0 && "right-[-12px] left-1/2",
                      i === 1 && "right-[-12px] left-[-12px]",
                      i === 2 && "right-1/2 left-[-12px]",
                    )}
                  />
                  <span className="absolute top-7 h-6 left-1/2 w-px -translate-x-1/2 bg-brand-400/45" />
                  <span className="absolute top-[50px] left-1/2 size-2 -translate-x-1/2 rounded-full bg-signal-500" />
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
                        "absolute top-16 left-1/2 z-20 w-36 -translate-x-1/2 cursor-pointer select-none",
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
                                : "absolute top-0 left-0 group-hover:border-brand-300 group-hover:shadow-md",
                              stackExpanded
                                ? "translate-y-[var(--hover-y)] border-brand-300 shadow-md"
                                : "translate-y-[var(--default-y)] group-hover:translate-y-[var(--hover-y)]",
                            )}
                          >
                            <BrandLogo
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
                    <div className="absolute top-16 left-1/2 flex h-9.5 w-36 -translate-x-1/2 items-center justify-center rounded-xl border border-brand-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-brand-400 hover:shadow-md">
                      <BrandLogo name={item.name} className={item.className} />
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
                <article className="group relative isolate flex min-h-[var(--stack-card-height,auto)] flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.05] bg-white shadow-[0_40px_80px_-56px_rgb(7_42_42/0.55)] transition-shadow duration-700 hover:shadow-[0_54px_100px_-58px_rgb(7_42_42/0.62)] lg:rounded-[2.25rem]">
                  {/* Wave field washes across the card's bottom-left corner,
                      under both columns, exactly as the deck sets it. */}
                  <WaveField
                    tone="light"
                    lines={16}
                    className="absolute bottom-0 left-0 -z-10 h-[34%] w-[130%] opacity-60 lg:h-[24%] lg:w-[62%]"
                  />

                  {/* `flex-1` rather than a bare grid: `min-h-[...]` above is
                      only a floor on the article, and the article is not
                      itself a layout container for it, so a shorter card's
                      grid — sized to its own now-shorter content — used to
                      stop short of that floor and leave the gap empty
                      instead of the media panel reaching the card's true
                      bottom edge. Growing the grid to fill whatever height
                      the article actually ends up at removes the gap
                      regardless of which card is tallest at the time. */}
                  <div className="grid flex-1 lg:grid-cols-2">
                    <div className="order-2 flex flex-col justify-center p-7 sm:p-10 lg:order-1 lg:p-[clamp(1.5rem,3dvh,2.75rem)] xl:py-[clamp(1.5rem,3.2dvh,3.25rem)] xl:pr-10 xl:pl-14">
                      {/* Nowrap from `sm` up: the badge is sized to fit beside
                          the number at every width down to a small tablet, so
                          it no longer drops to a second line under it. Below
                          `sm` the longest label ("Professional Dermatology
                          Solutions") has no width left to shrink into without
                          going illegible, so it falls back to wrapping there
                          rather than clipping against the card edge. */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap">
                        <span className="font-display text-[clamp(2.5rem,min(8vw,9dvh),6.5rem)] leading-[0.78] font-semibold text-brand-200/85">
                          {vertical.number}
                        </span>
                        <span className="shrink-0 rounded-xl border border-signal-500/55 px-[0.65rem] py-[0.325rem] font-mono text-[0.45rem] leading-none tracking-[0.14em] text-signal-600 uppercase lg:px-[0.8125rem] lg:py-[0.406rem] lg:text-[0.47rem]">
                          {vertical.label}
                        </span>
                      </div>

                      <h3 className="mt-6 max-w-[9.5em] font-display text-[clamp(1.75rem,min(3.8vw,5.5dvh),3rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink lg:mt-[clamp(0.875rem,2dvh,1.5rem)]">
                        {vertical.headline}
                      </h3>
                      <span
                        aria-hidden="true"
                        className="mt-5 block h-[3px] w-14 rounded-full bg-brand-600"
                      />

                      <p className="mt-5 max-w-[26rem] text-[0.95rem] leading-[1.6] text-ink-soft sm:text-[1.0625rem] lg:mt-[clamp(0.75rem,1.75dvh,1.25rem)]">
                        {vertical.body}
                      </p>

                      <div className="mt-6 border-t border-black/[0.07] pt-5 lg:mt-[clamp(0.875rem,2.2dvh,1.75rem)] lg:pt-[clamp(0.75rem,1.75dvh,1.25rem)]">
                        <p className="eyebrow text-ink-faint">Brands</p>
                        {/* Logo plates. Every plate is the same fixed box
                            regardless of the mark's aspect ratio (1.4:1 to
                            6:1), so the row reads as a set of matched cards
                            rather than tag-shaped chips of varying width.

                            Box width is the tight constraint: Dermatology's
                            six marks have to fit on one row even at the
                            narrowest point of the two-column layout (~409px
                            available right at `lg`) — 6 × plate + 5 × gap must
                            clear that, which is what sizes the plate down from
                            what a single mark like MLAY would otherwise get. */}
                        <ul className="mt-3.5 flex flex-wrap items-center gap-1.5 lg:gap-2">
                          {vertical.brands.map((brand) => {
                            const logo = brandLogos[brand];
                            return (
                              <li
                                key={brand}
                                className="flex h-7 w-[3.625rem] items-center justify-center rounded-lg bg-black/[0.045] transition-colors duration-300 hover:bg-brand-100/70 lg:h-9 lg:w-[4.75rem] lg:rounded-lg"
                              >
                                {logo ? (
                                  <Image
                                    src={logo.src}
                                    alt={brand}
                                    width={logo.width}
                                    height={logo.height}
                                    className="max-h-5 max-w-[3.125rem] object-contain lg:max-h-[1.625rem] lg:max-w-[4.125rem]"
                                  />
                                ) : (
                                  <span className="text-[0.85rem] font-semibold tracking-[0.02em] text-ink/85 lg:text-[0.95rem]">
                                    {brand}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* A route gets Next's <Link>, so the card navigates
                          client-side like every other internal link here rather
                          than reloading the whole document. An in-page anchor
                          stays a plain <a>: Lenis's smooth-scroll handler reads
                          the click off the document, and <Link> would
                          preventDefault it away. The overlay span is what makes
                          the whole card the target, either way. */}
                      <CardCta href={vertical.cta.href} label={vertical.cta.label} />
                    </div>

                    {/* Light media panel: the cut-out product floats over a soft
                        mint disc, with the TribuCare lock-up in the corner. */}
                    <div className="relative order-1 min-h-[22rem] sm:min-h-[26rem] lg:order-2 lg:min-h-[min(28rem,48dvh)]">
                      {/* Bottom-anchored rather than centred on the panel: the
                          product image is itself bottom-anchored, so the disc
                          has to sit at the same edge to stay coupled to it
                          however tall the (now height-matched) panel gets —
                          centring it would drift the disc upward, away from
                          the image, on any card shorter than the tallest. */}
                      <div
                        aria-hidden="true"
                        className="absolute bottom-[6%] left-[37%] aspect-square w-[68%] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-100/90 to-brand-50/30 lg:left-[55%]"
                      />

                      {/* Anchored to the panel's bottom-right corner. The panel
                          fills the full card height, so the image's bottom edge
                          always lands on the card's bottom edge, whatever the
                          source aspect ratio. Only the top overshoots, so tall
                          portrait shots bleed past the card's top instead of
                          leaving headroom. */}
                      <div className="absolute inset-x-0 -top-[8%] bottom-0">
                        <Image
                          src={vertical.image.src}
                          alt={vertical.image.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-contain object-right-bottom pl-6 transition-transform duration-700 group-hover:scale-[1.03] sm:pl-8 lg:pl-8"
                        />
                      </div>

                      <TribuLogo
                        className="absolute right-7 bottom-6 lg:right-10 lg:bottom-7"
                        markClassName="h-8"
                      />
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </CardStack>
      </Shell>
    </section>
  );
}

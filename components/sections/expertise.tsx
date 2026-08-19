import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
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

export function Expertise() {
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
                <div key={item.name} className="relative flex flex-col items-center">
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
                  <div className="absolute top-16 left-1/2 flex h-9.5 -translate-x-1/2 items-center rounded-xl border border-brand-200/80 bg-white/90 px-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-brand-400 hover:shadow-md">
                    <BrandLogo name={item.name} className={item.className} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full-width cards that stack into layers as you scroll. `stack-card`
            only engages on viewports wide and tall enough to hold the stack —
            see globals.css. */}
        <ul className="mt-16 flex flex-col gap-6 md:mt-24 lg:gap-8">
          {verticals.map((vertical, i) => (
            <li
              key={vertical.id}
              className="stack-card"
              style={
                {
                  // Clears the notched header (60px) with room to breathe, so a
                  // pinned card never crowds the nav, then steps each card down
                  // by a fixed increment to keep the previous card's top edge
                  // readable behind it.
                  "--stack-top": `clamp(5.5rem, ${8 + i * 1.25}dvh, ${7.5 + i * 1.75}rem)`,
                } as React.CSSProperties
              }
            >
              <Reveal from="scale" travel="34px">
                <article className="group relative isolate overflow-hidden rounded-[1.75rem] border border-black/[0.05] bg-white shadow-[0_40px_80px_-56px_rgb(7_42_42/0.55)] transition-shadow duration-700 hover:shadow-[0_54px_100px_-58px_rgb(7_42_42/0.62)] lg:rounded-[2.25rem]">
                  {/* Wave field washes across the card's bottom-left corner,
                      under both columns, exactly as the deck sets it. */}
                  <WaveField
                    tone="light"
                    lines={16}
                    className="absolute bottom-0 left-0 -z-10 h-[34%] w-[130%] opacity-60 lg:h-[24%] lg:w-[62%]"
                  />

                  <div className="grid lg:grid-cols-2">
                    <div className="order-2 flex flex-col justify-center p-7 sm:p-10 lg:order-1 lg:p-[clamp(1.75rem,4dvh,3.5rem)] xl:py-[clamp(1.75rem,4dvh,4rem)] xl:pr-10 xl:pl-16">
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <span className="font-display text-[clamp(2.75rem,min(10.5vw,12dvh),8.5rem)] leading-[0.78] font-semibold text-brand-200/85">
                          {vertical.number}
                        </span>
                        <span className="eyebrow rounded-xl border border-signal-500/55 px-4 py-2 text-signal-600 max-sm:text-[0.625rem] max-sm:tracking-[0.14em] lg:px-5 lg:py-2.5 lg:text-[0.72rem]">
                          {vertical.label}
                        </span>
                      </div>

                      <h3 className="mt-8 max-w-[9.5em] font-display text-[clamp(1.875rem,min(4.4vw,7dvh),3.5rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink lg:mt-[clamp(1.25rem,3dvh,2rem)]">
                        {vertical.headline}
                      </h3>
                      <span
                        aria-hidden="true"
                        className="mt-6 block h-[3px] w-14 rounded-full bg-brand-600"
                      />

                      <p className="mt-7 max-w-[26rem] text-[1.0625rem] leading-[1.65] text-ink-soft lg:mt-[clamp(1rem,2.5dvh,1.75rem)]">
                        {vertical.body}
                      </p>

                      <div className="mt-9 border-t border-black/[0.07] pt-7 lg:mt-[clamp(1.25rem,3dvh,2.25rem)] lg:pt-[clamp(1rem,2.5dvh,1.75rem)]">
                        <p className="eyebrow text-ink-faint">Brands</p>
                        {/* Logo plates. Marks are set to a shared height rather
                            than a shared box, so a row of them reads as one set
                            despite aspect ratios from 1.4:1 to 6:1. */}
                        <ul className="mt-4 flex flex-wrap items-center gap-2.5">
                          {vertical.brands.map((brand) => {
                            const logo = brandLogos[brand];
                            return (
                              <li
                                key={brand}
                                className="flex h-11 items-center rounded-xl bg-black/[0.045] px-3.5 transition-colors duration-300 hover:bg-brand-100/70"
                              >
                                {logo ? (
                                  <Image
                                    src={logo.src}
                                    alt={brand}
                                    width={logo.width}
                                    height={logo.height}
                                    className="h-5 w-auto max-w-[6.5rem] object-contain"
                                  />
                                ) : (
                                  <span className="text-[0.85rem] font-semibold tracking-[0.02em] text-ink/85">
                                    {brand}
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <a
                        href={vertical.cta.href}
                        className="mt-8 inline-flex items-center gap-1.5 self-start text-[1rem] font-semibold text-brand-600 transition-colors hover:text-brand-800 lg:mt-[clamp(1.25rem,3dvh,2rem)]"
                      >
                        {vertical.cta.label}
                        <ArrowUpRight
                          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                        <span className="absolute inset-0" aria-hidden="true" />
                      </a>
                    </div>

                    {/* Light media panel: the cut-out product floats over a soft
                        mint disc, with the TribuCare lock-up in the corner. */}
                    <div className="relative order-1 min-h-[22rem] sm:min-h-[26rem] lg:order-2 lg:min-h-[min(34rem,58dvh)]">
                      <div
                        aria-hidden="true"
                        className="absolute top-1/2 left-[37%] aspect-square w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-100/90 to-brand-50/30 lg:left-[55%]"
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
        </ul>
      </Shell>
    </section>
  );
}

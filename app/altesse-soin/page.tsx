import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { Rail } from "@/components/site/rail";
import { CardStepper } from "@/components/site/card-stepper";
import { WaveField } from "@/components/brand/wave-field";
import { EventCard } from "@/components/events/event-card";
import { AltesseProductCard } from "@/components/altesse/altesse-product-card";
import {
  altesse,
  altesseProductLines,
  altesseCategoriesFor,
} from "@/content/altesse";
import { brandLogos } from "@/content/site";

export const metadata: Metadata = {
  title: "Altesse Soin — Medicated Skincare",
  description:
    "TribuCare's flagship skincare brand. Clinically inspired formulations combining advanced dermatological science with premium active ingredients for Middle Eastern climates.",
  openGraph: {
    type: "website",
    title: "Altesse Soin — Medicated Skincare | TribuCare",
    description:
      "Explore Altesse Soin's dermatologist-crafted skincare routines: Cica barrier repair, Lustré brightening, and climate-adapted protective skincare.",
  },
  alternates: { canonical: "/altesse-soin" },
};

function BrandPlate({ name }: { name: string }) {
  const logo = brandLogos[name];

  return (
    <span className="flex h-11 items-center rounded-xl bg-white px-4 shadow-[0_10px_24px_-18px_rgb(7_42_42/0.55)] transition-transform duration-300 hover:-translate-y-0.5">
      {logo ? (
        <Image
          src={logo.src}
          alt={name}
          width={logo.width}
          height={logo.height}
          className="h-5 w-auto max-w-[6.5rem] object-contain"
        />
      ) : (
        <span className="text-[0.85rem] font-semibold tracking-[0.02em] text-ink/85">
          {name}
        </span>
      )}
    </span>
  );
}

const HERO_IMAGE_SIZES = "(max-width: 1024px) 88vw, 54vw";

export default function AltesseSoinPage() {
  return (
    <>
      {/* ---- Hero ------------------------------------------------------- */}
      <section id="top" className="ground-deep relative isolate overflow-hidden">
        <WaveField
          tone="dark"
          lines={26}
          className="absolute inset-x-0 -bottom-16 h-[58%] w-[200%] opacity-45"
        />

        <div
          className="pointer-events-none absolute right-0 bottom-0 z-0 hidden h-[86%] w-[54%] lg:block"
          aria-hidden="true"
        >
          <Image
            src={altesse.image.src}
            alt={altesse.image.alt}
            fill
            priority
            sizes={HERO_IMAGE_SIZES}
            className="object-contain object-right-bottom"
          />
        </div>

        <Shell className="relative z-10 pt-30 pb-24 md:pt-36 md:pb-32 lg:pt-44">
          <div className="lg:w-[52%]">
            <div>
              <Reveal>
                <div className="flex items-center gap-3">
                  <Eyebrow tone="light">{altesse.eyebrow}</Eyebrow>
                  <span className="rounded-full bg-white/10 px-3 py-0.5 text-[0.7rem] font-semibold tracking-wider text-brand-200 uppercase backdrop-blur-sm">
                    Our Flagship Skincare
                  </span>
                </div>
              </Reveal>

              <LineReveal
                as="h1"
                delay={80}
                stagger={110}
                className="mt-7 font-display text-[clamp(2.5rem,5.3vw,4.25rem)] leading-[1] font-semibold tracking-[-0.03em] text-white"
                lines={[
                  altesse.headlineLead,
                  <span
                    key="accent"
                    className="bg-gradient-to-r from-brand-200 via-circuit-300 to-brand-300 bg-clip-text text-transparent"
                  >
                    {altesse.headlineAccent}
                  </span>,
                ]}
              />

              <Reveal delay={160}>
                <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-brand-100/85 md:text-lg">
                  {altesse.intro}
                </p>
              </Reveal>

              <Reveal delay={220}>
                <p className="mt-4 eyebrow text-brand-300">
                  {altesse.audience}
                </p>
              </Reveal>

              <Reveal delay={280}>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#catalogue"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-[0.95rem] font-semibold text-brand-800 transition-[background-color,box-shadow] duration-300 hover:bg-brand-50 hover:shadow-[0_18px_40px_-18px_rgb(76_201_222/0.7)]"
                  >
                    Explore the catalogue
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </a>
                  <a
                    href="https://altessesoin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-7 py-4 text-[0.95rem] font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors duration-300 hover:bg-white/10 hover:ring-white/40"
                  >
                    Shop on altessesoin.com
                  </a>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="mt-10 -mr-5 sm:-mr-8 lg:hidden">
            <Image
              src={altesse.image.src}
              alt={altesse.image.alt}
              width={altesse.image.width}
              height={altesse.image.height}
              priority
              sizes={HERO_IMAGE_SIZES}
              className="ml-auto h-auto w-[88%] max-w-none [-webkit-mask-image:linear-gradient(to_top,transparent_0,#000_24%)] [mask-image:linear-gradient(to_top,transparent_0,#000_24%)]"
            />
          </div>

          {/* Brand marks */}
          <Reveal delay={340}>
            <div className="mt-16 border-t border-white/10 pt-8">
              <p className="eyebrow text-brand-300">Own Flagship Brand</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {altesse.brands.map((brand) => (
                  <BrandPlate key={brand} name={brand} />
                ))}
              </div>
            </div>
          </Reveal>
        </Shell>
      </section>

      {/* ---- Catalogue -------------------------------------------------- */}
      <section id="catalogue" className="ground-light relative py-24 md:py-32">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow>{altesse.catalogue.eyebrow}</Eyebrow>
              </Reveal>
              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
                lines={[
                  altesse.catalogue.headlineLead,
                  <span key="accent" className="text-brand-600">
                    {altesse.catalogue.headlineAccent}
                  </span>,
                ]}
              />
            </div>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {altesse.catalogue.intro}
              </p>
            </Reveal>
          </div>

          <div className="mt-16 space-y-20 md:mt-24 md:space-y-24">
            {altesseProductLines.map((line, lineIndex) => (
              <div key={line.id}>
                <Reveal>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-brand-100 pt-8">
                    <span className="font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-none font-semibold text-brand-200/85">
                      {line.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[clamp(1.375rem,2.6vw,1.875rem)] leading-snug font-semibold tracking-[-0.02em] text-ink">
                        {line.label}
                      </h3>
                      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
                        {line.blurb}
                      </p>
                    </div>
                  </div>
                </Reveal>

                {altesseCategoriesFor(line.id).map((group, groupIndex) => (
                  <div key={group.category} className="mt-12">
                    <Reveal delay={60}>
                      <p className="eyebrow text-ink-faint">{group.category}</p>
                    </Reveal>

                    <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((product, i) => (
                        <Reveal
                          as="li"
                          key={product.slug}
                          delay={Math.min(i + groupIndex + lineIndex, 6) * 70}
                          from="scale"
                          className="h-full"
                        >
                          <AltesseProductCard product={product} />
                        </Reveal>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Shell>
      </section>

      {/* ---- Where we show up / Moments --------------------------------- */}
      <section className="ground-deep relative isolate overflow-hidden py-24 md:py-32">
        <WaveField
          tone="dark"
          lines={22}
          className="absolute inset-x-0 top-1/4 h-[70%] w-[200%] opacity-25"
        />

        <Shell className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <Eyebrow tone="light">{altesse.moments.eyebrow}</Eyebrow>
              <h2 className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-balance text-white">
                {altesse.moments.headlineLead}{" "}
                <span className="text-brand-300">{altesse.moments.headlineAccent}</span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-brand-100/80">
                {altesse.moments.intro}
              </p>
            </Reveal>
          </div>

          <div className="mt-16">
            <Reveal className="max-lg:hidden">
              <div className="flex justify-end border-t border-white/10 pt-8">
                <p className="text-[0.8125rem] text-brand-100/50">
                  Drag or scroll for more →
                </p>
              </div>
            </Reveal>

            {/* Below lg the rail becomes a stepped carousel — a vertical swipe
                on a phone never drags the row sideways. */}
            <CardStepper
              aria-label={altesse.moments.eyebrow}
              tone="dark"
              className="lg:hidden"
            >
              {altesse.moments.items.map((item) => (
                <EventCard key={item.title} event={item} sizes="100vw" />
              ))}
            </CardStepper>

            <Rail
              aria-label={altesse.moments.eyebrow}
              className="mt-8 gap-5 pb-4 max-lg:hidden"
            >
              {altesse.moments.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={Math.min(i, 4) * 70}
                  from="scale"
                  className="rail-item w-[19rem] sm:w-[21rem]"
                >
                  <EventCard event={item} sizes="(max-width: 640px) 80vw, 21rem" />
                </Reveal>
              ))}
            </Rail>
          </div>
        </Shell>
      </section>

      {/* ---- Support ----------------------------------------------------- */}
      <section className="ground-light relative py-24 md:py-32">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow>{altesse.support.eyebrow}</Eyebrow>
              </Reveal>
              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
                lines={[
                  altesse.support.headline,
                  <span key="accent" className="text-brand-600">
                    {altesse.support.headlineAccent}
                  </span>,
                ]}
              />
            </div>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {altesse.support.body}
              </p>
            </Reveal>
          </div>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {altesse.support.capabilities.map((capability, i) => (
              <Reveal as="li" key={capability.title} delay={i * 80} travel="32px">
                <div className="group border-t border-brand-100 pt-6 transition-colors duration-500 hover:border-signal-500/60">
                  <h3 className="font-display text-base font-semibold text-ink">
                    {capability.title}
                  </h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-soft">
                    {capability.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Shell>
      </section>
    </>
  );
}

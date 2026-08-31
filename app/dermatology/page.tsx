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
import { ProductCard } from "@/components/dermatology/product-card";
import { ProductVideo } from "@/components/dermatology/product-video";
import { HeroSlideshow } from "@/components/dermatology/hero-slideshow";
import {
  dermatology,
  productLines,
  categoriesFor,
} from "@/content/dermatology";
import { brandLogos, events } from "@/content/site";

export const metadata: Metadata = {
  title: "Dermatology Solutions",
  description:
    "Professional aesthetic and dermatology devices and injectables for clinics across Egypt and MENA — laser hair reduction, fractional CO2, microneedling RF, PN and poly-L-lactic acid, with training and field support.",
  openGraph: {
    type: "website",
    title: "TribuCare Dermatology Solutions — Devices & Injectables",
    description:
      "Professional aesthetic devices and injectables for dermatologists, clinics and aesthetic centres, with clinical training and technical support.",
  },
  alternates: { canonical: "/dermatology" },
};

/**
 * Shared-height mark on a white plate — the same treatment the Expertise cards
 * give a row of brands, and the reason it is a plate rather than a filter is
 * that these logos are full colour. Knocking them white would be a new
 * treatment, and the site's rule is that cards stay white even on a deep
 * ground. Brands the deck carries no mark for fall back to their name.
 */
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

/** Shared by both copies of the hero shot, so the browser resolves the same
 *  srcset candidate for either and downloads the file exactly once. */
const HERO_IMAGE_SIZES = "(max-width: 1024px) 88vw, 54vw";

export default function DermatologyPage() {
  return (
    <>
      {/* ---- Hero ------------------------------------------------------- */}
      <section id="top" className="ground-deep relative isolate overflow-hidden">
        <WaveField
          tone="dark"
          lines={26}
          className="absolute inset-x-0 -bottom-16 h-[58%] w-[200%] opacity-45"
        />

        {/* The shot is cropped in the source — the subject runs out at the
            bottom and the right. Floated in the middle of the ground, both cut
            lines are visible and it reads as a broken image. Hung off the
            section's own bottom-right corner instead, those two edges land ON
            the section's edges, where a straight edge is what you expect. It is
            the same move the homepage's Professional Dermatology card makes,
            for the same reason.

            `object-contain object-right-bottom` is what pins it there: contain
            keeps the shot whole, right-bottom parks it in the corner whatever
            the box's aspect works out to, so it stays flush at every width. */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 z-0 hidden h-[86%] w-[54%] lg:block"
          aria-hidden="true"
        >
          <HeroSlideshow
            slides={dermatology.heroSlides}
            sizes={HERO_IMAGE_SIZES}
            priority
            className="h-full w-full"
            imageClassName="object-contain object-right-bottom"
          />
        </div>

        <Shell className="relative z-10 pt-30 pb-24 md:pt-36 md:pb-32 lg:pt-44">
          <div className="lg:w-[52%]">
            <div>
              <Reveal>
                <Eyebrow tone="light">{dermatology.eyebrow}</Eyebrow>
              </Reveal>

              <LineReveal
                as="h1"
                delay={80}
                stagger={110}
                className="mt-7 font-display text-[clamp(2.5rem,5.3vw,4.25rem)] leading-[1] font-semibold tracking-[-0.03em] text-white"
                lines={[
                  dermatology.headlineLead,
                  <span
                    key="accent"
                    className="bg-gradient-to-r from-brand-200 via-circuit-300 to-brand-300 bg-clip-text text-transparent"
                  >
                    {dermatology.headlineAccent}
                  </span>,
                ]}
              />

              <Reveal delay={160}>
                <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-brand-100/85 md:text-lg">
                  {dermatology.intro}
                </p>
              </Reveal>

              <Reveal delay={220}>
                <p className="mt-4 eyebrow text-brand-300">
                  {dermatology.audience}
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
                  <Link
                    href="/partner"
                    className="inline-flex items-center justify-center rounded-xl px-7 py-4 text-[0.95rem] font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors duration-300 hover:bg-white/10 hover:ring-white/40"
                  >
                    Talk to our team
                  </Link>
                </div>
              </Reveal>
            </div>

          </div>

          {/* Below lg the shot cannot hang off the section corner — the brand
              row and the copy are stacked under it — so it runs in flow,
              pushed hard against the right edge of the screen so that cut is
              off-viewport, and its bottom cut is taken out by a wash back to
              the ground colour instead of a hard line.

              Rendered as a second copy rather than repositioned, the way the
              homepage hero does it: only one is ever displayed, and both carry
              the identical `sizes` list so the browser resolves the same
              srcset candidate and fetches the file once. */}
          <div className="mt-10 -mr-5 sm:-mr-8 lg:hidden">
            <HeroSlideshow
              slides={dermatology.heroSlides}
              alt={dermatology.image.alt}
              shape="flow"
              priority
              sizes={HERO_IMAGE_SIZES}
              className="ml-auto w-[88%]"
              // The bottom cut is taken out by masking the shot's own alpha
              // rather than laying a coloured panel over it. The ground here is
              // not flat — it carries two radial blooms and the wave field — so
              // a solid fade would have to match a colour that changes across
              // the section, and would band wherever it guessed wrong. Fading
              // the image to transparent instead lets whatever is actually
              // behind it show through, at any width and on any ground.
              // `object-contain object-bottom` so the slides that are not the
              // one holding the layout keep their own aspect ratio inside its
              // box rather than being stretched to fill it — they sit on its
              // bottom edge, where the mask is.
              imageClassName="h-auto w-full max-w-none object-contain object-bottom [-webkit-mask-image:linear-gradient(to_top,transparent_0,#000_24%)] [mask-image:linear-gradient(to_top,transparent_0,#000_24%)]"
            />
          </div>

          {/* Promo film. Renders only once a source exists — see
              content/dermatology.ts. Full width beneath the hero pair rather
              than beside the copy, now that the shot holds that column. */}
          {dermatology.video && (
            <Reveal className="mt-16" delay={120} from="scale">
              <ProductVideo
                src={dermatology.video}
                poster={dermatology.videoPoster}
                title={dermatology.videoTitle}
              />
            </Reveal>
          )}

          {/* Brand marks. Shared height so the row reads as one set. */}
          <Reveal delay={340}>
            <div className="mt-16 border-t border-white/10 pt-8">
              <p className="eyebrow text-brand-300">Brands we represent</p>
              <div className="mt-6 space-y-3">
                <ul className="flex flex-wrap items-center gap-3">
                  {dermatology.brands.slice(0, 5).map((brand) => (
                    <li key={brand}>
                      <BrandPlate name={brand} />
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-wrap items-center gap-3">
                  {dermatology.brands.slice(5).map((brand) => (
                    <li key={brand}>
                      <BrandPlate name={brand} />
                    </li>
                  ))}
                </ul>
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
                <Eyebrow>{dermatology.catalogue.eyebrow}</Eyebrow>
              </Reveal>
              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
                lines={[
                  dermatology.catalogue.headlineLead,
                  <span key="accent" className="text-brand-600">
                    {dermatology.catalogue.headlineAccent}
                  </span>,
                ]}
              />
            </div>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {dermatology.catalogue.intro}
              </p>
            </Reveal>
          </div>

          <div className="mt-16 space-y-20 md:mt-24 md:space-y-24">
            {productLines.map((line, lineIndex) => (
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

                {categoriesFor(line.id).map((group, groupIndex) => (
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
                          <ProductCard product={product} />
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

      {/* ---- Where we show up ------------------------------------------- */}
      <section className="ground-deep relative isolate overflow-hidden py-24 md:py-32">
        <WaveField
          tone="dark"
          lines={22}
          className="absolute inset-x-0 top-1/4 h-[70%] w-[200%] opacity-25"
        />

        <Shell className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <Eyebrow tone="light">{events.eyebrow}</Eyebrow>
              <h2 className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-balance text-white">
                {events.headlineLead}{" "}
                <span className="text-brand-300">{events.headlineAccent}</span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-brand-100/80">
                {events.intro}
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
              aria-label={events.eyebrow}
              tone="dark"
              className="lg:hidden"
            >
              {events.items.map((event) => (
                <EventCard key={event.title} event={event} sizes="100vw" />
              ))}
            </CardStepper>

            <Rail
              aria-label={events.eyebrow}
              className="mt-8 gap-5 pb-4 max-lg:hidden"
            >
              {events.items.map((event, i) => (
                <Reveal
                  as="li"
                  key={event.title}
                  delay={Math.min(i, 4) * 70}
                  from="scale"
                  className="rail-item w-[19rem] sm:w-[21rem]"
                >
                  <EventCard event={event} sizes="(max-width: 640px) 80vw, 21rem" />
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
                <Eyebrow>{dermatology.support.eyebrow}</Eyebrow>
              </Reveal>
              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
                lines={[
                  dermatology.support.headline,
                  <span key="accent" className="text-brand-600">
                    {dermatology.support.headlineAccent}
                  </span>,
                ]}
              />
            </div>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {dermatology.support.body}
              </p>
            </Reveal>
          </div>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {dermatology.support.capabilities.map((capability, i) => (
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

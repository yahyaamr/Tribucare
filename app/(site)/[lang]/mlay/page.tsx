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
import { CollectionCard } from "@/components/brand/collection-card";
import { DistributorSeal } from "@/components/mlay/distributor-seal";
import { ChannelCard } from "@/components/distribution/channel-card";
import { BrandPlate } from "@/components/brand/brand-plate";
import { content, currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content();
  const locale = await currentLocale();
  const m = ui.pageMeta.mlay;
  return pageMetadata({
    locale,
    path: "/mlay",
    title: m.title,
    description: m.description,
    ogTitle: m.ogTitle,
    ogDescription: m.ogDescription,
  });
}

const HERO_IMAGE_SIZES = "(max-width: 1024px) 88vw, 54vw";

export default async function MlayPage() {
  const { mlay, mlayCollections, mlayChannels, ui } =
    await content();
  const locale = await currentLocale();

  return (
    <>
      {/* ---- Hero ------------------------------------------------------- */}
      <section id="top" className="ground-deep relative isolate overflow-hidden">
        <WaveField
          tone="dark"
          lines={26}
          className="absolute left-0 -bottom-16 h-[58%] w-[200%] opacity-45"
        />

        <div
          className="pointer-events-none absolute end-0 bottom-0 z-0 hidden aspect-[1006/1467] h-[86%] lg:block"
          aria-hidden="true"
        >
          <Image
            src={mlay.image.src}
            alt={mlay.image.alt}
            fill
            priority
            sizes={HERO_IMAGE_SIZES}
            className="object-contain object-right-bottom rtl:-scale-x-100"
          />
        </div>

        {/* The seal sits in the clear white wedge of the photo — left of the
            device's shaft, under the head, above the lower hand. That spot is a
            fixed point ON THE PHOTO, so it is addressed as a fraction of the
            photo (33% across, 65% down, centred on itself) rather than as
            an offset from the section. The mobile copy below uses the same two
            numbers against its own shot, which is what keeps the seal in the
            same place next to the device at every width. Under RTL the shot is
            mirrored, so that wedge moves to the far side of the photo and
            `start-[33%]` follows it there — but the -50% that centres the seal
            on the point is physical and does not mirror, hence the `rtl:`
            counterpart.

            Its box mirrors the shot's exactly; kept a sibling rather than a
            child because that one is `aria-hidden`, and the seal has to stay
            readable to assistive tech. Rendered twice rather than repositioned
            — the same split the hero image itself already uses, and only one is
            ever displayed. */}
        <div className="pointer-events-none absolute end-0 bottom-0 z-10 hidden aspect-[1006/1467] h-[86%] lg:block">
          <Reveal
            delay={340}
            from="scale"
            className="absolute top-[65%] start-[33%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
          >
            <DistributorSeal />
          </Reveal>
        </div>

        <Shell className="relative z-10 pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-36">
          <div className="lg:w-[52%]">
            <div>
              <Reveal>
                <div className="flex items-center gap-3">
                  <Eyebrow tone="light">{mlay.eyebrow}</Eyebrow>
                  <span className="rounded-full bg-white/10 px-3 py-0.5 text-[0.7rem] font-semibold tracking-wider text-brand-200 uppercase backdrop-blur-sm">
                    {ui.pages.exclusiveAgent}
                  </span>
                </div>
              </Reveal>

              <LineReveal
                as="h1"
                delay={80}
                stagger={110}
                className="mt-7 font-display text-[clamp(2.5rem,5.3vw,4.25rem)] leading-[1] font-semibold tracking-[-0.03em] text-white"
                lines={[
                  mlay.headlineLead,
                  <span
                    key="accent"
                    className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-200 via-circuit-300 to-brand-300 bg-clip-text text-transparent"
                  >
                    {mlay.headlineAccent}
                  </span>,
                ]}
              />

              <Reveal delay={160}>
                <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-brand-100/85 md:text-lg">
                  {mlay.intro}
                </p>
              </Reveal>

              <Reveal delay={220}>
                <p className="mt-4 eyebrow text-brand-300">
                  {mlay.audience}
                </p>
              </Reveal>

              <Reveal delay={280}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#catalogue"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-[0.95rem] font-semibold text-brand-800 transition-[background-color,box-shadow] duration-300 hover:bg-brand-50 hover:shadow-[0_18px_40px_-18px_rgb(76_201_222/0.7)]"
                  >
                    {ui.pages.exploreCatalogue}
                    <ArrowRight
                      className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      aria-hidden="true"
                    />
                  </a>
                  <a
                    href="https://www.tribucare.com/collections/mlay-all-products"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-7 py-4 text-[0.95rem] font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors duration-300 hover:bg-white/10 hover:ring-white/40"
                  >
                    {ui.pages.shopStore}
                  </a>
                </div>
              </Reveal>

            </div>
          </div>

          <div className="relative mt-8 -me-5 sm:-me-8 lg:hidden">
            {/* The shot is `ms-auto w-[82%]`, so this box is the shot; the
                fractions are the desktop copy's, landing the seal on the same
                point of the photo. */}
            <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-[82%]">
              <Reveal
                delay={340}
                from="scale"
                className="absolute top-[65%] start-[33%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
              >
                <DistributorSeal />
              </Reveal>
            </div>
            <Image
              src={mlay.image.src}
              alt={mlay.image.alt}
              width={mlay.image.width}
              height={mlay.image.height}
              priority
              sizes={HERO_IMAGE_SIZES}
              className="ms-auto h-auto w-[82%] max-w-none rtl:-scale-x-100 [-webkit-mask-image:linear-gradient(to_top,transparent_0,#000_24%)] [mask-image:linear-gradient(to_top,transparent_0,#000_24%)]"
            />
          </div>

          {/* Brand marks */}
          <Reveal delay={340}>
            <div className="mt-10 border-t border-white/10 pt-8 md:mt-12">
              <p className="eyebrow text-brand-300">{ui.sections.officialBrandPartner}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {mlay.brands.map((brand) => (
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
                <Eyebrow>{mlay.catalogue.eyebrow}</Eyebrow>
              </Reveal>
              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
                lines={[
                  mlay.catalogue.headlineLead,
                  <span key="accent" className="text-brand-600">
                    {mlay.catalogue.headlineAccent}
                  </span>,
                ]}
              />
            </div>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {mlay.catalogue.intro}
              </p>
            </Reveal>
          </div>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2 md:mt-24 lg:grid-cols-3">
            {mlayCollections.map((collection, i) => (
              <Reveal
                as="li"
                key={collection.slug}
                delay={Math.min(i, 6) * 70}
                from="scale"
                className="h-full"
              >
                <CollectionCard collection={collection} />
              </Reveal>
            ))}
          </ul>
        </Shell>
      </section>

      {/* ---- Where we show up / Retail ----------------------------------- */}
      <section className="ground-deep relative isolate overflow-hidden py-24 md:py-32">
        <WaveField
          tone="dark"
          lines={22}
          className="absolute left-0 top-1/4 h-[70%] w-[200%] opacity-25"
        />

        <Shell className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <Eyebrow tone="light">{mlay.retail.eyebrow}</Eyebrow>
              <h2 className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-balance text-white">
                {mlay.retail.headlineLead}{" "}
                <span className="text-brand-300">{mlay.retail.headlineAccent}</span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-brand-100/80">
                {mlay.retail.intro}
              </p>
            </Reveal>
          </div>

          <div className="mt-16">
            <Reveal className="max-lg:hidden">
              <div className="flex justify-end border-t border-white/10 pt-8">
                <p className="text-[0.8125rem] text-brand-100/50">
                  {ui.sections.railHint}
                </p>
              </div>
            </Reveal>

            {/* Below lg the rail becomes a stepped carousel — a vertical swipe
                on a phone never drags the row sideways. */}
            <CardStepper
              aria-label={mlay.retail.eyebrow}
              tone="dark"
              className="lg:hidden"
            >
              {mlay.retail.items.map((item) => (
                <EventCard
                  key={item.title}
                  event={item}
                  labels={ui.events}
                  sizes="100vw"
                />
              ))}
            </CardStepper>

            <Rail
              aria-label={mlay.retail.eyebrow}
              className="mt-8 gap-5 pb-4 max-lg:hidden"
            >
              {mlay.retail.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={Math.min(i, 4) * 70}
                  from="scale"
                  className="rail-item w-[19rem] sm:w-[21rem]"
                >
                  <EventCard
                    event={item}
                    labels={ui.events}
                    sizes="(max-width: 640px) 80vw, 21rem"
                  />
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
                <Eyebrow>{mlay.support.eyebrow}</Eyebrow>
              </Reveal>
              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
                lines={[
                  mlay.support.headline,
                  <span key="accent" className="text-brand-600">
                    {mlay.support.headlineAccent}
                  </span>,
                ]}
              />
            </div>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {mlay.support.body}
              </p>
            </Reveal>
          </div>

          <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {mlay.support.capabilities.map((capability, i) => (
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

      {/* ---- Distribution partners --------------------------------------- */}
      {/* Closes the page on the deep ground, so the run reads
          deep / light / deep / light / deep the whole way down. Channel cards
          are Core Values' dark rail card, verbatim; the chip row and the CTA
          are the Partner section's, verbatim. */}
      <section
        id="distribution"
        className="ground-deep relative isolate overflow-hidden py-24 md:py-32"
      >
        <WaveField
          tone="dark"
          lines={22}
          className="absolute left-0 top-1/4 h-[70%] w-[200%] opacity-25"
        />

        <Shell className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <Eyebrow tone="light">{mlay.distribution.eyebrow}</Eyebrow>
              <h2 className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-balance text-white">
                {mlay.distribution.headlineLead}{" "}
                <span className="text-brand-300">
                  {mlay.distribution.headlineAccent}
                </span>
              </h2>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-brand-100/80">
                {mlay.distribution.intro}
              </p>
            </Reveal>
          </div>

          <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {mlay.distribution.channels.map((channel, i) => (
              <Reveal
                as="li"
                key={channel.title}
                delay={i * 80}
                from="scale"
                className="h-full"
              >
                <ChannelCard channel={channel} tone="dark" />
              </Reveal>
            ))}
          </ul>

          {/* The places themselves, read straight off `mlayChannels` so the
              malls and platforms are stated in one place site-wide. */}
          <Reveal delay={120}>
            <div className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 pt-8">
              <span className="eyebrow text-brand-300">
                {mlay.distribution.channelsLabel}
              </span>
              {[...mlayChannels.flagship, ...mlayChannels.retail].map((place) => (
                <span
                  key={place}
                  className="rounded-xl border border-white/15 px-3.5 py-1.5 text-[0.8125rem] font-medium text-brand-100 transition-colors duration-300 hover:border-signal-500/60 hover:text-white"
                >
                  {place}
                </span>
              ))}
            </div>
          </Reveal>

          {/* The invitation. Same two-column header rhythm as the section top,
              so it reads as this section's closing move rather than a section
              of its own. */}
          <div className="mt-16 grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-12 lg:items-center">
            <Reveal className="lg:col-span-7">
              <p className="eyebrow text-brand-300">
                {mlay.distribution.partner.label}
              </p>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-brand-100/80">
                {mlay.distribution.partner.body}
              </p>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:justify-self-end" delay={100} from="right">
              <Link
                href={localePath(locale, mlay.distribution.partner.cta.href)}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-[0.95rem] font-semibold text-brand-800 transition-[background-color,box-shadow] duration-300 hover:bg-brand-50 hover:shadow-[0_18px_44px_-18px_rgb(76_201_222/0.75)]"
              >
                {mlay.distribution.partner.cta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Reveal>
          </div>
        </Shell>
      </section>
    </>
  );
}

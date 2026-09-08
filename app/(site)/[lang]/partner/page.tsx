import type { Metadata } from "next";
import Image from "next/image";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { Parallax } from "@/components/site/parallax";
import { Rise } from "@/components/site/rise";
import { PartnerPillars } from "./pillars";
import { PartnerFormPanel } from "./partner-form";
import { Brands } from "@/components/sections/brands";
import { content, currentLocale } from "@/content/server";
import { pageMetadata } from "@/lib/seo";

/** Matches the Mission & Vision composite, whose media column is the same
 *  proportion of the grid. */
const MEDIA_SIZES = "(max-width: 1024px) 100vw, 42vw";

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content();
  const locale = await currentLocale();
  const m = ui.pageMeta.partner;
  return pageMetadata({
    locale,
    path: "/partner",
    title: m.title,
    description: m.description,
    ogTitle: m.ogTitle,
    ogDescription: m.ogDescription,
  });
}


export default async function PartnerPage() {
  const { ui, partnerPillars, partnerStats, partner } = await content();
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-50/60 via-white to-brand-50/40 pt-28 pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 end-1/4 size-[650px] rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute top-96 start-0 size-[550px] rounded-full bg-signal-500/10 blur-3xl" />
      </div>

      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
          <Reveal>
            <Eyebrow>{ui.sections.partnerPage.eyebrow}</Eyebrow>
          </Reveal>

          <LineReveal
            as="h1"
            delay={90}
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
            lines={[
              ui.sections.partnerPage.headlineLead,
              <span
                key="accent"
                className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
              >
                {ui.sections.partnerPage.headlineAccent}
              </span>,
            ]}
          />

          <Reveal delay={280}>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
{partner.body}
            </p>
          </Reveal>
          </div>

          {/* The same two-layer composite the Mission & Vision section uses,
              with the same motion: an outer Parallax drifting the whole thing
              against the scroll, and the shield rising into place inside it so
              it reads as sitting behind the figure rather than pasted flat
              against it. The figure stays out of the Rise — it is the anchor
              the shield settles against.

              Both images share one 1036×1197 crop box, so `object-contain`
              resolves them to the same size and origin. That is the whole
              reason they line up; it is not a coincidence of aspect ratios. */}
          <div className="relative min-h-[22rem] sm:min-h-[28rem] lg:col-span-5 lg:min-h-[34rem]">
            <Parallax speed={0.06} className="absolute inset-y-0 -inset-x-[8%]">
              <Rise distance={80} className="absolute inset-0">
                <Image
                  src={partner.media.backdrop.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={MEDIA_SIZES}
                  className="object-contain"
                />
              </Rise>
              <Image
                src={partner.media.figure.src}
                alt={partner.media.figure.alt}
                fill
                sizes={MEDIA_SIZES}
                className="object-contain"
                priority
              />
            </Parallax>
          </div>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partnerStats.map((stat, i) => (
            <Reveal
              as="li"
              key={stat.kicker}
              delay={i * 80}
              from="scale"
              className="h-full"
            >
              <div className="card-surface card-interactive h-full p-6">
                <p className={`eyebrow ${stat.kickerTone}`}>{stat.kicker}</p>
                <p className="mt-2 font-display text-3xl font-semibold text-ink">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-ink-soft">{stat.detail}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <Eyebrow className="justify-center">
                {ui.pages.partnershipModels}
              </Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
                {ui.pages.tailoredCollaboration}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-2 text-base text-ink-soft">
{ui.sections.partnerPage.selectCategory}
              </p>
            </Reveal>
          </div>

          <PartnerPillars pillars={partnerPillars} />
        </div>
      </Shell>

      <div className="mt-16 md:mt-24">
        <Brands />
      </div>

      <Shell>
        <PartnerFormPanel ui={ui.partnerForm} />
      </Shell>
    </div>
  );
}

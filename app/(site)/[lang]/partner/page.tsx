import type { Metadata } from "next";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { PartnerPillars } from "./pillars";
import { PartnerFormPanel } from "./partner-form";
import { Brands } from "@/components/sections/brands";
import { content, currentLocale } from "@/content/server";
import { pageMetadata } from "@/lib/seo";

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
        <div className="max-w-4xl">
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

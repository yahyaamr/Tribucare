import type { Metadata } from "next";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { PartnerPillars } from "./pillars";
import { PartnerFormPanel } from "./partner-form";
import { Brands } from "@/components/sections/brands";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Exclusive regional distribution, clinical device partnerships, physician training and MENA distribution — partner with TribuCare across Egypt and the MENA region.",
  openGraph: {
    type: "website",
    title: "Partner With TribuCare — Beauty & Healthcare in Egypt & MENA",
    description:
      "Exclusive regional distribution, clinical device partnerships, physician training and MENA distribution.",
  },
  alternates: { canonical: "/partner" },
};

const STATS = [
  {
    kicker: "MIC Heritage",
    kickerTone: "text-signal-600",
    value: "40+ Years",
    detail: "Group legacy in healthcare & industrial investments.",
  },
  {
    kicker: "Workforce",
    kickerTone: "text-brand-600",
    value: "100+ Pros",
    detail: "Across 6 specialised divisions nationwide.",
  },
  {
    kicker: "Field Presence",
    kickerTone: "text-signal-600",
    value: "35+ Sales Reps",
    detail: "Full coverage across all governorates of Egypt.",
  },
  {
    kicker: "Exclusive Agency",
    kickerTone: "text-brand-600",
    value: "8 Global Brands",
    detail: "German, Italian, Korean & Chinese leaders.",
  },
] as const;

export default function PartnerPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-50/60 via-white to-brand-50/40 pt-28 pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 size-[650px] rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute top-96 left-0 size-[550px] rounded-full bg-signal-500/10 blur-3xl" />
      </div>

      <Shell>
        <div className="max-w-4xl">
          <Reveal>
            <Eyebrow>Strategic Partnerships</Eyebrow>
          </Reveal>

          <LineReveal
            as="h1"
            delay={90}
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
            lines={[
              "Let's build what's next in",
              <span
                key="accent"
                className="bg-gradient-to-r from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
              >
                beauty &amp; healthcare.
              </span>,
            ]}
          />

          <Reveal delay={280}>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
              Whether you are a global brand seeking exclusive regional
              distribution, a medical clinic expanding energy-based
              technologies, or a distributor building a portfolio — TribuCare is
              your trusted growth partner in Egypt &amp; MENA.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
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
              <Eyebrow className="justify-center">Partnership Models</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
                Tailored collaboration for every partner
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-2 text-base text-ink-soft">
                Select a category to see how we collaborate with your
                organisation.
              </p>
            </Reveal>
          </div>

          <PartnerPillars />
        </div>
      </Shell>

      <div className="mt-16 md:mt-24">
        <Brands />
      </div>

      <Shell>
        <PartnerFormPanel />
      </Shell>
    </div>
  );
}

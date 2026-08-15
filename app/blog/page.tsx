import type { Metadata } from "next";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { Newsletter } from "@/components/blog/newsletter";
import { BlogIndex } from "./blog-index";

export const metadata: Metadata = {
  title: "Insights & News",
  description:
    "Clinical insights, formulation breakthroughs, device innovations and market intelligence from TribuCare's medical advisory team.",
  openGraph: {
    type: "website",
    title: "TribuCare Insights — Dermatology, Skincare & Beauty Tech",
    description:
      "Clinical insights, formulation breakthroughs, device innovations and market intelligence from TribuCare's medical advisory team.",
  },
  alternates: { canonical: "/blog" },
};

export default function BlogListingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-50/60 via-white to-brand-50/40 pt-28 pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 size-[600px] rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute top-96 left-0 size-[500px] rounded-full bg-signal-500/10 blur-3xl" />
      </div>

      <Shell>
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>TribuCare Insights</Eyebrow>
          </Reveal>

          <LineReveal
            as="h1"
            delay={90}
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
            lines={[
              "Advancing Dermatology,",
              <span
                key="accent"
                className="bg-gradient-to-r from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
              >
                Skincare &amp; Beauty Tech
              </span>,
            ]}
          />

          <Reveal delay={280}>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Explore clinical insights, formulation breakthroughs, device
              innovations, and market intelligence from TribuCare&apos;s medical
              advisory team.
            </p>
          </Reveal>
        </div>

        <BlogIndex />
        <Newsletter />
      </Shell>
    </div>
  );
}

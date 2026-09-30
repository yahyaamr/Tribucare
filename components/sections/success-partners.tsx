import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { LogoMarquee } from "@/components/site/logo-marquee";
import { content } from "@/content/server";
import type { ContentData } from "@/content/en";

/**
 * Success partners — the standard section header over a <LogoMarquee>.
 *
 * Rendered by four pages, each with its own list (`successPartners.lists` in
 * content/site.ts), so it takes the one prop that says which. The header copy
 * is shared. An empty list renders nothing, per the sourcing rule: no page
 * shows a partners strip until real partners are on it.
 *
 * On the `bg-brand-50/60` tint the Brands and FAQ sections use, so it reads
 * apart from the `ground-light` sections it sits between on the brand pages.
 */
export async function SuccessPartners({
  page,
}: {
  page: keyof ContentData["successPartners"]["lists"];
}) {
  const { successPartners, partnerLogos } = await content();
  const names = successPartners.lists[page];
  if (names.length === 0) return null;

  return (
    <section
      id="success-partners"
      className="relative bg-brand-50/60 py-24 md:py-32"
    >
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>{successPartners.eyebrow}</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
              lines={[
                successPartners.headlineLead,
                <span key="accent" className="text-brand-600">
                  {successPartners.headlineAccent}
                </span>,
              ]}
            />
          </div>
          {successPartners.intro && (
            <Reveal className="lg:col-span-5" delay={100} from="right">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {successPartners.intro}
              </p>
            </Reveal>
          )}
        </div>

        <Reveal className="mt-16" delay={160}>
          <LogoMarquee
            names={names}
            brandLogos={partnerLogos}
            label={successPartners.eyebrow}
          />
        </Reveal>
      </Shell>
    </section>
  );
}

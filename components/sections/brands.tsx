import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { VerticalCard } from "@/components/sections/vertical-card";
import { content, currentLocale } from "@/content/server";

/**
 * Brand ecosystem, on the Partnerships page.
 *
 * The section's own header stays — it is the line that says TribuCare is a
 * platform rather than a single brand, which is the point a partner is being
 * asked to take. What follows it is now the same three vertical cards the
 * homepage's Expertise section shows, rendered from one component and one
 * content array (`verticals` in content/site.ts), so the two pages can never
 * describe the three lines differently.
 *
 * They are a plain column here, not a stack: <CardStack> and the `stack-card`
 * class are what pin one card over the next, and neither is used on this page.
 * The card itself needs no variant for that — see `vertical-card.tsx`.
 *
 * This replaced three brand-group blocks that listed each represented brand
 * with its country and a line of role copy. The marks themselves survive: every
 * card carries its vertical's brand row. `brandGroups` in content/site.ts is
 * what those blocks read, and is no longer rendered anywhere.
 */
export async function Brands() {
  const { verticals, brandLogos, ui } = await content();
  const locale = await currentLocale();

  return (
    <section id="brands" className="relative bg-brand-50/60 py-24 md:py-32">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>{ui.sections.brands.eyebrow}</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
              lines={[
                ui.sections.brands.headlineLead,
                <span key="accent" className="text-brand-600">
                  {ui.sections.brands.headlineAccent}
                </span>,
              ]}
            />
          </div>
          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
              {ui.sections.brands.intro}
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 flex flex-col gap-8 md:mt-24">
          {verticals.map((vertical) => (
            <li key={vertical.id}>
              <Reveal from="scale" travel="34px">
                <VerticalCard
                  vertical={vertical}
                  brandLogos={brandLogos}
                  locale={locale}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}

import { Plus } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { faq } from "@/content/site";

/** Native <details> rather than state: the accordion works before hydration and
 *  without JavaScript, which the rest of the page's progressive-enhancement
 *  approach also assumes. */
export function Faq() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      id="faq"
      className="relative isolate overflow-hidden bg-brand-50/60 py-24 md:py-32"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <Eyebrow>{faq.eyebrow}</Eyebrow>
              </Reveal>

              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.025em] text-ink"
                lines={[
                  faq.headlineLead,
                  <span
                    key="accent"
                    className="bg-gradient-to-r from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
                  >
                    {faq.headlineAccent}
                  </span>,
                ]}
              />

              <Reveal delay={150}>
                <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-ink-soft">
                  {faq.intro}
                </p>
              </Reveal>
            </div>
          </div>

          <ul className="lg:col-span-7">
            {faq.items.map((item, i) => (
              <Reveal as="li" key={item.q} delay={(i % 4) * 70}>
                <details className="disclosure group border-b border-brand-200/80">
                  <summary className="flex cursor-pointer list-none items-start gap-5 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="flex-1 font-display text-[1.0625rem] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand-700 md:text-lg">
                      {item.q}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-brand-200 bg-white text-brand-700 transition-all duration-300 group-hover:border-brand-600 group-open:rotate-45 group-open:border-brand-600 group-open:bg-brand-700 group-open:text-white"
                    >
                      <Plus className="size-4" strokeWidth={2} />
                    </span>
                  </summary>
                  <p className="max-w-xl pr-13 pb-7 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </ul>
        </div>
      </Shell>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { MissionVision } from "@/components/sections/mission-vision";
import { Counter } from "@/components/site/counter";
import { content, currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

/**
 * The About page.
 *
 * Composed rather than written: the mission, the vision and the reach figures
 * are the same section components the homepage renders, reading the same
 * exports, so the company's own account of itself cannot say one thing here and
 * another there. Only the page's own framing — the hero, the story and the
 * leadership note — is new.
 *
 * Two of those three are not yet written. They are marked as drafts on the page
 * instead of being filled with a plausible founding narrative: `content/site.ts`
 * opens with a sourcing rule, and an invented company history is exactly what it
 * exists to prevent. The notice disappears when `placeholder` is removed.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content();
  const locale = await currentLocale();
  const m = ui.pageMeta.about;
  return pageMetadata({
    locale,
    path: "/about",
    title: m.title,
    description: m.description,
    ogTitle: m.ogTitle,
    ogDescription: m.ogDescription,
  });
}

/** Marks copy that is a stand-in, so an unfinished section can never be
 *  mistaken for a finished one — least of all after it ships. */
function DraftNotice() {
  return (
    <span className="ms-3 inline-flex items-center rounded-lg bg-signal-500/15 px-2 py-0.5 align-middle text-[0.625rem] font-semibold tracking-wide text-signal-600 uppercase">
      Draft copy
    </span>
  );
}

export default async function AboutPage() {
  const { about } = await content();
  const locale = await currentLocale();

  return (
    <>
      <div className="relative bg-gradient-to-b from-brand-50/60 via-white to-brand-50/40 pt-28 pb-20">
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
              <Eyebrow>{about.eyebrow}</Eyebrow>
            </Reveal>

            <LineReveal
              as="h1"
              delay={90}
              className="mt-6 font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
              lines={[
                about.headlineLead,
                <span
                  key="accent"
                  className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
                >
                  {about.headlineAccent}
                </span>,
              ]}
            />

            <Reveal delay={280}>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-soft">
                {about.intro}
              </p>
            </Reveal>

            <Reveal delay={340}>
              <p className="mt-4 text-sm font-medium text-ink-faint">
                {about.parentNote}
              </p>
            </Reveal>
          </div>
        </Shell>
      </div>

      {/* The same `reach` figures the homepage shows, rendered here rather than
          by reusing <Reach />. That section carries id="core-values" and the
          whole values rail with it, so dropping it in put a second
          "core-values" anchor on this page — and the header marks section links
          active by whichever observed id is on screen, so scrolling About lit
          the Core Values pill alongside About. Same numbers, same export, no
          second anchor. */}
      <section className="ground-light relative py-20 md:py-24">
        <Shell>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {about.stats.map((stat, i) => (
              <Reveal as="li" key={stat.label} delay={i * 100} from="scale">
                <div className="border-t border-brand-200 pt-6">
                  <p className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-none font-semibold tracking-[-0.035em] text-ink">
                    <Counter
                      value={stat.value}
                      prefix={"prefix" in stat ? stat.prefix : ""}
                      suffix={stat.suffix}
                    />
                  </p>
                  <h2 className="mt-4 font-display text-base font-semibold text-ink">
                    {stat.label}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {stat.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Shell>
      </section>

      {/* ---- Our story --------------------------------------------------- */}
      <section className="ground-light relative py-24 md:py-32">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow>{about.story.eyebrow}</Eyebrow>
              </Reveal>
              <LineReveal
                as="h2"
                delay={90}
                className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.025em] text-ink"
                lines={[about.story.headline]}
              />
              {about.story.placeholder && (
                <Reveal delay={120}>
                  <p className="mt-4">
                    <DraftNotice />
                  </p>
                </Reveal>
              )}
            </div>

            <div className="space-y-5 lg:col-span-7">
              {about.story.paragraphs.map((paragraph, i) => (
                <Reveal key={i} delay={100 + i * 80} from="right">
                  <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </Shell>
      </section>

      {/* Mission and vision, rendered by the homepage's own section. */}
      <MissionVision />

      {/* ---- Leadership -------------------------------------------------- */}
      <section className="ground-light relative py-24 md:py-32">
        <Shell>
          <div className="max-w-3xl">
            <Reveal>
              <Eyebrow>{about.leadership.eyebrow}</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.025em] text-ink"
              lines={[about.leadership.headline]}
            />
            {about.leadership.placeholder && (
              <Reveal delay={120}>
                <p className="mt-4">
                  <DraftNotice />
                </p>
              </Reveal>
            )}
            <Reveal delay={140}>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-ink-soft">
                {about.leadership.body}
              </p>
            </Reveal>
          </div>

          {/* Empty until real people are supplied, so the section renders as a
              statement rather than as a grid with nothing in it. */}
          {about.leadership.people.length > 0 && (
            <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {about.leadership.people.map((person) => (
                <li key={person.name} className="card-surface p-6">
                  <p className="font-display text-lg font-semibold text-ink">
                    {person.name}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{person.role}</p>
                </li>
              ))}
            </ul>
          )}
        </Shell>
      </section>

      {/* ---- Closing CTA ------------------------------------------------- */}
      <section className="ground-deep relative py-24 md:py-32">
        <Shell>
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow tone="light">{about.cta.headline}</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <p className="mt-6 text-[1.0625rem] leading-relaxed text-brand-200">
                {about.cta.body}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <Link
                href={localePath(locale, about.cta.href)}
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-900 shadow-md transition-colors duration-300 hover:bg-brand-50"
              >
                {about.cta.label}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </Shell>
      </section>
    </>
  );
}

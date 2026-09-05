import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { getContent } from "@/content";
import { localePath, type Locale } from "@/lib/i18n/config";

/**
 * The 404 page's content, in either language.
 *
 * Built from the index pages' header block and the article pages' back link,
 * so it is the same page as the rest of the site rather than a new design.
 * Rendered by `app/(site)/[lang]/not-found.tsx` for anything under a locale and
 * by `app/not-found.tsx` for the few paths that never reach one.
 */
export function NotFoundView({ locale }: { locale: Locale }) {
  const t = getContent(locale).ui.notFound;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-50/60 via-white to-brand-50/40 pt-28 pb-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 end-1/4 size-[600px] rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute top-96 start-0 size-[500px] rounded-full bg-signal-500/10 blur-3xl" />
      </div>

      <Shell>
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </Reveal>

          <LineReveal
            as="h1"
            delay={90}
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
            lines={[
              t.headlineLead,
              <span
                key="accent"
                className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
              >
                {t.headlineAccent}
              </span>,
            ]}
          />

          <Reveal delay={150}>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft">
              {t.body}
            </p>
          </Reveal>

          <Reveal delay={220}>
            <Link
              href={localePath(locale, "/")}
              className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-800"
            >
              <ArrowLeft
                className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              {t.cta}
            </Link>
          </Reveal>
        </div>
      </Shell>
    </div>
  );
}

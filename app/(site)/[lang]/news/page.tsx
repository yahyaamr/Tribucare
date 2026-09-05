import type { Metadata } from "next";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { NewsIndex } from "./news-index";
import { getPublishedNews, getPublicNewsTags } from "@/lib/cms/news";
import { content, currentLocale } from "@/content/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content();
  const locale = await currentLocale();
  return pageMetadata({
    locale,
    path: "/news",
    title: ui.news.metaTitle,
    description: ui.news.metaDescription,
    ogTitle: ui.news.ogTitle,
  });
}

/** Refreshed on publish through `revalidateNews`; the window is the backstop. */
export const revalidate = 3600;

/**
 * The news index.
 *
 * Built as the blog index's twin — same ground and blooms, same header block,
 * same filter-and-search bar, same featured panel over a three-up grid. It
 * reads from the news store and the news vocabulary, and from nothing the blog
 * owns.
 */
export default async function NewsListingPage() {
  const { ui } = await content();
  const locale = await currentLocale();
  const [items, tags] = await Promise.all([
    getPublishedNews(),
    // Only tags with a published item behind them, so a filter tab can never
    // lead to an empty list.
    getPublicNewsTags(),
  ]);

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
            <Eyebrow>{ui.news.eyebrow}</Eyebrow>
          </Reveal>

          <LineReveal
            as="h1"
            delay={90}
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
            lines={[
              ui.news.headlineLead,
              <span
                key="accent"
                className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
              >
                {ui.news.headlineAccent}
              </span>,
            ]}
          />

          <Reveal delay={280}>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              {ui.news.intro}
            </p>
          </Reveal>
        </div>

        <NewsIndex items={items} tags={tags} ui={ui.news} locale={locale} />
      </Shell>
    </div>
  );
}

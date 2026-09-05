import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal } from "@/components/site/reveal";
import { NewsView } from "@/components/news/news-view";
import { formatPostDate } from "@/lib/cms/format";
import { getNewsBySlug, getPublishedNews } from "@/lib/cms/news";
import { content, currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbSchema, newsArticleSchema, pageMetadata } from "@/lib/seo";

/**
 * A single news item.
 *
 * The article route's twin — same shell, same back links, same related grid.
 * ISR-cached rather than fully static because items are authored in the panel,
 * so the build does not know the full set; publishing calls `revalidateNews`,
 * and the hourly window below is the backstop for anything that misses.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getPublishedNews();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item || item.status !== "published") return {};
  const locale = await currentLocale();

  const title = item.seo.metaTitle.trim() || item.title;
  const description = item.seo.metaDescription.trim() || item.excerpt;

  return pageMetadata({
    locale,
    path: `/news/${item.slug}`,
    title,
    description,
    type: "article",
    ...(item.image ? { image: item.image, imageAlt: item.title } : {}),
    publishedTime: item.date,
    modifiedTime: item.updatedAt || undefined,
    section: item.tags[0],
    tags: item.tags,
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);

  // A draft is a 404 to the public, exactly as an unpublished item should be.
  if (!item || item.status !== "published") notFound();

  const { ui, nav } = await content();
  const locale = await currentLocale();

  const related = (await getPublishedNews())
    .filter((n) => n.slug !== item.slug)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-gradient-to-b from-brand-50/50 via-white to-brand-50/30 pt-28 pb-24">
      <JsonLd data={newsArticleSchema(item, locale)} />
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: nav[0].label, path: "/" },
          { name: ui.news.metaTitle, path: "/news" },
          { name: item.title, path: `/news/${item.slug}` },
        ])}
      />

      <Shell>
        <Reveal>
          <Link
            href={localePath(locale, "/news")}
            className="group inline-flex items-center gap-2 rounded-xl border border-brand-200/80 bg-white px-4 py-2 text-xs font-semibold text-brand-800 shadow-sm transition-all hover:bg-brand-50 hover:shadow"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            {ui.news.backToNews}
          </Link>
        </Reveal>

        <div className="mt-8">
          {/* The header, hero and body are shared with the admin preview, so
              what an editor approves is literally what ships. */}
          <NewsView item={item} ui={ui.blog} />
        </div>

        <div className="max-w-3xl">
          <Reveal>
            <div className="mt-16 border-t border-brand-100 pt-8">
              <Link
                href={localePath(locale, "/news")}
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-800"
              >
                <ArrowLeft
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {ui.news.viewAll}
              </Link>
            </div>
          </Reveal>
        </div>

        {related.length > 0 && (
          <div className="mt-24 border-t border-brand-100 pt-16">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>{ui.news.relatedEyebrow}</Eyebrow>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                    {ui.news.relatedHeadline}
                  </h2>
                </div>
                <Link
                  href={localePath(locale, "/news")}
                  className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 sm:inline-flex"
                >
                  {ui.news.viewAll}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </Reveal>

            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other, i) => (
                <Reveal
                  as="li"
                  key={other.slug}
                  delay={i * 70}
                  from="scale"
                  className="h-full"
                >
                  <article className="card-surface card-interactive group relative flex h-full flex-col p-6">
                    <p className="text-xs font-semibold tracking-wider text-brand-700 uppercase">
                      {other.tags[0]}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
                      <Link href={localePath(locale, `/news/${other.slug}`)}>
                        <span
                          className="absolute inset-0 z-10"
                          aria-hidden="true"
                        />
                        {other.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                      {other.excerpt}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4 text-xs text-ink-faint">
                      <span>{formatPostDate(other.date)}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex items-center gap-1 font-medium text-brand-700 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      >
                        {ui.blog.read} <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </Shell>
    </article>
  );
}

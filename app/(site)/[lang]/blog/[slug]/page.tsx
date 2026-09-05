import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal } from "@/components/site/reveal";
import { ArticleView } from "@/components/blog/article-view";
import { formatPostDate } from "@/lib/cms/format";
import { getPostBySlug, getPublishedPosts } from "@/lib/cms/posts";
import { content, currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";
import { JsonLd } from "@/components/site/json-ld";
import { articleSchema, breadcrumbSchema, pageMetadata } from "@/lib/seo";

/**
 * Articles are ISR-cached rather than fully static: they are authored in the
 * admin panel now, so the build no longer knows the full set. Publishing calls
 * `revalidateBlog`, which refreshes this route immediately — the hourly window
 * below is only the backstop for anything that misses.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") return {};
  const locale = await currentLocale();

  const title = post.seo.metaTitle.trim() || post.title;
  const description = post.seo.metaDescription.trim() || post.excerpt;

  return {
    ...pageMetadata({
      locale,
      path: `/blog/${post.slug}`,
      title,
      description,
      type: "article",
      ...(post.image ? { image: post.image, imageAlt: post.title } : {}),
      publishedTime: post.date,
      modifiedTime: post.updatedAt || undefined,
      authors: post.author ? [post.author.name] : undefined,
      section: post.categories[0],
      tags: post.categories,
    }),
    authors: post.author ? [{ name: post.author.name }] : undefined,
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // A draft is a 404 to the public, exactly as an unpublished post should be.
  if (!post || post.status !== "published") notFound();

  const { ui, nav } = await content();
  const locale = await currentLocale();

  const relatedPosts = (await getPublishedPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-gradient-to-b from-brand-50/50 via-white to-brand-50/30 pt-28 pb-24">
      <JsonLd data={articleSchema(post, locale)} />
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: nav[0].label, path: "/" },
          { name: ui.blog.metaTitle, path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <Shell>
        <Reveal>
          <Link
            href={localePath(locale, "/blog")}
            className="group inline-flex items-center gap-2 rounded-xl border border-brand-200/80 bg-white px-4 py-2 text-xs font-semibold text-brand-800 shadow-sm transition-all hover:bg-brand-50 hover:shadow"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            {ui.blog.backToArticles}
          </Link>
        </Reveal>

        <div className="mt-8">
          {/* The header, hero and body are shared with the admin preview, so
              what an author approves is literally what ships. */}
          <ArticleView post={post} ui={ui.blog} />
        </div>

        <div className="max-w-3xl">
          <Reveal>
            <div className="mt-16 border-t border-brand-100 pt-8">
              <Link
                href={localePath(locale, "/blog")}
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-800"
              >
                <ArrowLeft
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {ui.blog.exploreAll}
              </Link>
            </div>
          </Reveal>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-24 border-t border-brand-100 pt-16">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>{ui.blog.relatedEyebrow}</Eyebrow>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                    {ui.blog.relatedHeadline}
                  </h2>
                </div>
                <Link
                  href={localePath(locale, "/blog")}
                  className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 sm:inline-flex"
                >
                  {ui.blog.viewAll}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </Reveal>

            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related, i) => (
                <Reveal
                  as="li"
                  key={related.slug}
                  delay={i * 70}
                  from="scale"
                  className="h-full"
                >
                  <article className="card-surface card-interactive group relative flex h-full flex-col p-6">
                    <p className="text-xs font-semibold tracking-wider text-brand-700 uppercase">
                      {related.categories[0]}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
                      <Link href={localePath(locale, `/blog/${related.slug}`)}>
                        <span
                          className="absolute inset-0 z-10"
                          aria-hidden="true"
                        />
                        {related.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                      {related.excerpt}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4 text-xs text-ink-faint">
                      <span>{formatPostDate(related.date)}</span>
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { blogPosts } from "@/content/blogs";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author.name }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author.name],
      images: [{ url: post.image }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) notFound();

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: { "@type": "Organization", name: "TribuCare" },
    articleSection: post.category,
  };

  return (
    <article className="min-h-screen bg-gradient-to-b from-brand-50/50 via-white to-brand-50/30 pt-28 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Shell>
        <Reveal>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-xl border border-brand-200/80 bg-white px-4 py-2 text-xs font-semibold text-brand-800 shadow-sm transition-all hover:bg-brand-50 hover:shadow"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Back to Articles
          </Link>
        </Reveal>

        <header className="mt-8 max-w-4xl">
          <Reveal delay={60}>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-800">
              <span className="rounded-xl border border-brand-200 bg-brand-100/80 px-3.5 py-1 tracking-wider text-brand-900 uppercase">
                {post.category}
              </span>
              <span className="flex items-center gap-1 font-normal text-ink-faint">
                <Calendar className="size-3.5" aria-hidden="true" />
                {post.date}
              </span>
              <span className="text-ink-faint" aria-hidden="true">
                •
              </span>
              <span className="flex items-center gap-1 font-normal text-ink-faint">
                <Clock className="size-3.5" aria-hidden="true" />
                {post.readTime}
              </span>
            </div>
          </Reveal>

          <LineReveal
            as="h1"
            delay={120}
            className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink"
            lines={[post.title]}
          />

          <Reveal delay={220}>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              {post.excerpt}
            </p>
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-8 flex items-center gap-4 border-y border-brand-100 py-6">
              <Image
                src={post.author.avatar}
                alt=""
                width={48}
                height={48}
                className="size-12 rounded-full object-cover ring-2 ring-brand-200"
              />
              <div>
                <p className="text-base font-semibold text-ink">
                  {post.author.name}
                </p>
                <p className="text-xs text-ink-faint">{post.author.role}</p>
              </div>
            </div>
          </Reveal>
        </header>

        <Reveal delay={120} from="scale">
          <div className="relative mt-8 h-[320px] w-full overflow-hidden rounded-3xl border border-brand-100 shadow-xl sm:h-[460px]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1440px) 100vw, 1376px"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="mt-12 max-w-3xl">
          {post.content.keyTakeaways && (
            <Reveal>
              <div className="mb-10 rounded-3xl border border-brand-200/80 bg-brand-50/60 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-wider text-brand-900 uppercase">
                  <CheckCircle2
                    className="size-4 text-signal-500"
                    aria-hidden="true"
                  />
                  Key Takeaways
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {post.content.keyTakeaways.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed text-ink-soft"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-600"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal>
            <p className="text-lg leading-relaxed font-medium text-ink">
              {post.content.intro}
            </p>
          </Reveal>

          <div className="mt-8 space-y-8">
            {post.content.sections.map((section) => (
              <Reveal key={section.title} as="section">
                <h2 className="font-display text-2xl font-semibold text-ink">
                  {section.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ink-soft">
                  {section.body}
                </p>
              </Reveal>
            ))}
          </div>

          {post.content.quote && (
            <Reveal from="scale">
              <blockquote className="relative my-12 overflow-hidden rounded-3xl border-l-4 border-signal-500 bg-brand-900 p-8 text-white shadow-lg">
                <p className="font-display text-xl leading-relaxed text-brand-100 italic">
                  &ldquo;{post.content.quote}&rdquo;
                </p>
                <footer className="mt-4 text-xs font-semibold tracking-wider text-signal-400 uppercase">
                  — TribuCare Clinical Editorial
                </footer>
              </blockquote>
            </Reveal>
          )}

          <Reveal>
            <div className="mt-16 border-t border-brand-100 pt-8">
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-800"
              >
                <ArrowLeft
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                Explore All Articles
              </Link>
            </div>
          </Reveal>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-24 border-t border-brand-100 pt-16">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>Related Reading</Eyebrow>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                    More insights from TribuCare
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="group hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 sm:inline-flex"
                >
                  View all articles
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
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
                      {related.category}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
                      <Link href={`/blog/${related.slug}`}>
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
                      <span>{related.date}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex items-center gap-1 font-medium text-brand-700 transition-transform duration-300 group-hover:translate-x-1"
                      >
                        Read <ArrowRight className="size-3.5" />
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

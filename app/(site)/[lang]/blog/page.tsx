import type { Metadata } from "next";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { Newsletter } from "@/components/blog/newsletter";
import { BlogIndex } from "./blog-index";
import { getPublishedPosts } from "@/lib/cms/posts";
import { content, currentLocale } from "@/content/server";
import { pageMetadata } from "@/lib/seo";
import { getPublicCategories } from "@/lib/cms/categories";

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = await content();
  const locale = await currentLocale();
  return pageMetadata({
    locale,
    path: "/blog",
    title: ui.blog.metaTitle,
    description: ui.blog.metaDescription,
    ogTitle: ui.blog.ogTitle,
  });
}

/** Refreshed on publish through `revalidateBlog`; the window is the backstop. */
export const revalidate = 3600;

export default async function BlogListingPage() {
  const { ui } = await content();
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    // Only categories that actually have a published post behind them, so a
    // filter tab can never lead to an empty list.
    getPublicCategories(),
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
            <Eyebrow>{ui.blog.eyebrow}</Eyebrow>
          </Reveal>

          <LineReveal
            as="h1"
            delay={90}
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
            lines={[
              ui.blog.headlineLead,
              <span
                key="accent"
                className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
              >
                {ui.blog.headlineAccent}
              </span>,
            ]}
          />

          <Reveal delay={280}>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              {ui.blog.intro}
            </p>
          </Reveal>
        </div>

        <BlogIndex
          posts={posts}
          categories={categories}
          ui={ui.blog}
          locale={await currentLocale()}
        />
        <Newsletter ui={ui.sections.newsletter} />
      </Shell>
    </div>
  );
}

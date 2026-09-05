import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { PostCard } from "@/components/blog/post-card";
import { CardStepper } from "@/components/site/card-stepper";
import { getPublishedPosts } from "@/lib/cms/posts";
import { content, currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";

export async function BlogSection() {
  const posts = (await getPublishedPosts()).slice(0, 3);
  const { ui } = await content();
  const locale = await currentLocale();

  return (
    <section
      id="blog-section"
      className="relative isolate overflow-hidden bg-white py-24 md:py-32"
    >
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>{ui.sections.blog.eyebrow}</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.025em] text-ink"
              lines={[
                ui.sections.blog.headlineLead,
                <span
                  key="accent"
                  className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
                >
                  {ui.sections.blog.headlineAccent}
                </span>,
              ]}
            />
          </div>

          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
{ui.sections.blog.intro}
            </p>
          </Reveal>
        </div>

        {/* Below lg the three-up grid becomes a stepped carousel — one card at
            a time with an arrow row, the same shape as the events section. */}
        <Reveal className="mt-14 lg:hidden" from="scale">
          <CardStepper aria-label={ui.sections.blog.stepperLabel}>
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                locale={locale}
                minReadLabel={ui.blog.minRead}
                sizes="100vw"
              />
            ))}
          </CardStepper>
        </Reveal>

        <ul className="mt-14 hidden gap-8 lg:grid lg:grid-cols-3">
          {posts.map((post, idx) => (
            <Reveal
              as="li"
              key={post.slug}
              delay={idx * 80}
              from="scale"
              className="h-full"
            >
              <PostCard post={post} locale={locale} minReadLabel={ui.blog.minRead} />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={200} className="mt-14 text-center">
          <Link
            href={localePath(locale, "/blog")}
            className="group inline-flex items-center gap-2.5 rounded-xl bg-brand-800 px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-brand-900 hover:shadow-lg"
          >
            {ui.sections.blog.cta}
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </Shell>
    </section>
  );
}

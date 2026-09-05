import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { ArticleBody } from "@/components/blog/article-body";
import { formatPostDate, readTimeFor } from "@/lib/cms/format";
import type { ResolvedPost } from "@/lib/cms/types";
import type { ContentData } from "@/content/en";

/**
 * Reveal-on-scroll, or a plain wrapper.
 *
 * Declared here rather than chosen inside `ArticleView` because a component
 * created during render is a new type on every pass — React would unmount and
 * remount the whole subtree each time, throwing away the reveal state it is
 * supposed to be driving.
 */
function MaybeReveal({
  animate,
  className,
  children,
}: {
  animate: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!animate) return <div className={className}>{children}</div>;
  return <Reveal className={className}>{children}</Reveal>;
}

/**
 * A whole article, from the category badge down to the last block.
 *
 * Extracted out of `app/blog/[slug]/page.tsx` unchanged so the editor's
 * preview and the published page render through one component. That is the
 * point of it: a preview built from its own markup would drift from the real
 * article the first time either was touched, and the SEO team would stop
 * trusting it.
 *
 * The published route keeps everything that is genuinely page-level — the
 * back link, the JSON-LD, related posts — and wraps this.
 */
export function ArticleView({
  post,
  ui,
  animate = true,
  priority = true,
}: {
  post: ResolvedPost;
  ui: ContentData["ui"]["blog"];
  /** Off in the preview pane, where reveal-on-scroll would leave most of the
   *  article invisible inside a short scroll container. */
  animate?: boolean;
  priority?: boolean;
}) {
  return (
    <>
      <header className="max-w-4xl">
        <MaybeReveal animate={animate}>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-800">
            {/* The header row wraps, so every category the post carries is
                shown here rather than just the primary one. */}
            {post.categories.map((category) => (
              <span
                key={category}
                className="rounded-xl border border-brand-200 bg-brand-100/80 px-3.5 py-1 tracking-wider text-brand-900 uppercase"
              >
                {category}
              </span>
            ))}
            <span className="flex items-center gap-1 font-normal text-ink-faint">
              <Calendar className="size-3.5" aria-hidden="true" />
              {formatPostDate(post.date)}
            </span>
            <span className="text-ink-faint" aria-hidden="true">
              •
            </span>
            <span className="flex items-center gap-1 font-normal text-ink-faint">
              <Clock className="size-3.5" aria-hidden="true" />
              {readTimeFor(post, ui.minRead)}
            </span>
          </div>
        </MaybeReveal>

        {animate ? (
          <LineReveal
            as="h1"
            delay={120}
            className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink"
            lines={[post.title]}
          />
        ) : (
          <h1 className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink">
            {post.title || "Untitled post"}
          </h1>
        )}

        {post.excerpt && (
          <MaybeReveal animate={animate}>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              {post.excerpt}
            </p>
          </MaybeReveal>
        )}

        {/* The author row is dropped entirely when there is no name — a byline
            reading "by nothing" above an avatar placeholder is worse than no
            byline. */}
        {post.author && (
          <MaybeReveal animate={animate}>
            <div className="mt-8 flex items-center gap-4 border-y border-brand-100 py-6">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover ring-2 ring-brand-200"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-semibold text-brand-800 ring-2 ring-brand-200"
                >
                  {post.author.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-base font-semibold text-ink">
                  {post.author.name}
                </p>
                {post.author.role && (
                  <p className="text-xs text-ink-faint">{post.author.role}</p>
                )}
              </div>
            </div>
          </MaybeReveal>
        )}
      </header>

      {post.image && (
        <MaybeReveal animate={animate}>
          <div className="relative mt-8 h-[320px] w-full overflow-hidden rounded-3xl border border-brand-100 shadow-xl sm:h-[460px]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 1440px) 100vw, 1376px"
              className="object-cover"
            />
          </div>
        </MaybeReveal>
      )}

      <div className="mt-12 max-w-3xl">
        <ArticleBody blocks={post.blocks} ui={ui} animate={animate} />
      </div>
    </>
  );
}

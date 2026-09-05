import Image from "next/image";
import { Calendar } from "lucide-react";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { ArticleBody } from "@/components/blog/article-body";
import { formatPostDate } from "@/lib/cms/format";
import type { NewsItem } from "@/lib/cms/types";
import type { ContentData } from "@/content/en";

/**
 * Reveal-on-scroll, or a plain wrapper.
 *
 * Declared at module scope rather than inside the view for the same reason
 * `article-view.tsx` does it: a component created during render is a new type
 * on every pass, and React would remount the subtree it is meant to animate.
 */
function MaybeReveal({
  animate,
  children,
}: {
  animate: boolean;
  children: React.ReactNode;
}) {
  if (!animate) return <div>{children}</div>;
  return <Reveal>{children}</Reveal>;
}

/**
 * A whole news item, from the tag badges down to the last block.
 *
 * `components/blog/article-view.tsx` with news fields — the same header stack,
 * the same hero frame, the same body renderer. Three differences, all
 * deliberate: the badges are tags rather than categories, there is no reading
 * time ("2 min read" on a four-sentence notice reads as padding), and there is
 * no byline — an announcement is published by the company, not by a person.
 *
 * Shared with the editor's preview, so what an editor sees while writing is the
 * component the reader gets. If you change this, look at `article-view.tsx`.
 */
export function NewsView({
  item,
  ui,
  animate = true,
  priority = true,
}: {
  item: NewsItem;
  /** The blog string table — `ArticleBody` reads its block labels from it. */
  ui: ContentData["ui"]["blog"];
  /** Off in the preview pane, where reveal-on-scroll would leave most of the
   *  item invisible inside a short scroll container. */
  animate?: boolean;
  priority?: boolean;
}) {
  return (
    <>
      <header className="max-w-4xl">
        <MaybeReveal animate={animate}>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-800">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-xl border border-brand-200 bg-brand-100/80 px-3.5 py-1 tracking-wider text-brand-900 uppercase"
              >
                {tag}
              </span>
            ))}
            <span className="flex items-center gap-1 font-normal text-ink-faint">
              <Calendar className="size-3.5" aria-hidden="true" />
              {formatPostDate(item.date)}
            </span>
          </div>
        </MaybeReveal>

        {animate ? (
          <LineReveal
            as="h1"
            delay={120}
            className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink"
            lines={[item.title]}
          />
        ) : (
          <h1 className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-ink">
            {item.title || "Untitled news item"}
          </h1>
        )}

        {item.excerpt && (
          <MaybeReveal animate={animate}>
            <p className="mt-6 text-xl leading-relaxed text-ink-soft">
              {item.excerpt}
            </p>
          </MaybeReveal>
        )}

      </header>

      {item.image && (
        <MaybeReveal animate={animate}>
          <div className="relative mt-8 h-[320px] w-full overflow-hidden rounded-3xl border border-brand-100 shadow-xl sm:h-[460px]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={priority}
              sizes="(max-width: 1440px) 100vw, 1376px"
              className="object-cover"
            />
          </div>
        </MaybeReveal>
      )}

      <div className="mt-12 max-w-3xl">
        <ArticleBody blocks={item.blocks} ui={ui} animate={animate} />
      </div>
    </>
  );
}

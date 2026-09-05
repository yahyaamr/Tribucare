import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { Block } from "@/lib/cms/types";
import type { ContentData } from "@/content/en";

/**
 * The article body — the single renderer for a post's blocks.
 *
 * Both the published page and the editor's preview pane render through this,
 * which is the whole point: what the SEO team sees while writing is the same
 * component the reader gets, so a preview can never drift from the article.
 *
 * Every treatment below was lifted verbatim from the article template as it
 * stood before the CMS existed — the mint takeaways panel, the lead paragraph,
 * the `h2`, the dark pull-quote. The two additions, `list` and `image`, are
 * built from vocabulary already on the page: the list reuses the takeaways
 * bullet, and the figure reuses the article hero's frame.
 */

/**
 * Vertical rhythm, decided by a block and the one above it.
 *
 * The old template hard-coded this: `mt-8 space-y-8` between sections with the
 * body paragraph `mt-3` under its heading. A flat, reorderable list has to
 * derive the same spacing, so a heading opens a new section with a wide gap
 * while its first paragraph stays tucked underneath it.
 */
function spacingFor(block: Block, previous: Block | undefined) {
  if (!previous) return "";
  switch (block.type) {
    case "heading":
      return "mt-10";
    case "quote":
      return "mt-12";
    case "takeaways":
    case "image":
      return "mt-10";
    default:
      return previous.type === "heading" ? "mt-3" : "mt-6";
  }
}

type BlogUi = ContentData["ui"]["blog"];

function BlockView({ block, ui }: { block: Block; ui: BlogUi }) {
  switch (block.type) {
    case "takeaways":
      return (
        <div className="rounded-3xl border border-brand-200/80 bg-brand-50/60 p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-wider text-brand-900 uppercase">
            <CheckCircle2 className="size-4 text-signal-500" aria-hidden="true" />
            {ui.keyTakeaways}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {block.items
              .filter((item) => item.trim())
              .map((item, i) => (
                <li
                  key={`${i}-${item}`}
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
      );

    case "lead":
      return (
        <p className="text-lg leading-relaxed font-medium text-ink">
          {block.text}
        </p>
      );

    case "heading":
      return (
        <h2 className="font-display text-2xl font-semibold text-ink">
          {block.text}
        </h2>
      );

    case "paragraph":
      return (
        <p className="text-base leading-relaxed text-ink-soft">{block.text}</p>
      );

    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items
            .filter((item) => item.trim())
            .map((item, i) => (
              <li
                key={`${i}-${item}`}
                className="flex items-start gap-3 text-base leading-relaxed text-ink-soft"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-600"
                />
                <span>{item}</span>
              </li>
            ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="relative overflow-hidden rounded-3xl border-s-4 border-signal-500 bg-brand-900 p-8 text-white shadow-lg">
          <p className="font-display text-xl leading-relaxed text-brand-100 italic">
            &ldquo;{block.text}&rdquo;
          </p>
          <footer className="mt-4 text-xs font-semibold tracking-wider text-signal-400 uppercase">
            — {block.attribution?.trim() || ui.quoteAttribution}
          </footer>
        </blockquote>
      );

    case "image":
      return (
        <figure>
          <div className="relative h-[260px] w-full overflow-hidden rounded-3xl border border-brand-100 shadow-xl sm:h-[380px]">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
          {block.caption?.trim() && (
            <figcaption className="mt-3 text-xs text-ink-faint">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}

/** A block with nothing in it renders nothing — an author mid-draft should not
 *  see an empty heading rule or a bare quote frame in the preview. */
function isEmpty(block: Block) {
  switch (block.type) {
    case "list":
    case "takeaways":
      return block.items.every((item) => !item.trim());
    case "image":
      return !block.src.trim();
    default:
      return !block.text.trim();
  }
}

export function ArticleBody({
  blocks,
  ui,
  animate = true,
}: {
  blocks: Block[];
  ui: BlogUi;
  /** Off in the editor preview: the reveal primitives only un-hide on scroll,
   *  and inside a short preview pane most blocks would never enter the
   *  viewport and would simply stay invisible. */
  animate?: boolean;
}) {
  const visible = blocks.filter((block) => !isEmpty(block));

  return (
    <>
      {visible.map((block, i) => {
        const className = spacingFor(block, visible[i - 1]);
        const content = <BlockView block={block} ui={ui} />;

        if (!animate) {
          return (
            <div key={block.id} className={className}>
              {content}
            </div>
          );
        }

        return (
          <Reveal
            key={block.id}
            className={className}
            from={block.type === "quote" ? "scale" : "up"}
          >
            {content}
          </Reveal>
        );
      })}
    </>
  );
}

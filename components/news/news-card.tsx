import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";
import { formatPostDate } from "@/lib/cms/format";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { NewsItem } from "@/lib/cms/types";

/**
 * The news card.
 *
 * The canonical content card — `components/blog/post-card.tsx` — with news
 * fields. Same `card-surface card-interactive` shell, same `h-52` media band,
 * same floating badge, same meta / title / excerpt rhythm, same bordered footer
 * row. An article and an announcement are the same kind of object to a reader,
 * so they get the same object on screen. If you change one of these two files,
 * change the other.
 *
 * Two fields differ. The meta row shows date plus a secondary tag where a post
 * shows date plus reading time; and the footer carries the read affordance
 * where a post carries its byline, because news has no author.
 */
export function NewsCard({
  item,
  locale,
  readLabel,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  item: NewsItem;
  /** Required, not defaulted — a card that quietly falls back to English is
   *  how the Arabic site starts linking out of itself. */
  locale: Locale;
  /** Fills the footer slot the byline used to occupy. Passed in rather than
   *  read here so the card stays a server-agnostic presentational component. */
  readLabel: string;
  sizes?: string;
}) {
  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden bg-brand-50">
        {/* An item can be saved without a cover, so the media band falls back
            to the mint plate rather than rendering an <Image> with no src. */}
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center"
          >
            <Newspaper className="size-8 text-brand-300" />
          </span>
        )}
        {item.tags[0] && (
          <span className="absolute top-3.5 start-3.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-md backdrop-blur-md">
            {item.tags[0]}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden="true" />
              {formatPostDate(item.date)}
            </span>
            {item.tags[1] && (
              <>
                <span aria-hidden="true">•</span>
                <span className="line-clamp-1">{item.tags[1]}</span>
              </>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
            <Link href={localePath(locale, `/news/${item.slug}`)}>
              {/* Stretches the link across the whole card, so the title stays
                  the single accessible name rather than adding a second link
                  to the tab order for the same destination. */}
              <span className="absolute inset-0 z-10" aria-hidden="true" />
              {item.title}
            </Link>
          </h3>

          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">
            {item.excerpt}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4">
          {/* News carries no byline, so the slot the author occupies on a post
              card takes the read affordance instead. It is plain text, not a
              second link: the title's overlay already covers the whole card,
              and a second control here would put the same destination in the
              tab order twice. */}
          <span className="text-xs font-semibold text-brand-700">
            {readLabel}
          </span>

          <span
            aria-hidden="true"
            className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-700 group-hover:text-white"
          >
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </article>
  );
}

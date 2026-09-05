"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Newspaper, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { NewsCard } from "@/components/news/news-card";
import { formatPostDate } from "@/lib/cms/format";
import type { NewsItem } from "@/lib/cms/types";
import type { ContentData } from "@/content/en";
import { localePath, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/**
 * The filtering half of the news index.
 *
 * `app/(site)/[lang]/blog/blog-index.tsx` with news fields — same filter row,
 * same search box, same featured panel over a three-up grid. Split out of the
 * page for the same reason that one is: the route stays a server component and
 * keeps its `metadata`.
 *
 * Every label comes from `ui`, including the tab that means "everything". That
 * one is a label rather than an id, so comparing against a hardcoded English
 * string would leave the Arabic filter row unable to match its own default tab.
 */
export function NewsIndex({
  items,
  tags,
  ui,
  locale,
}: {
  items: NewsItem[];
  tags: string[];
  ui: ContentData["ui"]["news"];
  locale: Locale;
}) {
  const ALL = ui.allNews;
  const [tag, setTag] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  // Items arrive already filtered to published and sorted newest-first.
  const featured = items.find((item) => item.featured) ?? items[0];
  const tabs = [ALL, ...tags];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTag = tag === ALL || item.tags.includes(tag);
      if (!matchesTag) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [items, tag, query, ALL]);

  // Nothing published at all is a different situation from a filter matching
  // nothing, and gets its own message rather than "try another search".
  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-3xl border border-dashed border-brand-200 bg-white p-14 text-center">
        <Newspaper className="mx-auto size-12 text-brand-300" aria-hidden="true" />
        <p className="mt-4 font-display text-lg font-semibold text-ink">
          {ui.noneTitle}
        </p>
        <p className="mt-1 text-sm text-ink-faint">{ui.noneBody}</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 border-b border-brand-100 pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label={ui.filterLabel}
          className="flex flex-wrap items-center gap-2"
        >
          {tabs.map((name) => {
            const isActive = tag === name;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={isActive}
                onClick={() => setTag(name)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-brand-800 text-white shadow-md"
                    : "card-surface text-ink-soft hover:border-brand-300 hover:text-brand-700",
                )}
              >
                {name}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <label htmlFor="news-search" className="sr-only">
            {ui.searchLabel}
          </label>
          <Search
            className="absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            id="news-search"
            type="search"
            placeholder={ui.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-brand-200/80 bg-white py-2.5 pe-4 ps-10 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Featured item — hidden once a filter or search narrows the list, so
          the page never promotes something the current filter excludes. */}
      {featured && tag === ALL && !query.trim() && (
        <Reveal className="mt-12" from="scale">
          <article className="card-surface group relative overflow-hidden shadow-lg transition-shadow duration-500 hover:shadow-2xl lg:grid lg:grid-cols-12 lg:items-center">
            <div className="relative h-64 min-h-[360px] overflow-hidden bg-brand-50 sm:h-80 lg:col-span-6 lg:h-full">
              {featured.image && (
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:hidden"
              />
              <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-xl bg-signal-500 px-3.5 py-1 text-xs font-semibold text-brand-950 shadow-md">
                <Sparkles className="size-3.5" aria-hidden="true" />
                {ui.featuredBadge}
              </span>
            </div>

            <div className="p-8 lg:col-span-6 lg:p-12">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-wider text-brand-700 uppercase">
                {featured.tags.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-brand-200/60 bg-brand-50 px-2.5 py-1 text-brand-800"
                  >
                    {name}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-ink-faint">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  {formatPostDate(featured.date)}
                </span>
              </div>

              <h2 className="mt-4 font-display text-2xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700 sm:text-3xl">
                <Link href={localePath(locale, `/news/${featured.slug}`)}>
                  <span className="absolute inset-0 z-10" aria-hidden="true" />
                  {featured.title}
                </Link>
              </h2>

              <p className="mt-3 line-clamp-3 text-base leading-relaxed text-ink-soft">
                {featured.excerpt}
              </p>

              {/* One element left in what was a two-column row, so it is
                  aligned to the end rather than stranded at the start of a
                  `justify-between` with nothing opposite it. */}
              <div className="mt-8 flex items-center justify-end border-t border-brand-100 pt-6">
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors duration-300 group-hover:bg-brand-800"
                >
                  {ui.readItem}
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          </article>
        </Reveal>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            {tag === ALL ? ui.latestNews : tag}
          </h2>
          {/* Announced politely so filtering gives screen-reader users the same
              feedback sighted users get from the grid changing. */}
          <p aria-live="polite" className="text-sm text-ink-faint">
            {filtered.length === 1
              ? ui.showingOne
              : ui.showingMany.replace("{count}", String(filtered.length))}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-brand-200 bg-white p-12 text-center">
            <Newspaper
              className="mx-auto size-12 text-brand-300"
              aria-hidden="true"
            />
            <p className="mt-4 font-display text-lg font-semibold text-ink">
              {ui.emptyTitle}
            </p>
            <p className="mt-1 text-sm text-ink-faint">{ui.emptyBody}</p>
            <button
              type="button"
              onClick={() => {
                setTag(ALL);
                setQuery("");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-800"
            >
              {ui.resetFilters}
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, idx) => (
              <Reveal
                as="li"
                // Keyed by filter state as well as slug so a card that survives
                // a filter change still replays its entrance rather than
                // snapping into a new grid position.
                key={`${tag}-${item.slug}`}
                delay={Math.min(idx, 6) * 60}
                from="scale"
                className="h-full"
              >
                <NewsCard
                  item={item}
                  locale={locale}
                  readLabel={ui.readItem}
                />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Calendar, MapPin, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { EventCard } from "@/components/events/event-card";
import type { ContentData } from "@/content/en";
import { cn } from "@/lib/utils";

const ALL = "All Events";

/**
 * The filtering half of the events index.
 *
 * Split out of the page for the same reason `BlogIndex` is: the route stays a
 * server component and keeps its `metadata`. Structure, class names and copy
 * rhythm are that file's, with event fields in place of article ones — if you
 * change one of the two, look at the other.
 */
export function EventsIndex({
  events,
  eventCategories,
  ui,
}: {
  events: ContentData["events"];
  eventCategories: ContentData["eventCategories"];
  ui: ContentData["ui"]["events"];
}) {
  const [category, setCategory] = useState<string>(ALL);
  const [query, setQuery] = useState("");

  /** The next thing on the calendar leads the page; failing that, the newest. */
  const featuredEvent =
    events.items.find((event) => event.status === "upcoming") ??
    events.items[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.items.filter((event) => {
      const matchesCategory = category === ALL || event.type === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        event.title.toLowerCase().includes(q) ||
        event.body.toLowerCase().includes(q) ||
        event.type.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q)
      );
    });
  }, [events.items, category, query]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 border-b border-brand-100 pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter events by type"
          className="flex flex-wrap items-center gap-2"
        >
          {eventCategories.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-brand-800 text-white shadow-md"
                    : "card-surface text-ink-soft hover:border-brand-300 hover:text-brand-700",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <label htmlFor="events-search" className="sr-only">
{ui.searchLabel}
          </label>
          <Search
            className="absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
          <input
            id="events-search"
            type="search"
            placeholder="Search events & locations..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-brand-200/80 bg-white py-2.5 pe-4 ps-10 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Featured event — hidden once a filter or search narrows the list, so
          the page never promotes an event the current filter excludes. */}
      {category === ALL && !query.trim() && (
        <Reveal className="mt-12" from="scale">
          <article className="card-surface group relative overflow-hidden shadow-lg transition-shadow duration-500 hover:shadow-2xl lg:grid lg:grid-cols-12 lg:items-center">
            <div className="relative h-64 min-h-[360px] overflow-hidden sm:h-80 lg:col-span-6 lg:h-full">
              <Image
                src={featuredEvent.image}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:hidden"
              />
              <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-xl bg-signal-500 px-3.5 py-1 text-xs font-semibold text-brand-950 shadow-md">
                <Sparkles className="size-3.5" aria-hidden="true" />
                {featuredEvent.status === "upcoming" ? "Next Up" : "Featured"}
              </span>
            </div>

            <div className="p-8 lg:col-span-6 lg:p-12">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold tracking-wider text-brand-700 uppercase">
                <span className="rounded-md border border-brand-200/60 bg-brand-50 px-2.5 py-1 text-brand-800">
                  {featuredEvent.type}
                </span>
                <span className="flex items-center gap-1 text-ink-faint">
                  <Calendar className="size-3.5" aria-hidden="true" />
                  {featuredEvent.date}
                </span>
                <span className="flex items-center gap-1 text-ink-faint">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {featuredEvent.location}
                </span>
              </div>

              <h2 className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
                {featuredEvent.title}
              </h2>

              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                {featuredEvent.body}
              </p>

              {/* The blog's author strip carries an avatar and a "Read Article"
                  button because an article has somewhere to go. An event does
                  not yet, so the same row carries its status instead. */}
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-brand-100 pt-6">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full",
                      featuredEvent.status === "upcoming"
                        ? "bg-signal-500"
                        : "bg-brand-200",
                    )}
                  />
                  {featuredEvent.status === "upcoming"
                    ? ui.upcoming
                    : ui.past}
                </span>
              </div>
            </div>
          </article>
        </Reveal>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            {category === ALL ? ui.calendar : category}
          </h2>
          {/* Announced politely so filtering gives screen-reader users the same
              feedback sighted users get from the grid changing. */}
          <p aria-live="polite" className="text-sm text-ink-faint">
            Showing {filtered.length} event{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-brand-200 bg-white p-12 text-center">
            <CalendarDays
              className="mx-auto size-12 text-brand-300"
              aria-hidden="true"
            />
            <p className="mt-4 font-display text-lg font-semibold text-ink">
{ui.emptyTitle}
            </p>
            <p className="mt-1 text-sm text-ink-faint">
              Try resetting your type filter or adjusting your search keywords.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory(ALL);
                setQuery("");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-800"
            >
{ui.resetFilters}
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, idx) => (
              <Reveal
                as="li"
                // Keyed by filter state as well as title so a card that survives
                // a filter change still replays its entrance rather than
                // snapping into a new grid position.
                key={`${category}-${event.title}`}
                delay={Math.min(idx, 6) * 60}
                from="scale"
                className="h-full"
              >
                <EventCard
                  labels={ui}
                  event={event}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

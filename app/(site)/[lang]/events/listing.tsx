import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { EventsIndex } from "./events-index";
import { content, currentLocale } from "@/content/server";
import { getPublishedNewsFor, toEventCard } from "@/lib/cms/news";
import { getPublicNewsTags, type NewsTag } from "@/lib/cms/news-tags";

/**
 * The events index, as a component.
 *
 * `BlogListing`'s twin, for the same reason: `/events` and `/events/<tag>`
 * are the same page with and without a filter on, so the page lives here
 * once and both routes call it.
 *
 * Built as the blog index's twin — same ground and blooms, same header block,
 * same filter-and-search bar, same featured panel over a three-up grid — for
 * the same reason `EventCard` is `PostCard`: an event and an article are the
 * same kind of object to a reader, so the two listings are the same page.
 *
 * Events and news are one store, one editor and one record; this is the page
 * both of them land on. The heading copy is still `content/`, because that is
 * page furniture rather than a list anyone maintains — everything below it is
 * whatever the panel holds.
 */
export async function EventsListing({ active }: { active?: NewsTag }) {
  const { events, eventCategories, ui } = await content();
  const locale = await currentLocale();
  const [items, tags] = await Promise.all([
    getPublishedNewsFor(locale),
    getPublicNewsTags(locale),
  ]);
  // The translated "All Events" chip. Still from `content/` — it is a UI word,
  // not a category anyone stores.
  const all = eventCategories[0];

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
            <Eyebrow>{events.eyebrow}</Eyebrow>
          </Reveal>

          <LineReveal
            as="h1"
            delay={90}
            className="mt-6 font-display text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-ink"
            lines={[
              events.headlineLead,
              <span
                key="accent"
                className="bg-gradient-to-r rtl:bg-gradient-to-l from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
              >
                {events.headlineAccent}
              </span>,
            ]}
          />

          <Reveal delay={280}>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              {events.intro}
            </p>
          </Reveal>
        </div>

        <EventsIndex
          items={items.map(toEventCard)}
          tags={tags}
          allLabel={all}
          active={active?.name}
          locale={locale}
          ui={ui.events}
        />
      </Shell>
    </div>
  );
}

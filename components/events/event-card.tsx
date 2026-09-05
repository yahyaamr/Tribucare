import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentData } from "@/content/en";

/**
 * The event card.
 *
 * Deliberately the same card as `components/blog/post-card` — same
 * `card-surface card-interactive` shell, same 13rem media band, same
 * top-left floating badge, same meta / title / excerpt rhythm, same
 * bordered footer row. An event and an article are the same kind of object
 * to a reader, so they get the same object on screen.
 *
 * If you change one of these two files, change the other.
 */
export function EventCard({
  event,
  labels,
  href,
  sizes = "(max-width: 1024px) 100vw, 42vw",
}: {
  /** The two status words. A prop rather than a lookup because this card is
   *  also rendered from inside the client carousel, which cannot read the
   *  locale for itself. */
  labels: ContentData["ui"]["events"];
  event: {
    icon: string;
    status: string;
    type: string;
    title: string;
    date: string;
    location: string;
    body: string;
    image: string;
  };
  /** Where the card goes. Unset renders it as a plain, unlinked card. */
  href?: string;
  sizes?: string;
}) {
  const upcoming = event.status === "upcoming";

  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden bg-brand-50">
        <Image
          src={event.image}
          alt=""
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <span className="absolute top-3.5 start-3.5 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-brand-900 shadow-md backdrop-blur-md">
          {event.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden="true" />
              {event.date}
            </span>
            <span aria-hidden="true">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {event.location}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 h-13 font-display text-lg leading-snug font-semibold text-ink transition-colors duration-300 group-hover:text-brand-700">
            {href ? (
              <Link href={href}>
                {/* Same stretched link as the post card: the whole card is
                    clickable under one accessible name. */}
                <span className="absolute inset-0 z-10" aria-hidden="true" />
                {event.title}
              </Link>
            ) : (
              event.title
            )}
          </h3>

          <p className="mt-2.5 line-clamp-3 min-h-[4.25rem] text-sm leading-relaxed text-ink-soft">
            {event.body}
          </p>
        </div>

        {/* Footer row mirrors the post card's author strip: one identifying
            detail on the left, one status mark on the right. Upcoming carries
            the warm signal accent, past goes quiet. */}
        <div className="mt-6 flex items-center justify-between border-t border-brand-50 pt-4">
          <span className="flex items-center gap-2 text-xs font-medium text-ink">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                upcoming ? "bg-signal-500" : "bg-brand-200",
              )}
            />
            {upcoming ? labels.upcoming : labels.past}
          </span>
        </div>
      </div>
    </article>
  );
}

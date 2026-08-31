import {
  ArrowRight,
  Briefcase,
  MapPin,
  TrendingUp,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  TrendingUp,
  Truck,
  Wrench,
};

/**
 * One open role.
 *
 * This is `components/teams/team-card.tsx` with role fields — same
 * `card-surface card-interactive` shell, same `icon-disc` plate and badge row,
 * same bordered footer — plus the post card's stretched link and arrow disc,
 * because unlike a team card this one goes somewhere. If you change one of
 * those two files, look at this one too.
 */
export function RoleCard({
  role,
  href,
}: {
  role: {
    icon: string;
    title: string;
    department: string;
    type: string;
    location: string;
    blurb: string;
  };
  href?: string;
}) {
  const Icon = ICONS[role.icon] ?? Briefcase;

  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col justify-between overflow-hidden p-8">
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="icon-disc size-14 group-hover:scale-110 group-hover:bg-brand-700 group-hover:text-white">
            <Icon className="size-7" strokeWidth={1.8} aria-hidden="true" />
          </span>

          <span className="rounded-xl border border-brand-200/60 bg-brand-50 px-3 py-1 text-[0.75rem] font-semibold tracking-wide text-brand-800">
            {role.type}
          </span>
        </div>

        <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-700">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {/* Stretches the link across the whole card, so the role title
                  stays the single accessible name. */}
              <span className="absolute inset-0 z-10" aria-hidden="true" />
              {role.title}
            </a>
          ) : (
            role.title
          )}
        </h3>

        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
          {role.blurb}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-brand-100/70 pt-5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-faint">
          <span className="flex items-center gap-1">
            <Briefcase className="size-3.5" aria-hidden="true" />
            {role.department}
          </span>
          <span aria-hidden="true">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" />
            {role.location}
          </span>
        </div>

        {href && (
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-700 group-hover:text-white"
          >
            <ArrowRight className="size-4" />
          </span>
        )}
      </div>
    </article>
  );
}

import {
  Megaphone,
  TrendingUp,
  Wrench,
  Stethoscope,
  ShoppingBag,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Megaphone,
  TrendingUp,
  Wrench,
  Stethoscope,
  ShoppingBag,
  Truck,
};

/**
 * One division card in the Teams section.
 *
 * Lifted out of `sections/teams.tsx` unchanged when the section started
 * rendering the same six cards twice — a rail on phones, the 2x3 grid from sm.
 * Both lists render this, so the two layouts can never drift apart.
 */
export function TeamCard({
  team,
}: {
  team: {
    icon: string;
    badge: string;
    name: string;
    role: string;
    highlight: string;
  };
}) {
  const Icon = ICONS[team.icon] ?? Users;

  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col justify-between overflow-hidden p-8">
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="icon-disc size-14 group-hover:scale-110 group-hover:bg-brand-700 group-hover:text-white">
            <Icon className="size-7" strokeWidth={1.8} aria-hidden="true" />
          </span>

          <span className="rounded-xl border border-brand-200/60 bg-brand-50 px-3 py-1 text-[0.75rem] font-semibold tracking-wide text-brand-800">
            {team.badge}
          </span>
        </div>

        <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink transition-colors duration-300 group-hover:text-brand-700">
          {team.name}
        </h3>

        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
          {team.role}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-brand-100/70 pt-5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-signal-500"
          />
          {team.highlight}
        </span>
      </div>
    </article>
  );
}

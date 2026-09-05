import {
  Building2,
  Globe,
  Hospital,
  Pill,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  hospital: Hospital,
  building: Building2,
  store: Store,
  "shopping-cart": ShoppingCart,
  pill: Pill,
  globe: Globe,
};

export type Channel = {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
};

/**
 * One distribution channel. Used by the Distribution Partners section on the
 * MLAY page and by the one on the Altesse Soin page — a component rather than
 * markup inlined into each, so the two can never drift.
 *
 * Neither tone is invented. `tone="light"` is Mission & Vision's white panel —
 * `card-surface card-interactive` with an `icon-disc` plate — and `tone="dark"`
 * is Core Values' rail card, down to the `signal-500` trace tick that stretches
 * on hover. The `tone` prop itself is the site's own convention, the one
 * <Eyebrow>, <WaveField> and <CardStepper> already use.
 */
export function ChannelCard({
  channel,
  tone = "light",
}: {
  channel: Channel;
  tone?: "light" | "dark";
}) {
  const Icon = ICONS[channel.icon];
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "group h-full",
        dark
          ? "rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-colors duration-500 hover:border-brand-400/40 hover:bg-white/[0.07]"
          : "card-surface card-interactive p-7",
      )}
    >
      <span
        className={cn(
          "size-12 group-hover:scale-110",
          dark
            ? "icon-disc-dark group-hover:bg-brand-400/30 group-hover:text-white"
            : "icon-disc group-hover:bg-brand-700 group-hover:text-white",
        )}
      >
        {Icon && (
          <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
        )}
      </span>
      <h3
        className={cn(
          "mt-5 font-display text-[1.0625rem] leading-snug font-semibold",
          dark ? "text-white" : "text-ink",
        )}
      >
        {channel.title}
      </h3>
      <p
        className={cn(
          "mt-3 text-[0.875rem] leading-relaxed",
          dark ? "text-brand-200/75" : "text-ink-soft",
        )}
      >
        {channel.body}
      </p>
      <span
        aria-hidden="true"
        className="mt-6 block h-px w-8 origin-left rtl:origin-right bg-signal-500/60 transition-transform duration-500 group-hover:scale-x-[3]"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Building2,
  Globe2,
  ShoppingBag,
  Stethoscope,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Rail } from "@/components/site/rail";
import { cn } from "@/lib/utils";
import type { ContentData } from "@/content/en";

/** `icon` keys from `partnerPillars`, resolved to components — the same
 *  pattern every other section uses. */
const ICONS: Record<string, LucideIcon> = {
  globe: Globe2,
  stethoscope: Stethoscope,
  building: Building2,
  "shopping-bag": ShoppingBag,
  truck: Truck,
};


/**
 * Partnership models.
 *
 * Each card is a real `<button aria-pressed>` rather than a `<div onClick>` —
 * the previous version could not be reached or activated from the keyboard at
 * all, and announced nothing about being selectable or selected.
 */
/**
 * Content arrives as a prop: this is a client component (it tracks the selected
 * pillar), and the locale lives in a root parameter only server components can
 * read. The copy itself now lives in `content/site.ts`, where it can be
 * translated — it used to be written into this file.
 */
export function PartnerPillars({
  pillars,
}: {
  pillars: ContentData["partnerPillars"];
}) {
  const [selected, setSelected] = useState("global");

  // `py-4` on the rail, not just `pb-4`: the selected and hovered cards sit 4px
  // high on a `-translate-y-1`, and the rail's `overflow-y: clip` would
  // otherwise slice their top edge (and ring) off. The padding gives that lift
  // room inside the clip box.
  return (
    <Rail aria-label="Partnership models" className="mt-8 gap-6 py-4">
      {pillars.map((pillar, idx) => {
        const Icon = ICONS[pillar.icon];
        const isSelected = selected === pillar.id;

        return (
          <Reveal
            as="li"
            key={pillar.id}
            delay={Math.min(idx, 4) * 70}
            from="scale"
            className="rail-item w-[19rem] sm:w-[21rem]"
          >
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(pillar.id)}
              className={cn(
                "group relative flex h-full w-full flex-col justify-between rounded-2xl border p-8 text-start transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isSelected
                  ? "-translate-y-1 border-brand-600 bg-brand-900 text-white shadow-xl ring-2 ring-brand-500/20"
                  : "border-brand-100 bg-white text-ink hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_30px_60px_-38px_rgb(14_106_105/0.55)]",
              )}
            >
              <div>
                <span
                  className={cn(
                    "size-14 transition-transform duration-500 group-hover:scale-110",
                    isSelected
                      ? "icon-disc bg-signal-500 text-brand-950"
                      : "icon-disc group-hover:bg-brand-700 group-hover:text-white",
                  )}
                >
                  <Icon className="size-7" aria-hidden="true" />
                </span>

                <h3
                  className={cn(
                    "mt-6 font-display text-xl font-semibold tracking-tight transition-colors duration-300",
                    isSelected
                      ? "text-white"
                      : "text-ink group-hover:text-brand-700",
                  )}
                >
                  {pillar.title}
                </h3>

                <p
                  className={cn(
                    "mt-1 text-xs font-semibold tracking-wider uppercase",
                    isSelected ? "text-signal-400" : "text-brand-600",
                  )}
                >
                  {pillar.subtitle}
                </p>

                <p
                  className={cn(
                    "mt-3 text-sm leading-relaxed",
                    isSelected ? "text-brand-100/80" : "text-ink-soft",
                  )}
                >
                  {pillar.description}
                </p>
              </div>

              <ul
                className={cn(
                  "mt-6 flex flex-wrap gap-2 border-t pt-5",
                  isSelected ? "border-white/10" : "border-brand-100",
                )}
              >
                {pillar.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className={cn(
                      "rounded-xl border px-2.5 py-1 text-[0.75rem] font-medium transition-colors duration-300",
                      isSelected
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-brand-200/60 bg-brand-50/70 text-brand-800",
                    )}
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </button>
          </Reveal>
        );
      })}
    </Rail>
  );
}

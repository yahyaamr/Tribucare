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
import { cn } from "@/lib/utils";

type Pillar = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
};

const PARTNER_PILLARS: Pillar[] = [
  {
    id: "global",
    title: "Global Brand Partners",
    subtitle: "Exclusive Agency & Regional Market Entry",
    description:
      "We serve as the exclusive agent in Egypt for world-leading German, Italian, and Korean medical aesthetics and skincare brands, navigating registration, market positioning, and commercial launch.",
    icon: Globe2,
    highlights: [
      "Regulatory Clearance",
      "Strategic Brand Positioning",
      "Nationwide Distribution",
    ],
  },
  {
    id: "physicians",
    title: "Dermatologists & Physicians",
    subtitle: "Clinical Masterclasses & Certified Education",
    description:
      "Our relationship with physicians extends far beyond product supply. We provide hands-on clinical workshops, anatomical mapping, and injection protocols led by certified trainers.",
    icon: Stethoscope,
    highlights: [
      "Continuous Medical Education",
      "Device Masterclasses",
      "Protocol Support",
    ],
  },
  {
    id: "clinics",
    title: "Clinics & Aesthetic Centres",
    subtitle: "Advanced Technology & 24/7 Technical Service",
    description:
      "Equipping aesthetic clinics with cutting-edge energy-based systems (Zimmer, Rejuran, BV Laser), supported by rapid-response field engineers maintaining zero downtime.",
    icon: Building2,
    highlights: [
      "24/7 Technical Uptime",
      "Preventive Maintenance",
      "Clinical Integration",
    ],
  },
  {
    id: "retail",
    title: "Retail & E-commerce Partners",
    subtitle: "Flagship Retail & Multi-Channel Scale",
    description:
      "Distributing consumer beauty tech (MLAY) and skincare across flagship shopping malls (City Stars, Mall of Arabia) and leading online channels (Amazon, Noon, Jumia).",
    icon: ShoppingBag,
    highlights: [
      "Flagship Mall Outlets",
      "Top Marketplace Growth",
      "D2C Fulfillment",
    ],
  },
  {
    id: "distributors",
    title: "Regional Distributors",
    subtitle: "MENA Supply Chain & Inventory Fulfillment",
    description:
      "Building strategic distribution networks across North Africa and the Middle East backed by Mondial Investissement Corporation's 40+ year operational heritage.",
    icon: Truck,
    highlights: [
      "MENA Logistics Network",
      "Warehousing Scale",
      "Strategic Growth",
    ],
  },
];

/**
 * Partnership models.
 *
 * Each card is a real `<button aria-pressed>` rather than a `<div onClick>` —
 * the previous version could not be reached or activated from the keyboard at
 * all, and announced nothing about being selectable or selected.
 */
export function PartnerPillars() {
  const [selected, setSelected] = useState("global");

  return (
    <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {PARTNER_PILLARS.map((pillar, idx) => {
        const Icon = pillar.icon;
        const isSelected = selected === pillar.id;

        return (
          <Reveal
            as="li"
            key={pillar.id}
            delay={idx * 60}
            from="scale"
            className="h-full"
          >
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(pillar.id)}
              className={cn(
                "group relative flex h-full w-full flex-col justify-between rounded-2xl border p-8 text-left transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
    </ul>
  );
}

import {
  Briefcase,
  Calculator,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Headset,
  Megaphone,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons a role card can wear.
 *
 * One list, shared by the card that renders the icon and the picker that
 * chooses it — so the panel can never offer an icon the site cannot draw, and
 * adding one is a single edit here rather than two that drift apart.
 *
 * These are the same lucide glyphs, at the same weight, in the same `icon-disc`
 * plate the rest of the site uses. The set is deliberately small and job-shaped:
 * it covers the kinds of role this company actually hires for, so the editor
 * picks the closest match rather than browsing an icon library and landing on
 * something that reads as a foreign object in the section.
 *
 * `key` is what is stored on the record. **Never rename one** — a stored role
 * points at it by name, and a rename silently drops every card using it back to
 * the `Briefcase` fallback.
 */
export const ROLE_ICONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "TrendingUp", label: "Sales", Icon: TrendingUp },
  { key: "Briefcase", label: "General", Icon: Briefcase },
  { key: "Wrench", label: "Technical support", Icon: Wrench },
  { key: "Truck", label: "Logistics", Icon: Truck },
  { key: "Package", label: "Warehousing", Icon: Package },
  { key: "Users", label: "People & HR", Icon: Users },
  { key: "GraduationCap", label: "Training", Icon: GraduationCap },
  { key: "Stethoscope", label: "Clinical", Icon: Stethoscope },
  { key: "HeartPulse", label: "Medical", Icon: HeartPulse },
  { key: "FlaskConical", label: "Research & lab", Icon: FlaskConical },
  { key: "Sparkles", label: "Beauty & aesthetics", Icon: Sparkles },
  { key: "Megaphone", label: "Marketing", Icon: Megaphone },
  { key: "ShoppingBag", label: "Retail", Icon: ShoppingBag },
  { key: "Headset", label: "Customer care", Icon: Headset },
  { key: "ShieldCheck", label: "Quality & regulatory", Icon: ShieldCheck },
];

const BY_KEY = new Map(ROLE_ICONS.map((icon) => [icon.key, icon.Icon]));

/** The default for an unset, unknown or retired key. */
export const FALLBACK_ROLE_ICON = Briefcase;

export function roleIcon(key: string): LucideIcon {
  return BY_KEY.get(key) ?? FALLBACK_ROLE_ICON;
}

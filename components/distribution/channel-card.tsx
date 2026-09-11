import Image from "next/image";
import {
  Building2,
  Globe,
  Hospital,
  Mail,
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
  mail: Mail,
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
  href,
  image,
  imageSizes,
}: {
  channel: Channel;
  tone?: "light" | "dark";
  /**
   * Optional. Turns the card into a link using the site's standard overlay
   * pattern — an absolutely positioned span over the whole card, so the target
   * is the card rather than the few words of the body, and the accessible name
   * is the title rather than a bare address. Added for the contact page's
   * customer-service card; the distribution sections pass nothing and are
   * untouched.
   */
  href?: string;
  /**
   * Optional photograph, filling whatever height is left under the copy.
   *
   * The site's other media bands are a fixed `h-52` because they sit in a row
   * of cards that must line up. This one is `flex-1` instead: the card it was
   * added for stands beside a map and stretches to it, so the panel takes the
   * slack rather than leaving it empty under the address. With no image the
   * card renders exactly as it did — the padding simply moves from the shell to
   * the copy — which is what keeps the two distribution sections untouched.
   */
  image?: { readonly src: string; readonly alt: string };
  /** Only read when `image` is set. */
  imageSizes?: string;
}) {
  const Icon = ICONS[channel.icon];
  const dark = tone === "dark";

  return (
    <div
      className={cn(
        "group h-full",
        href && "relative",
        image ? "flex flex-col overflow-hidden" : "p-7",
        dark
          ? "rounded-3xl border border-white/10 bg-white/[0.04] transition-colors duration-500 hover:border-brand-400/40 hover:bg-white/[0.07]"
          : "card-surface card-interactive",
      )}
    >
      <div className={cn(image && "p-7")}>
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
          {href ? (
            // An absolute href leaves the site, so it opens in a new tab the way
            // every other outbound link here does. A `mailto:` or a site path
            // stays in place.
            <a
              href={href}
              {...(href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {channel.title}
            </a>
          ) : (
            channel.title
          )}
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

      {image && (
        <div className="relative mt-auto min-h-[13rem] flex-1">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={imageSizes ?? "(max-width: 1024px) 100vw, 33vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}
    </div>
  );
}

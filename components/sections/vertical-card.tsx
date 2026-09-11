import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WaveField } from "@/components/brand/wave-field";
import { TribuLogo } from "@/components/brand/logo";
import type { ContentData } from "@/content/en";
import { localePath, type Locale } from "@/lib/i18n/config";

/**
 * One vertical, as the large feature card the homepage's Expertise section
 * introduced.
 *
 * It lives here rather than inside that section because the Partnerships page
 * renders the same three cards. There is one copy of the markup and one copy of
 * the content (`verticals` in content/site.ts), so a word changed on the
 * homepage card is the same word on the Partnerships one — that is the whole
 * reason for the extraction.
 *
 * The card knows nothing about stacking. `--stack-card-height` is set by
 * <CardStack> when there is one and resolves to `auto` when there is not, so
 * the same card sits in the homepage's sticky stack and in an ordinary column
 * without a variant or a flag.
 */

/** A brand mark from `brandLogos`, falling back to its name set in type. Shared
 *  with the Expertise section's hierarchy diagram, which draws the same marks. */
export function BrandLogo({
  name,
  className,
  brandLogos,
}: {
  name: string;
  className?: string;
  brandLogos: ContentData["brandLogos"];
}) {
  const logo = brandLogos[name];
  if (!logo) return <span className="font-semibold text-ink">{name}</span>;
  return (
    <Image
      src={logo.src}
      alt={name}
      width={logo.width}
      height={logo.height}
      className={cn("w-auto object-contain", className || "h-5 max-w-[6.5rem]")}
    />
  );
}

/** The card's call to action, and the overlay that makes the whole card it. */
const CTA_CLASS =
  "mt-8 inline-flex items-center gap-1.5 self-start text-[1rem] font-semibold text-brand-600 transition-colors hover:text-brand-800 lg:mt-[clamp(1.25rem,3dvh,2rem)]";

function CardCta({
  href,
  label,
  locale,
}: {
  href: string;
  label: string;
  locale: Locale;
}) {
  const inner = (
    <>
      {label}
      {/* The RTL mirror lives in the global lucide rule in globals.css, with
          the other directional icons. The hover nudge rides `translate` and the
          mirror rides `transform`, so the two compose rather than fight. */}
      <ArrowUpRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      <span className="absolute inset-0" aria-hidden="true" />
    </>
  );

  return href.startsWith("/") ? (
    <Link href={localePath(locale, href)} className={CTA_CLASS}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={CTA_CLASS}>
      {inner}
    </a>
  );
}

export function VerticalCard({
  vertical,
  brandLogos,
  locale,
}: {
  vertical: ContentData["verticals"][number];
  brandLogos: ContentData["brandLogos"];
  locale: Locale;
}) {
  return (
    <article className="group relative isolate flex min-h-[var(--stack-card-height,auto)] flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.05] bg-white shadow-[0_40px_80px_-56px_rgb(7_42_42/0.55)] transition-shadow duration-700 hover:shadow-[0_54px_100px_-58px_rgb(7_42_42/0.62)] lg:rounded-[2.25rem]">
      {/* Wave field washes across the card's bottom-left corner,
          under both columns, exactly as the deck sets it. */}
      <WaveField
        tone="light"
        lines={16}
        className="absolute bottom-0 left-0 -z-10 h-[34%] w-[130%] opacity-60 lg:h-[24%] lg:w-[62%]"
      />

      {/* `flex-1` rather than a bare grid: `min-h-[...]` above is
          only a floor on the article, and the article is not
          itself a layout container for it, so a shorter card's
          grid — sized to its own now-shorter content — used to
          stop short of that floor and leave the gap empty
          instead of the media panel reaching the card's true
          bottom edge. Growing the grid to fill whatever height
          the article actually ends up at removes the gap
          regardless of which card is tallest at the time. */}
      <div className="grid flex-1 lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center p-7 sm:p-10 lg:order-1 lg:p-[clamp(1.5rem,3dvh,2.75rem)] xl:py-[clamp(1.5rem,3.2dvh,3.25rem)] xl:pe-10 xl:ps-14">
          {/* Nowrap from `sm` up: the badge is sized to fit beside
              the number at every width down to a small tablet, so
              it no longer drops to a second line under it. Below
              `sm` the longest label ("Professional Dermatology
              Solutions") has no width left to shrink into without
              going illegible, so it falls back to wrapping there
              rather than clipping against the card edge. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap">
            <span className="font-display text-[clamp(2.5rem,min(8vw,9dvh),6.5rem)] leading-[0.78] font-semibold text-brand-200/85">
              {vertical.number}
            </span>
            <span className="shrink-0 rounded-xl border border-signal-500/55 px-[0.65rem] py-[0.325rem] font-mono text-[0.45rem] leading-none tracking-[0.14em] text-signal-600 uppercase lg:px-[0.8125rem] lg:py-[0.406rem] lg:text-[0.47rem]">
              {vertical.label}
            </span>
          </div>

          <h3 className="mt-6 max-w-[9.5em] font-display text-[clamp(1.75rem,min(3.8vw,5.5dvh),3rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-ink lg:mt-[clamp(0.875rem,2dvh,1.5rem)]">
            {vertical.headline}
          </h3>
          <span
            aria-hidden="true"
            className="mt-5 block h-[3px] w-14 rounded-full bg-brand-600"
          />

          <p className="mt-5 max-w-[26rem] text-[0.95rem] leading-[1.6] text-ink-soft sm:text-[1.0625rem] lg:mt-[clamp(0.75rem,1.75dvh,1.25rem)]">
            {vertical.body}
          </p>

          <div className="mt-6 border-t border-black/[0.07] pt-5 lg:mt-[clamp(0.875rem,2.2dvh,1.75rem)] lg:pt-[clamp(0.75rem,1.75dvh,1.25rem)]">
            <p className="eyebrow text-ink-faint">Brands</p>
            {/* Logo plates. Every plate is the same fixed box
                regardless of the mark's aspect ratio (1.4:1 to
                6:1), so the row reads as a set of matched cards
                rather than tag-shaped chips of varying width.

                Box width is the tight constraint: Dermatology's
                six marks have to fit on one row even at the
                narrowest point of the two-column layout (~409px
                available right at `lg`) — 6 × plate + 5 × gap must
                clear that, which is what sizes the plate down from
                what a single mark like MLAY would otherwise get. */}
            <ul className="mt-3.5 flex flex-wrap items-center gap-1.5 lg:gap-2">
              {vertical.brands.map((brand) => {
                const logo = brandLogos[brand];
                return (
                  <li
                    key={brand}
                    className="flex h-7 w-[3.625rem] items-center justify-center rounded-lg bg-black/[0.045] transition-colors duration-300 hover:bg-brand-100/70 lg:h-9 lg:w-[4.75rem] lg:rounded-lg"
                  >
                    {logo ? (
                      <Image
                        src={logo.src}
                        alt={brand}
                        width={logo.width}
                        height={logo.height}
                        className="max-h-5 max-w-[3.125rem] object-contain lg:max-h-[1.625rem] lg:max-w-[4.125rem]"
                      />
                    ) : (
                      <span className="text-[0.85rem] font-semibold tracking-[0.02em] text-ink/85 lg:text-[0.95rem]">
                        {brand}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* A route gets Next's <Link>, so the card navigates
              client-side like every other internal link here rather
              than reloading the whole document. An in-page anchor
              stays a plain <a>: Lenis's smooth-scroll handler reads
              the click off the document, and <Link> would
              preventDefault it away. The overlay span is what makes
              the whole card the target, either way. */}
          <CardCta
            href={vertical.cta.href}
            label={vertical.cta.label}
            locale={locale}
          />
        </div>

        {/* Light media panel: the cut-out product floats over a soft
            mint disc, with the TribuCare lock-up in the corner. */}
        <div className="relative order-1 min-h-[22rem] sm:min-h-[26rem] lg:order-2 lg:min-h-[min(28rem,48dvh)]">
          {/* Bottom-anchored rather than centred on the panel: the
              product image is itself bottom-anchored, so the disc
              has to sit at the same edge to stay coupled to it
              however tall the (now height-matched) panel gets —
              centring it would drift the disc upward, away from
              the image, on any card shorter than the tallest. */}
          <div
            aria-hidden="true"
            className="absolute bottom-[6%] start-[37%] aspect-square w-[68%] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-100/90 to-brand-50/30 rtl:translate-x-1/2 lg:start-[55%]"
          />

          {/* Anchored to the panel's bottom-right corner. The panel
              fills the full card height, so the image's bottom edge
              always lands on the card's bottom edge, whatever the
              source aspect ratio. Only the top overshoots, so tall
              portrait shots bleed past the card's top instead of
              leaving headroom.

              Under RTL the whole wrapper is flipped, which mirrors
              the composition in one move: the cut-out lands on the
              card's outer edge and faces into the Arabic copy,
              rather than staying pinned to the inner edge as a
              physical `object-right-bottom` otherwise would.

              The flip does reverse lettering that lives in the
              pixels — the REJURAN wordmark, the MLAY mark on the
              handset, the altesse label. Replacing these with
              purpose-made mirrored sources is the fix for that; the
              transform is what mirrors the layout today.

              The padding is physical (`pl-`) on purpose: `ps-`
              already flips itself under RTL, and inside a flipped
              wrapper it would flip a second time and land back on
              the outer edge it is meant to clear. */}
          <div className="absolute inset-x-0 -top-[8%] bottom-0 rtl:-scale-x-100">
            <Image
              src={vertical.image.src}
              alt={vertical.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-right-bottom pl-6 transition-transform duration-700 group-hover:scale-[1.03] sm:pl-8 lg:pl-8"
            />
          </div>

          <TribuLogo
            className="absolute end-7 bottom-6 lg:end-10 lg:bottom-7"
            markClassName="h-8"
          />
        </div>
      </div>
    </article>
  );
}

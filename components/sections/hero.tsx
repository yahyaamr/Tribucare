import Image from "next/image";
import { ArrowRight, Stethoscope, Zap, Droplet } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { Floating } from "@/components/site/floating";
import { WaveField } from "@/components/brand/wave-field";
import { hero, verticals } from "@/content/site";

const VERTICAL_ICONS = [Stethoscope, Zap, Droplet] as const;

const MARK = {
  src: "/brand/tribu-3d-mark.webp",
  width: 1254,
  height: 1254,
} as const;

/** The mark is rendered twice (in-flow below lg, beside the copy above it) but
 *  only one is ever visible. Both carry this identical `sizes` list so the
 *  browser resolves the same srcset candidate and fetches the file once. */
const MARK_SIZES =
  "(max-width: 1023px) 112vw, (max-width: 1439px) 68vw, (max-width: 1919px) 60vw, 45vw";

export function Hero() {
  return (
    <section id="top" className="ground-deep relative isolate overflow-hidden">
      <WaveField
        tone="dark"
        lines={26}
        className="absolute inset-x-0 -bottom-16 h-[58%] w-[200%] opacity-45"
      />

      <Shell className="relative z-10 pt-30 pb-0 md:pt-36 lg:pt-[13.6rem]">
        <div className="lg:flex lg:items-center lg:gap-14">
          <div className="lg:w-[clamp(33rem,44vw,42rem)] lg:shrink-0">
            <Reveal>
              <Eyebrow tone="light">{hero.eyebrow}</Eyebrow>
            </Reveal>

            {/* No text-balance: the line breaks are authored, and balancing
                only forces the first line to wrap early. Those authored breaks
                are also what lets each line rise out of its own clip. */}
            <LineReveal
              as="h1"
              delay={80}
              stagger={110}
              className="mt-7 font-display text-[clamp(2.5rem,5.3vw,4.75rem)] leading-[1] font-semibold tracking-[-0.03em] text-white"
              lines={[
                hero.headlineLead,
                <span
                  key="accent"
                  className="bg-gradient-to-r from-brand-200 via-circuit-300 to-brand-300 bg-clip-text text-transparent"
                >
                  {hero.headlineAccent}
                </span>,
              ]}
            />

            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-brand-100/85 md:text-lg">
                {hero.subhead}
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={hero.primaryCta.href}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-[0.95rem] font-semibold text-brand-800 transition-[background-color,box-shadow] duration-300 hover:bg-brand-50 hover:shadow-[0_18px_40px_-18px_rgb(76_201_222/0.7)]"
                >
                  {hero.primaryCta.label}
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-xl px-7 py-4 text-[0.95rem] font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors duration-300 hover:bg-white/10 hover:ring-white/40"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>
            </Reveal>
          </div>

          {/* Anchor for the mark. `self-stretch` makes it exactly as tall as the
              copy, so centring here centres the mark on the content rather than
              on the whole section. The mark itself is absolute, so it can run
              far wider than this column and bleed off the right edge without
              driving the hero's height — which is what keeps the three vertical
              cards inside the first screen. The distance from the copy is the
              flex gap plus `left-3`, so it is identical at every width. */}
          <div className="relative hidden self-stretch lg:block lg:flex-1">
            {/* Sized by HEIGHT, not width. Centred on a copy block whose centre
                sits ~377px down, a width-driven mark grows past the top of the
                section on wide screens and gets clipped; capping the height
                keeps it whole at every viewport while still running large.
                The 4.5rem nudge below centre buys back the headroom the taller
                mark would otherwise lose at the top. */}
            <div className="absolute top-1/2 left-3 h-[clamp(26.4rem,88.8vh,51.6rem)] translate-y-[calc(-50%+7.5rem)] [perspective:1200px]">
              <Floating className="h-full">
                <Image
                  src={MARK.src}
                  alt=""
                  aria-hidden="true"
                  width={MARK.width}
                  height={MARK.height}
                  priority
                  sizes={MARK_SIZES}
                  className="float-idle h-full w-auto max-w-none select-none drop-shadow-[0_50px_90px_rgb(2_20_20/0.55)]"
                />
              </Floating>
            </div>
          </div>
        </div>

        {/* Below lg the mark can't sit beside the copy, so it runs in flow at
            full width and the cards are pulled up to overlap it there too. */}
        <div className="relative mt-10 -mr-5 -ml-5 sm:-mr-8 sm:-ml-8 lg:hidden">
          <Image
            src={MARK.src}
            alt=""
            aria-hidden="true"
            width={MARK.width}
            height={MARK.height}
            priority
            sizes={MARK_SIZES}
            // Shallower blur radius than the desktop mark carries: this one
            // runs at 112vw, and drop-shadow cost scales with radius × area.
            className="ml-[-6%] w-[112%] max-w-none select-none drop-shadow-[0_16px_28px_rgb(2_20_20/0.45)]"
          />
        </div>

        {/* The three verticals stay inside the first screen and deliberately
            cross the mark. */}
        <div className="relative z-10 -mt-12 lg:mt-16">
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 md:grid-cols-3">
            {verticals.map((vertical, i) => (
              <Reveal
                as="li"
                key={vertical.id}
                delay={360 + i * 110}
                travel="28px"
                // The blur is deliberately desktop-only. These cards sit
                // directly over the drifting wave field, so a backdrop-filter
                // here has to re-blur its backdrop on every frame of that
                // animation — which is what made scrolling the hero drop frames
                // on phones. Below lg the tint carries the same separation with
                // a higher-opacity fill and no per-frame cost.
                className="bg-brand-900/92 lg:bg-brand-900/72 lg:backdrop-blur-md"
              >
                <a
                  href="#expertise"
                  className="group flex h-full flex-col gap-2 p-6 transition-colors duration-300 hover:bg-brand-800/80 md:p-7"
                >
                  {(() => {
                    const Icon = VERTICAL_ICONS[i] || Stethoscope;
                    return (
                      <Icon
                        className="size-5 text-signal-500"
                        aria-hidden="true"
                      />
                    );
                  })()}
                  <span className="font-display text-lg leading-snug font-medium text-white">
                    {vertical.label}
                  </span>
                  <span className="mt-auto pt-3 text-sm text-brand-200/80">
                    {vertical.audience}
                  </span>
                  {/* Trace that draws in from the left on hover — the deck's
                      circuit language, reused as the card's affordance. */}
                  <span
                    aria-hidden="true"
                    className="mt-1 block h-px w-full origin-left scale-x-0 bg-gradient-to-r from-signal-500 to-transparent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                  />
                </a>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Tail space. Grows at lg so the lowered mark still clears the bottom
            of the section — otherwise `overflow-hidden` shears it off. The lg
            value is sized together with the top padding above so the
            section's total desktop height sits ~7.5% below the +30% pass this
            went through earlier — phone and tablet are back at their original
            values entirely. */}
        <div className="h-20 md:h-28 lg:h-64" />
      </Shell>
    </section>
  );
}

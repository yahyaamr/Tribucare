import Image from "next/image";
import { Gem, Sprout, Target, Users, type LucideIcon } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal } from "@/components/site/reveal";
import { Parallax } from "@/components/site/parallax";
import { Rise } from "@/components/site/rise";
import { WaveField } from "@/components/brand/wave-field";
import { missionVision } from "@/content/site";

const ICONS: Record<string, LucideIcon> = {
  target: Target,
  users: Users,
  gem: Gem,
  sprout: Sprout,
};

type Headline = { lead: string; accent: string; tail: string };
type Value = { icon: string; title: string; body: string };

/** Both centre layers carry the same list so the browser resolves each to the
 *  same rendered width and they stay in register. */
const MEDIA_SIZES = "(max-width: 1024px) 100vw, 42vw";

function Headline({ headline }: { headline: Headline }) {
  return (
    <h2 className="font-display text-[clamp(1.75rem,2.4vw,2.125rem)] leading-[1.18] font-semibold tracking-[-0.025em] text-ink">
      {headline.lead}
      <span className="text-brand-600">{headline.accent}</span>
      {headline.tail}
    </h2>
  );
}

function Rule() {
  return (
    <span
      aria-hidden="true"
      className="block h-[3px] w-14 rounded-full bg-brand-600"
    />
  );
}

function ValueCards({
  values,
  delay = 0,
}: {
  values: readonly Value[];
  delay?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-4">
      {values.map((value, i) => {
        const Icon = ICONS[value.icon];
        return (
          <Reveal
            as="li"
            key={value.title}
            delay={delay + i * 80}
            from="scale"
            className="group card-surface card-interactive p-4"
          >
            <span className="icon-disc size-14 group-hover:scale-110 group-hover:bg-brand-100">
              {Icon && (
                <Icon className="size-6" strokeWidth={1.6} aria-hidden="true" />
              )}
            </span>
            {/* 14px, not the design's 15px: the whole section renders ~12%
                narrower than the source comp, and at 15px these two-word titles
                wrap where the comp keeps them on one line. */}
            <h3 className="mt-5 font-display text-[0.875rem] leading-snug font-semibold text-ink">
              {value.title}
            </h3>
            <p className="mt-2.5 text-[0.8125rem] leading-[1.7] text-ink-soft">
              {value.body}
            </p>
          </Reveal>
        );
      })}
    </ul>
  );
}

/**
 * Mission and Vision, mirrored around a centre portrait: the mission leads with
 * its headline and closes on its value cards, the vision does the reverse, so
 * the two card rows sit diagonally opposite each other.
 */
export function MissionVision() {
  const { mission, vision, media } = missionVision;

  return (
    <section
      // Carries the "#about" anchor since the Corporate Story section was
      // removed — nav "About" and the hero's secondary CTA both point here.
      id="about"
      className="ground-light relative isolate overflow-hidden py-24 md:py-32"
    >
      {/* Corner flourish. Hidden below lg, where the viewport is narrow enough
          that the arc sweeps across the headline instead of hugging the corner. */}
      <span
        aria-hidden="true"
        className="absolute -top-32 -right-28 hidden size-80 rounded-full border border-brand-200/45 lg:block"
      />
      <WaveField
        tone="light"
        lines={18}
        className="absolute bottom-0 left-0 h-[26%] w-[120%] opacity-55 lg:w-[55%]"
      />

      <Shell className="relative">
        {/* Default `stretch` alignment is load-bearing: it lets the centre
            column take the tallest column's height, so the visual spans the full
            section the way the design has it.

            The two copy columns are deliberately equal. They were 1fr and
            1.17fr, which rendered Mission 50px narrower than Vision and — since
            each holds a two-up card grid — made its value cards 24px narrower
            than the matching pair opposite. Both now sit at Vision's width; the
            centre column absorbs the difference, and its media is
            `object-contain`, so it just resolves slightly smaller. */}
        <div className="grid gap-14 lg:grid-cols-[1fr_1.27fr_1fr] lg:gap-x-14">
          {/* Mission — headline first, cards last. The two outer columns travel
              inward from their own edges, so the section resolves toward the
              centre visual rather than all drifting the same way. */}
          <div className="flex flex-col">
            <Reveal from="left">
              <Eyebrow>{mission.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal from="left" delay={80} className="mt-7">
              <Headline headline={mission.headline} />
            </Reveal>
            <Reveal from="left" delay={120} className="mt-6">
              <Rule />
            </Reveal>
            <Reveal from="left" delay={160} className="mt-7">
              <p className="text-[0.9375rem] leading-[1.75] text-ink-soft">
                {mission.body}
              </p>
            </Reveal>
            <div className="mt-9">
              <ValueCards values={mission.values} delay={220} />
            </div>
          </div>

          {/* Centre visual. The backdrop and the figure are two stacked layers
              sharing one crop box, so `object-contain` resolves both to the same
              size and origin and they register exactly. `data-mv-layer` are the
              hooks to animate them independently. */}
          <div className="relative min-h-[24rem] sm:min-h-[30rem] lg:min-h-[44rem]">
            {/* Reaches ~8% into the gutters on either side so the composite
                fills more of the column's height. Stays inside the 3.5rem grid
                gap, so it never crowds the copy.

                Two layers of motion. The outer Parallax drifts the whole
                composite gently against the scroll; inside it, the shield
                backdrop rises into place on its own so it reads as sitting
                behind the figure rather than pasted flat against it. The figure
                is deliberately left out of the Rise — it is the anchor the
                backdrop settles against. */}
            <Parallax speed={0.06} className="absolute inset-y-0 -inset-x-[8%]">
              <Rise distance={80} className="absolute inset-0">
                <Image
                  data-mv-layer="backdrop"
                  src={media.backdrop.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={MEDIA_SIZES}
                  className="object-contain"
                />
              </Rise>
              <Image
                data-mv-layer="figure"
                src={media.figure.src}
                alt={media.figure.alt}
                fill
                priority
                sizes={MEDIA_SIZES}
                className="object-contain"
              />
            </Parallax>
          </div>

          {/* Vision — cards first, headline last, mirroring the mission */}
          <div className="flex flex-col">
            <Reveal from="right" delay={100}>
              <Eyebrow>{vision.eyebrow}</Eyebrow>
            </Reveal>
            <div className="mt-7">
              <ValueCards values={vision.values} delay={160} />
            </div>
            <Reveal from="right" delay={220} className="mt-9">
              <Rule />
            </Reveal>
            <Reveal from="right" delay={260} className="mt-7">
              <Headline headline={vision.headline} />
            </Reveal>
            <Reveal from="right" delay={300} className="mt-7">
              <p className="text-[0.9375rem] leading-[1.75] text-ink-soft">
                {vision.body}
              </p>
            </Reveal>
          </div>
        </div>
      </Shell>
    </section>
  );
}

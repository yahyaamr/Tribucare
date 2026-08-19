import {
  Award,
  BookOpen,
  GraduationCap,
  Handshake,
  Heart,
  LifeBuoy,
  Lightbulb,
  ShieldCheck,
  Target,
  UserCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal } from "@/components/site/reveal";
import { Rail } from "@/components/site/rail";
import { Counter } from "@/components/site/counter";
import { WaveField } from "@/components/brand/wave-field";
import { reach, mlayChannels, coreValues } from "@/content/site";

const ICONS: Record<string, LucideIcon> = {
  heart: Heart,
  handshake: Handshake,
  lightbulb: Lightbulb,
  target: Target,
  users: Users,
  zap: Zap,
  award: Award,
  "shield-check": ShieldCheck,
  "graduation-cap": GraduationCap,
  "user-check": UserCheck,
  "life-buoy": LifeBuoy,
  "book-open": BookOpen,
};

export function Reach() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-950 py-24 md:py-32">
      <WaveField
        tone="dark"
        lines={22}
        className="absolute inset-x-0 top-1/4 h-[70%] w-[200%] opacity-25"
      />

      <Shell className="relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow tone="light">{coreValues.eyebrow}</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-white text-balance">
              Scale that a global brand{" "}
              <br />
              <span className="text-brand-300">can build a region on.</span>
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={100}>
            <p className="text-[1.0625rem] leading-relaxed text-brand-100/75">
              Four flagship branches in Egypt&apos;s leading malls, national
              e-commerce coverage and a team deep enough to support all three
              verticals at once.
            </p>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {reach.map((stat, i) => (
            <Reveal as="li" key={stat.label} delay={i * 100} travel="32px">
              <div className="group border-t border-white/15 pt-6 transition-colors duration-500 hover:border-signal-500/60">
                <p className="font-display text-[clamp(2.75rem,5vw,3.75rem)] font-semibold leading-none tracking-[-0.035em] text-white">
                  <Counter
                    value={stat.value}
                    prefix={"prefix" in stat ? stat.prefix : ""}
                    suffix={stat.suffix}
                  />
                </p>
                <h3 className="mt-4 font-display text-base font-semibold text-brand-200">
                  {stat.label}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-brand-100/60">
                  {stat.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        {/* Core values rail.
            The numbers above state the size of the operation; these state how
            it is run, so they belong to the same argument rather than a section
            of their own — which is why the section carries one heading, not a
            second one introducing the rail.

            Kept inside <Shell>: the rail scrolls within the section's own
            column rather than bleeding to the viewport edge, and `rail-fade`
            softens both ends so the row reads as continuing past its bounds. */}
        <div className="mt-20 md:mt-24">
          <Reveal>
            <div className="flex justify-end border-t border-white/10 pt-8">
              <p className="text-[0.8125rem] text-brand-100/50">
                Drag or scroll for more →
              </p>
            </div>
          </Reveal>

          <Rail aria-label={coreValues.eyebrow} className="mt-8 gap-5 pb-4">
            {coreValues.items.map((value, i) => {
              const Icon = ICONS[value.icon];
              return (
                <Reveal
                  as="li"
                  key={value.title}
                  // Caps the stagger: past the fourth card the delay would be
                  // longer than the reveal itself, and off-screen cards would
                  // still be waiting their turn when they scroll into view.
                  delay={Math.min(i, 4) * 70}
                  from="scale"
                  className="rail-item w-[17.5rem] sm:w-[19rem]"
                >
                  <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-colors duration-500 hover:border-brand-400/40 hover:bg-white/[0.07]">
                    <span className="icon-disc-dark size-12 group-hover:scale-110 group-hover:bg-brand-400/30 group-hover:text-white">
                      {Icon && (
                        <Icon
                          className="size-6"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <h3 className="mt-5 font-display text-[1.0625rem] font-semibold leading-snug text-white">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-[0.875rem] leading-relaxed text-brand-200/75">
                      {value.body}
                    </p>
                    <span
                      aria-hidden="true"
                      className="mt-6 block h-px w-8 origin-left bg-signal-500/60 transition-transform duration-500 group-hover:scale-x-[3]"
                    />
                  </div>
                </Reveal>
              );
            })}
          </Rail>
        </div>

        {/* Flagship branches close the section: the numbers give the scale, the
            values give the conduct, and these name the places you can walk into
            — the concrete end of the same argument. */}
        <Reveal delay={120}>
          <div className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/10 pt-8">
            <span className="eyebrow text-brand-300">Flagship branches</span>
            {mlayChannels.flagship.map((mall) => (
              <span
                key={mall}
                className="rounded-xl border border-white/15 px-3.5 py-1.5 text-[0.8125rem] font-medium text-brand-100 transition-colors duration-300 hover:border-signal-500/60 hover:text-white"
              >
                {mall}
              </span>
            ))}
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

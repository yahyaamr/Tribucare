import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal } from "@/components/site/reveal";
import { Counter } from "@/components/site/counter";
import { WaveField } from "@/components/brand/wave-field";
import { reach, mlayChannels } from "@/content/site";

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
            <Eyebrow tone="light">Our Reach</Eyebrow>
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

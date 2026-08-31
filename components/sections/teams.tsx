import Image from "next/image";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { Rail } from "@/components/site/rail";
import { TeamCard } from "@/components/teams/team-card";
import { teams } from "@/content/site";

/**
 * The six divisions.
 *
 * Hover state is pure CSS `group-hover` rather than React state. The previous
 * version tracked the hovered card in `useState`, which made the whole section
 * a client component and re-rendered all six cards on every pointer enter and
 * leave — for a visual result CSS gives for free.
 */
export function Teams() {
  return (
    <section
      id="organisation"
      className="relative isolate overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-brand-50/30 py-24 md:py-32"
    >
      {/* Decorative background visual elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Glowing gradient mesh */}
        <div className="absolute -top-40 right-0 size-[600px] rounded-full bg-gradient-to-br from-brand-200/30 via-brand-100/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-[500px] rounded-full bg-gradient-to-tr from-signal-500/10 via-brand-300/15 to-transparent blur-3xl" />

        {/* Decorative background wave vectors */}
        <svg
          className="absolute inset-0 size-full text-brand-900 opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M-100 600C200 400 400 700 700 500C1000 300 1200 600 1540 400"
          />
          <path
            stroke="currentColor"
            strokeWidth="1.5"
            d="M-100 650C200 450 400 750 700 550C1000 350 1200 650 1540 450"
          />
          <path
            stroke="currentColor"
            strokeWidth="1"
            d="M-100 700C200 500 400 800 700 600C1000 400 1200 700 1540 500"
          />
        </svg>
      </div>

      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>Our Team</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.025em] text-ink"
              // Split before the article, not after: "…powered by a" leaves
              // the "a" orphaned on its own line once the column narrows.
              lines={[
                "Our success is powered by",
                <span
                  key="accent"
                  className="bg-gradient-to-r from-brand-700 via-brand-600 to-circuit-500 bg-clip-text text-transparent"
                >
                  a dynamic team of over 100 professionals
                </span>,
              ]}
            />
          </div>

          <Reveal className="lg:col-span-5" delay={100} from="right">
            <div className="space-y-4">
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                Across multiple specialised departments, each team forms an
                essential connection point between globally renowned healthcare
                brands and the practitioners, clinics, and consumers we serve
                nationwide.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Main Grid: Left tall featured team card + Right 2x3 division cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Left Column: Featured Long Team Card */}
          <Reveal className="h-full lg:col-span-4" delay={120} from="left">
            <article className="group relative flex h-full min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-brand-200/80 bg-brand-950 text-white shadow-sm transition-all duration-500 hover:shadow-xl">
              <Image
                src="/brand/team-photo.webp"
                alt="TribuCare Team"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />

              <div className="relative z-10 mt-auto flex flex-col gap-3 p-8">
                <span className="self-start rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-[0.75rem] font-semibold tracking-wider text-brand-200 uppercase backdrop-blur-md">
                  100+ Professionals
                </span>
                <h3 className="font-display text-2xl font-semibold text-white">
                  TribuCare Healthcare &amp; Beauty Team
                </h3>
                <p className="text-sm leading-relaxed text-brand-100/80">
                  Dedicated experts in medical dermatology, device logistics, clinical education, and retail distribution across Egypt &amp; MENA.
                </p>
              </div>
            </article>
          </Reveal>

          {/* Right column: a rail on phones so six cards cost one swipe
              instead of six screens of scrolling; the 2x3 grid from sm. Both
              render the same <TeamCard>. */}
          <div className="min-w-0 lg:col-span-8">
            <Rail aria-label="TribuCare divisions" className="gap-6 sm:hidden">
              {teams.map((dept, index) => (
                <Reveal
                  as="li"
                  key={dept.id}
                  delay={Math.min(index, 4) * 70}
                  from="scale"
                  className="rail-item w-[18.5rem]"
                >
                  <TeamCard team={dept} />
                </Reveal>
              ))}
            </Rail>

            <ul className="hidden gap-6 sm:grid sm:grid-cols-2">
              {teams.map((dept, index) => (
                <Reveal
                  as="li"
                  key={dept.id}
                  delay={index * 70}
                  from="scale"
                  className="h-full"
                >
                  <TeamCard team={dept} />
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Shell>
    </section>
  );
}

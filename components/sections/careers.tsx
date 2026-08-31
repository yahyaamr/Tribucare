import { ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { Rail } from "@/components/site/rail";
import { RoleCard } from "@/components/careers/role-card";
import { careers } from "@/content/site";

/**
 * Open roles.
 *
 * Deep ground, so it separates the two light sections it sits between (Teams
 * above, Insights below) rather than reading as more of the same page. Cards
 * stay white — a `card-surface` on `ground-deep` is the site's normal pairing.
 *
 * `careers.applyUrl` is empty until the external recruitment system is wired
 * up. The role cards are conditional on it — an unset URL renders them as plain
 * cards rather than dead links — but the CTA always shows, falling back to this
 * section's own anchor so it never 404s. Set `applyUrl` and both point out.
 */
export function Careers() {
  const href = careers.applyUrl || undefined;

  return (
    <section
      id="careers"
      className="ground-deep relative isolate overflow-hidden py-24 md:py-32"
    >
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow tone="light">{careers.eyebrow}</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] leading-[1.03] font-semibold tracking-[-0.025em] text-white"
              lines={[
                careers.headlineLead,
                <span key="accent" className="text-circuit-300">
                  {careers.headlineAccent}
                </span>,
              ]}
            />
          </div>

          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-brand-200">
              {careers.intro}
            </p>
          </Reveal>
        </div>

        {/* A rail on phones so the roles cost one swipe instead of three
            screens of scrolling, the grid from sm — same split, same card
            width and gap as the Teams section's divisions. */}
        <div className="mt-16 min-w-0">
          <Rail aria-label="Open roles" className="gap-6 sm:hidden">
            {careers.roles.map((role, index) => (
              <Reveal
                as="li"
                key={role.id}
                delay={index * 70}
                from="scale"
                className="rail-item w-[18.5rem]"
              >
                <RoleCard role={role} href={href} />
              </Reveal>
            ))}
          </Rail>

          <ul className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {careers.roles.map((role, index) => (
              <Reveal
                as="li"
                key={role.id}
                delay={index * 70}
                from="scale"
                className="h-full"
              >
                <RoleCard role={role} href={href} />
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={220}>
          <div className="mt-12 flex justify-center">
            <a
              href={href ?? "#careers"}
              target={href ? "_blank" : undefined}
              rel={href ? "noopener noreferrer" : undefined}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-[0.95rem] font-semibold text-brand-800 transition-[background-color,box-shadow] duration-300 hover:bg-brand-50 hover:shadow-[0_18px_44px_-18px_rgb(76_201_222/0.75)]"
            >
              {careers.cta.label}
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

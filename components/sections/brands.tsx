import Image from "next/image";
import { cn } from "@/lib/utils";
import { Shell, Eyebrow } from "@/components/site/shell";
import { ImageFallback } from "@/components/site/image-fallback";
import { Reveal, LineReveal } from "@/components/site/reveal";
import { content } from "@/content/server";

/**
 * Official brand mark, set to a fixed height with the width left to follow.
 * These logos run from 1.4:1 to 6:1, so a shared height — not a shared box — is
 * what makes a row of them read as one set. `max-w` keeps the widest (MLAY,
 * BV Laser) from crowding whatever sits beside them.
 *
 * Falls back to the brand name if a logo is ever missing from `brandLogos`.
 */
async function BrandLogo({
  name,
  className,
  onDark = false,
}: {
  name: string;
  className?: string;
  onDark?: boolean;
}) {
  const { brandLogos } = await content();
  const logo = brandLogos[name];

  if (!logo) {
    return (
      <p
        className={cn(
          "font-display text-[1.375rem] leading-none font-semibold tracking-[-0.02em]",
          onDark ? "text-white" : "text-ink",
        )}
      >
        {name}
      </p>
    );
  }

  return (
    <Image
      src={onDark && logo.light ? logo.light : logo.src}
      alt={name}
      width={logo.width}
      height={logo.height}
      className={cn("w-auto object-contain object-left", className)}
    />
  );
}

/**
 * The image panel each group is introduced by.
 *
 * One component for all three so the three groups cannot drift into three
 * different treatments — same radius, same hairline, same mint ground the media
 * bands use everywhere else. It stretches to whatever the content beside it
 * measures (`h-full` against an `items-stretch` grid), which is what keeps the
 * panel and the cards sharing a top and bottom edge instead of the picture
 * dictating the row's height.
 *
 * With no `src` it renders the site's standard placeholder rather than
 * collapsing, so an unsupplied image reads as "one belongs here" instead of as
 * a layout that never had one.
 */
function GroupMedia({
  image,
  className,
}: {
  image: { src: string; alt: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-[14rem] overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 lg:min-h-full",
        className,
      )}
    >
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
        />
      ) : (
        <ImageFallback iconClassName="size-10" />
      )}
    </div>
  );
}

function BrandPlate({
  name,
  origin,
  role,
}: {
  name: string;
  origin: string;
  role: string;
}) {
  return (
    <article className="card-surface card-interactive group relative flex h-full flex-col justify-between gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <BrandLogo name={name} className="h-8 max-w-[9.5rem]" />
        <span className="eyebrow shrink-0 pt-1 text-ink-faint">{origin}</span>
      </div>
      <p className="text-[0.9rem] leading-relaxed text-ink-soft">{role}</p>
      <span
        aria-hidden="true"
        className="absolute inset-x-6 bottom-0 h-px origin-left rtl:origin-right scale-x-0 bg-gradient-to-r rtl:bg-gradient-to-l from-signal-500 to-circuit-400 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
      />
    </article>
  );
}

export async function Brands() {
  const { brandGroups, altesseLines, mlayChannels, ui } = await content();

  const [professional, devices, skincare] = brandGroups;

  return (
    <section id="brands" className="relative bg-brand-50/60 py-24 md:py-32">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>{ui.sections.brands.eyebrow}</Eyebrow>
            </Reveal>
            <LineReveal
              as="h2"
              delay={90}
              className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-ink"
              lines={[
                ui.sections.brands.headlineLead,
                <span key="accent" className="text-brand-600">
                  {ui.sections.brands.headlineAccent}
                </span>,
              ]}
            />
          </div>
          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
{ui.sections.brands.intro}
            </p>
          </Reveal>
        </div>

        {/* 01 — Professional dermatology */}
        <div className="mt-16 md:mt-20">
          <Reveal>
            <div className="flex flex-col gap-3 border-t border-brand-200 pt-6 md:flex-row md:items-baseline md:justify-between">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="eyebrow text-signal-600">
                  {professional.kicker}
                </span>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {professional.title}
                </h3>
              </div>
              <p className="text-sm text-ink-soft">{professional.note}</p>
            </div>
          </Reveal>

          {/* Image, then the six plates two-up beside it. `items-stretch` is
              what lets the panel take its height from the cards rather than the
              other way round. */}
          <div className="mt-7 grid gap-4 lg:grid-cols-12 lg:items-stretch">
            <Reveal className="lg:col-span-4" from="left">
              <GroupMedia image={professional.image} className="h-full" />
            </Reveal>

            <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
              {professional.items.map((brand, i) => (
                <Reveal as="li" key={brand.name} delay={i * 70} from="scale">
                  <BrandPlate {...brand} />
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        {/* 02 — MLAY, with its real distribution footprint */}
        <div className="mt-14 md:mt-16">
          <Reveal>
            <div className="flex flex-col gap-3 border-t border-brand-200 pt-6 md:flex-row md:items-baseline md:justify-between">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="eyebrow text-signal-600">{devices.kicker}</span>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {devices.title}
                </h3>
              </div>
              <p className="text-sm text-ink-soft">{devices.note}</p>
            </div>
          </Reveal>

          <Reveal delay={90}>
            {/* The brand's own copy used to sit in a left cell of its own, with
                the channels in a right one. It now leads the right-hand side —
                logo, line, revenue, then the two channel lists under a rule —
                so the left cell is free for the picture and the reader meets
                the brand once rather than in two columns at the same time. */}
            <div className="mt-7 grid overflow-hidden rounded-3xl border border-brand-100 bg-white lg:grid-cols-5 lg:items-stretch">
              <GroupMedia
                image={devices.image}
                className="rounded-none border-0 border-b border-brand-100 lg:col-span-2 lg:border-e lg:border-b-0"
              />

              <div className="p-8 lg:col-span-3 lg:p-10">
                <div className="flex items-start justify-between gap-4">
                  <BrandLogo
                    name={devices.items[0].name}
                    className="h-9 max-w-[13rem]"
                  />
                  <span className="eyebrow shrink-0 pt-2 text-ink-faint">
                    {devices.items[0].origin}
                  </span>
                </div>

                <p className="mt-5 text-[0.975rem] leading-relaxed text-ink-soft">
                  {devices.items[0].role}
                </p>

                <p className="mt-5 font-display text-2xl font-semibold text-brand-600">
                  EGP 100M+
                  <span className="ms-2 align-middle text-sm font-medium text-ink-faint">
                    {ui.sections.brands.annualRevenue}
                  </span>
                </p>

                <div className="mt-8 grid gap-8 border-t border-brand-100 pt-8 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow text-ink-faint">
                      {ui.sections.flagshipBranches}
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {mlayChannels.flagship.map((mall) => (
                        <li
                          key={mall}
                          className="flex items-center gap-2.5 text-[0.9375rem] text-ink"
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-signal-500"
                          />
                          {mall}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow text-ink-faint">
                      {ui.sections.retailEcommerce}
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {mlayChannels.retail.map((channel) => (
                        <li
                          key={channel}
                          className="flex items-center gap-2.5 text-[0.9375rem] text-ink"
                        >
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 rounded-full bg-circuit-400"
                          />
                          {channel}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 03 — Altesse Soin, the owned brand */}
        <div className="mt-14 md:mt-16">
          <Reveal>
            <div className="flex flex-col gap-3 border-t border-brand-200 pt-6 md:flex-row md:items-baseline md:justify-between">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="eyebrow text-signal-600">
                  {skincare.kicker}
                </span>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {skincare.title}
                </h3>
              </div>
              <p className="text-sm text-ink-soft">{skincare.note}</p>
            </div>
          </Reveal>

          <Reveal delay={90}>
            {/* Same move as MLAY above: the picture takes the left cell and the
                brand's own copy leads the right, above its lines. The panel
                keeps its own padding off so the image can meet the rounded
                edge; the copy carries the inset instead. */}
            <div className="relative mt-7 grid overflow-hidden rounded-3xl border border-brand-800/20 bg-brand-900 lg:grid-cols-5 lg:items-stretch">
              <GroupMedia
                image={skincare.image}
                className="rounded-none border-0 border-b border-white/10 bg-brand-800 lg:col-span-2 lg:border-e lg:border-b-0"
              />

              <div className="p-8 lg:col-span-3 md:p-10">
                {/* Deep-teal ground, so this one takes the knocked-out variant */}
                <BrandLogo
                  name={skincare.items[0].name}
                  onDark
                  className="h-11 max-w-[14rem]"
                />
                <p className="mt-5 text-[0.975rem] leading-relaxed text-brand-100/80">
                  {skincare.items[0].role}
                </p>
                <p className="eyebrow mt-6 inline-flex rounded-xl border border-signal-500/50 px-3 py-1.5 text-signal-400">
                  {ui.sections.brands.flagshipBrand}
                </p>

                <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
                  {altesseLines.map((line) => (
                    <li
                      key={line.name}
                      className="bg-brand-900 p-5 transition-colors duration-300 hover:bg-brand-800"
                    >
                      <p className="font-display text-lg font-medium text-white">
                        {line.name}
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] leading-snug text-brand-200/80">
                        {line.role}
                      </p>
                    </li>
                  ))}
                  {/* Keeps the gap-grid from showing an empty cell on the 2- and 3-column steps (5 lines). */}
                  <li className="hidden bg-brand-900 sm:block" />
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

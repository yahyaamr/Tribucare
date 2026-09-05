import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal } from "@/components/site/reveal";
import { LanyardCanvas } from "@/components/brand/lanyard-canvas";
import { EventCarousel } from "@/components/events/event-carousel";
import { content, currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";

export async function Why() {
  const { events, ui } = await content();
  const locale = await currentLocale();

  return (
    <section
      id="events"
      className="ground-deep relative isolate overflow-hidden py-24 md:py-32 lg:py-40"
    >
      {/* Decorative background T vector shape */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -top-24 -z-10 w-[700px] sm:w-[950px] lg:w-[1200px] select-none text-brand-200/10 opacity-70"
      >
        <svg
          width="970"
          height="1104"
          viewBox="0 0 970 1104"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full"
        >
          <path
            d="M440.226 94.7334L438.247 94.7109C385.967 94.132 332.661 94.6399 280.354 94.6377H280.354L104.095 94.7471L102.149 94.748L102.097 96.6934C101.744 109.806 101.972 124.2 102.032 137.655L102.046 143.358L102.045 145.306L103.992 145.357C132.068 146.11 162.887 145.503 191.171 145.503L389.811 145.583L388.911 727.405V727.407L388.737 935.274C388.712 971.107 389.14 1008.07 388.559 1043.82C377.464 1037.9 365.644 1030.94 354.71 1024.76L289.8 988.116L289.832 470.104L289.835 316.224L289.882 265.883L289.881 265.882C289.896 264.312 289.814 260.693 289.756 257.302C289.698 253.978 289.671 251.02 289.739 250.012C289.926 249.37 290.009 248.622 290.055 247.959C290.11 247.12 290.124 246.171 290.117 245.243C290.11 244.31 290.083 243.366 290.057 242.535C290.03 241.688 290.005 240.985 290 240.48L289.98 238.521L288.021 238.5L278.981 238.412C186.273 237.587 94.8193 239.048 2 238.498L2.05859 2.41406C19.6147 2.09816 38.0049 2.36537 55.6201 2.36426L157.936 2.36035H467.479L797.471 2.35449C853.36 2.35449 911.639 1.49105 967.365 2.46191C967.691 35.355 967.386 68.77 967.392 101.719L967.32 241.417C936.83 242.069 904.149 241.439 873.373 241.439L682.664 241.462H680.778L680.668 243.344C680.162 251.935 680.505 263.257 680.505 271.953V271.954L680.521 324.924V487.799L680.499 990.881C669.896 997.633 656.3 1005.1 645.231 1011.56L580.351 1049.44L580.291 506.639L580.285 269.628C580.28 228.58 579.838 186.598 580.36 145.662C612.177 145.009 646.471 145.618 678.465 145.618L872.32 145.625H874.268L874.319 143.678C874.695 129.486 874.442 114.295 874.447 100.114V98.1553L872.49 98.1133C853.31 97.702 833.178 97.9803 813.978 97.9775L709.687 97.9717C652.705 97.9706 592.727 97.0451 535.877 98.1426L533.964 98.1797L533.916 100.092C533.394 120.917 533.863 143.522 533.862 164.441L533.86 289.574L533.861 665.915L533.799 1069.53L486.587 1100.71L440.286 1071.64C439.403 1036.52 440.213 997.409 440.214 961.902L440.224 745.992L440.225 96.7109L440.226 94.7334Z"
            stroke="currentColor"
            strokeWidth="6"
            fill="currentColor"
            fillOpacity="0.04"
          />
        </svg>
      </div>

      {/* Draggable 3D lanyard in the background on desktop */}
      <div className="max-lg:hidden absolute inset-0 z-0">
        <LanyardCanvas enableQuery="(min-width: 1024px)" />
      </div>

      {/* Above the canvas, but transparent to the pointer so a drag reaches the
          card wherever it has floated to. The interactive children take their
          own events back below. */}
      <Shell className="pointer-events-none relative z-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <Eyebrow tone="light">{events.eyebrow}</Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(2.125rem,4.6vw,3.5rem)] font-semibold leading-[1.03] tracking-[-0.025em] text-white text-balance">
              {events.headlineLead}{" "}
              <span className="text-brand-300">{events.headlineAccent}</span>
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={100} from="right">
            <p className="text-[1.0625rem] leading-relaxed text-brand-100/80">
              {events.intro}
            </p>
          </Reveal>
        </div>

        {/* 2-column layout on desktop: Left holds the 3D lanyard, Right holds the event carousel */}
        <div className="mt-16 grid gap-10 lg:mt-30 lg:grid-cols-2 lg:items-center">
          {/* Left column in tablet landscape */}
          <div className="pointer-events-auto hidden h-[40rem] [@media(orientation:landscape)_and_(min-height:600px)_and_(max-width:1023px)]:block">
            <LanyardCanvas enableQuery="(orientation: landscape) and (min-height: 600px) and (max-width: 1023px)" />
          </div>

          {/* Holds the left column open on desktop for the 3D lanyard */}
          <div aria-hidden="true" className="hidden lg:block h-[34rem] lg:h-[40rem]" />

          {/* Right column: one event at a time, stepped with arrows */}
          <Reveal
            from="scale"
            delay={80}
            className="pointer-events-auto relative min-w-0 w-full max-w-[28.5rem] mx-auto lg:mx-0 lg:max-w-[28rem] xl:max-w-[29rem] lg:justify-self-center lg:-translate-x-6 xl:-translate-x-10 rtl:lg:translate-x-6 rtl:xl:translate-x-10"
          >
            <EventCarousel
              items={events.items}
              labels={ui.events}
              href={localePath(locale, events.cta.href)}
            />

            {/* Centred on the card above it rather than on the section: the
                column is offset left of centre to clear the lanyard, and a
                button centred on the section would sit off its own card. */}
            <div className="mt-8 flex justify-center">
              <Link
                href={localePath(locale, events.cta.href)}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-[0.95rem] font-semibold text-brand-800 transition-[background-color,box-shadow] duration-300 hover:bg-brand-50 hover:shadow-[0_18px_40px_-18px_rgb(76_201_222/0.7)]"
              >
                {events.cta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>

        </div>
      </Shell>
    </section>
  );
}

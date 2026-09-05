import { ArrowRight } from "lucide-react";
import { Shell, Eyebrow } from "@/components/site/shell";
import { Reveal } from "@/components/site/reveal";
import { WaveField } from "@/components/brand/wave-field";
import { Footer } from "@/components/sections/footer";
import { content, currentLocale } from "@/content/server";
import { localePath } from "@/lib/i18n/config";

export async function Partner() {
  const { partner, footerNav, contact, company, ui } = await content();
  const locale = await currentLocale();

  return (
    <section
      id="partner"
      className="ground-deep relative isolate overflow-hidden pt-24 pb-0 md:pt-32"
    >
      <WaveField
        tone="dark"
        lines={28}
        className="absolute left-0 bottom-0 h-full w-[200%] opacity-35 pointer-events-none"
      />

      <Shell className="relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <Eyebrow tone="light" className="justify-center">
              {partner.eyebrow}
            </Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="mt-7 font-display text-[clamp(2.25rem,5.4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white text-balance">
              {partner.headline}
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p className="mx-auto mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-brand-100/80 md:text-lg">
              {partner.body}
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={localePath(locale, partner.primaryCta.href)}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-[0.95rem] font-semibold text-brand-800 transition-[background-color,box-shadow] duration-300 hover:bg-brand-50 hover:shadow-[0_18px_44px_-18px_rgb(76_201_222/0.75)]"
              >
                {partner.primaryCta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <a
                href={localePath(locale, partner.secondaryCta.href)}
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-[0.95rem] font-semibold text-white ring-1 ring-inset ring-white/25 transition-colors duration-300 hover:bg-white/10 hover:ring-white/40"
              >
                {partner.secondaryCta.label}
              </a>
            </div>
          </Reveal>

          <Reveal delay={290}>
            <ul className="mt-14 flex flex-wrap justify-center gap-x-2.5 gap-y-2.5 border-t border-white/10 pt-8">
              {partner.audiences.map((audience) => (
                <li
                  key={audience}
                  className="rounded-xl border border-white/15 px-4 py-2 text-[0.8125rem] font-medium text-brand-100 transition-colors duration-300 hover:border-signal-500/60 hover:text-white"
                >
                  {audience}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Shell>

      <Footer
        embedded
        locale={locale}
        footerNav={footerNav}
        contact={contact}
        company={company}
        ui={ui.footer}
      />
    </section>
  );
}

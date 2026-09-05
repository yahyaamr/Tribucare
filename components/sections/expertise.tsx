import { content, currentLocale } from "@/content/server";
import { ExpertiseView } from "@/components/sections/expertise-view";

/**
 * Server wrapper for the Expertise section.
 *
 * The section itself is a client component — it drives a sticky card stack —
 * and a client component cannot read the locale, which lives in a root
 * parameter. This reads the content and hands it down, so `app/[lang]/page.tsx`
 * keeps its shape as an ordered list of `<Section />` calls with no props, as
 * AGENTS.md requires.
 */
export async function Expertise() {
  const { verticals, brandLogos, ui } = await content();
  const locale = await currentLocale();
  return <ExpertiseView
      verticals={verticals}
      brandLogos={brandLogos}
      ui={ui.sections.expertise}
      locale={locale}
    />;
}

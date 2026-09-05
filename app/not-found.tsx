import type { Metadata, Viewport } from "next";
import { SiteDocument } from "@/components/site/site-document";
import { NotFoundView } from "@/components/site/not-found-view";
import { getContent } from "@/content";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/site";

/**
 * The app-level 404.
 *
 * Both root layouts live inside route groups, so the app root has none, and a
 * request that matches neither group renders this with no layout around it —
 * which is why it renders the whole document itself, through the same
 * component the site's layout uses. It is reached only by paths the proxy does
 * not localise: anything with a file extension (`/old-brochure.pdf`), or a
 * `[lang]` segment that is not a real locale. Everything else 404s inside
 * `[lang]` in the visitor's own language.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: getContent(DEFAULT_LOCALE).company.name,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#073c3c",
  colorScheme: "light",
};

export default function RootNotFound() {
  return (
    <SiteDocument locale={DEFAULT_LOCALE}>
      <NotFoundView locale={DEFAULT_LOCALE} />
    </SiteDocument>
  );
}

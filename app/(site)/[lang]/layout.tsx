import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { SiteDocument } from "@/components/site/site-document";
import { getContent } from "@/content";
import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_LOCALE, LOCALES, isLocale } from "@/lib/i18n/config";

/**
 * The public site's root layout.
 *
 * `[lang]` sits above it so the locale is a *root parameter*, readable from any
 * server component through `next/root-params` without threading a prop through
 * every section — which matters here because sections take no props by
 * convention. See
 * node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md
 *
 * The admin panel has its own root layout under `app/(admin)/`, since it is not
 * localised by URL and must not inherit the site's chrome.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

/**
 * Search Console and Bing Webmaster verification tokens, read from the
 * environment so the codebase carries no account-specific values. Each tag is
 * emitted only when its variable is set.
 */
function verification(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await lang()) ?? DEFAULT_LOCALE;
  if (!isLocale(locale)) return {};

  const { company, meta } = getContent(locale);

  return {
    metadataBase: new URL(siteUrl),
    applicationName: company.name,
    keywords: [...meta.keywords],
    authors: [{ name: company.name }],
    creator: company.name,
    publisher: company.name,
    category: meta.category,
    // Description, Open Graph, Twitter and alternates for the homepage. Pages
    // override these keys with their own through the same helper.
    ...pageMetadata({
      locale,
      path: "/",
      title: meta.title,
      description: company.description,
      ogTitle: meta.ogTitle,
    }),
    // After the spread, so the template object wins over the helper's plain
    // string: pages set a bare title and this suffixes the company name.
    title: { default: meta.title, template: `%s | ${company.name}` },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
      apple: [{ url: "/apple-icon.png" }],
    },
    manifest: "/manifest.webmanifest",
    verification: verification(),
  };
}

export const viewport: Viewport = {
  themeColor: "#073c3c",
  colorScheme: "light",
};

export default async function SiteRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await lang()) ?? DEFAULT_LOCALE;
  // `[lang]` matches any segment, so anything that is not a real locale — a
  // mistyped path, a crawler guessing — has to 404 rather than render the site
  // with a broken language.
  if (!isLocale(locale)) notFound();

  // The document itself — html, body, header, footer, structured data — is
  // shared with app/not-found.tsx; see components/site/site-document.tsx.
  return <SiteDocument locale={locale}>{children}</SiteDocument>;
}

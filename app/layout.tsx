import type { Metadata, Viewport } from "next";
import { Outfit, Figtree, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/site/nav";
import { Footer } from "@/components/sections/footer";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { company, brandGroups } from "@/content/site";
import { siteUrl, isSiteUrlConfigured } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "TribuCare — Healthcare & Beauty Group | Dermatology, Beauty Tech & Skincare",
    template: "%s | TribuCare",
  },
  description: company.description,
  applicationName: company.name,
  keywords: [
    "TribuCare",
    "healthcare and beauty company",
    "professional dermatology solutions",
    "medical aesthetics Egypt",
    "home-use beauty devices",
    "beauty technology MENA",
    "medicated skincare",
    "Altesse Soin",
    "MLAY Egypt",
  ],
  authors: [{ name: company.name }],
  category: "Healthcare & Beauty",
  openGraph: {
    type: "website",
    siteName: company.name,
    title: "TribuCare — Advancing beauty. Empowering care.",
    description: company.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TribuCare — Advancing beauty. Empowering care.",
    description: company.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#073c3c",
  colorScheme: "light",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.name,
  description: company.description,
  ...(isSiteUrlConfigured ? { url: siteUrl } : {}),
  parentOrganization: {
    "@type": "Organization",
    name: "Mondial Investissement Corporation",
    alternateName: "MIC",
  },
  areaServed: [
    { "@type": "Country", name: "Egypt" },
    { "@type": "Place", name: "MENA region" },
  ],
  knowsAbout: [
    "Professional dermatology solutions",
    "Medical aesthetics",
    "Home-use beauty devices",
    "Medicated skincare",
    "Beauty technology",
  ],
  brand: brandGroups.flatMap((group) =>
    group.items.map((item) => ({ "@type": "Brand", name: item.name })),
  ),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Scroll-reveal is CSS-hidden by default so there is no flash on load;
            without JavaScript this restores it. Raw HTML so React doesn't hoist
            the <style> out of the <noscript>. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<style>[data-reveal="pending"],[data-reveal="pending"]>*{opacity:1!important;transform:none!important}</style>',
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-brand-800 focus:shadow-lg"
        >
          Skip to content
        </a>

        {/* Wraps the header and footer too, so both can read scroll position
            from the same Lenis instance the page is eased by. */}
        <SmoothScroll>
          <SiteNav />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}

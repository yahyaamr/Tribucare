import type { Metadata, Viewport } from "next";
import { fontClassNames } from "@/lib/fonts";
import { siteUrl } from "@/lib/site";
import "../globals.css";

/**
 * The admin panel's root layout.
 *
 * Separate from the site's because the panel is not localised by URL — it sits
 * at `/admin` in both languages and switches with a control of its own — and
 * because it must not inherit the marketing header, footer or Lenis.
 *
 * `dir` is set per-render by the panel itself rather than here: the language
 * choice is a cookie, not a path segment.
 */

export const metadata: Metadata = {
  // The root `opengraph-image` attaches to these routes too, and resolving
  // its URL without a base is a build warning on every deploy.
  metadataBase: new URL(siteUrl),
  title: { default: "Blog Admin", template: "%s · Blog Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#042726",
  colorScheme: "light",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontClassNames} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

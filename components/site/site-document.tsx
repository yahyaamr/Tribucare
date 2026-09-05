import { SiteNav } from "@/components/site/nav";
import { Footer } from "@/components/sections/footer";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { JsonLd } from "@/components/site/json-ld";
import { getContent } from "@/content";
import { fontClassNames } from "@/lib/fonts";
import { directionOf, type Locale } from "@/lib/i18n/config";
import { organizationSchema, webSiteSchema } from "@/lib/seo";
import "@/app/globals.css";

/**
 * The public site's document: `<html>` through `</html>`, with the header,
 * footer, smooth scroll and site-wide structured data around `children`.
 *
 * Shared by the `[lang]` root layout and by the app-level `not-found.tsx`. The
 * site's root layouts live inside route groups, so a path that never reaches
 * `[lang]` — anything with a file extension, which the proxy leaves alone —
 * falls to an app-level 404 that has to render its own `<html>`. Rendering it
 * through this component keeps that page identical to every other.
 */
export function SiteDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { company, ui, nav, footerNav, contact } = getContent(locale);

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${fontClassNames} h-full antialiased`}
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
        {/* The two site-wide entities. Pages add their own — Article, Product,
            BreadcrumbList — and point back at the Organization by `@id`. */}
        <JsonLd data={organizationSchema(locale)} />
        <JsonLd data={webSiteSchema(locale)} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-100 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-brand-800 focus:shadow-lg"
        >
          {ui.skipToContent}
        </a>

        {/* Wraps the header and footer too, so both can read scroll position
            from the same Lenis instance the page is eased by. */}
        <SmoothScroll>
          <SiteNav locale={locale} nav={nav} ui={ui} />
          <main id="main">{children}</main>
          <Footer
            locale={locale}
            footerNav={footerNav}
            contact={contact}
            company={company}
            ui={ui.footer}
          />
        </SmoothScroll>
      </body>
    </html>
  );
}

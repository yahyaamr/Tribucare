import Script from "next/script";

/** Google Analytics 4 property, supplied by the SEO team. Public by design —
 *  it is in every page's source wherever GA runs. */
const GA_MEASUREMENT_ID = "G-HY0LM8PWKL";

/**
 * Google's gtag.js snippet, as next/script rather than raw `<script>` tags.
 *
 * `afterInteractive` fetches it once the page has hydrated — the same timing
 * the snippet's own `async` gives, and what `@next/third-parties` does — so it
 * never competes with the page's own first paint. Client-side navigations are
 * still counted: GA4's enhanced measurement records history changes by
 * default, so there is no route listener to maintain here.
 *
 * Mounted from <SiteDocument> only, so the public pages are measured and the
 * panel is not. Production only: localhost and Vercel preview deployments
 * would otherwise land in the same property as real visitors.
 */
export function Analytics() {
  const vercelEnv = process.env.VERCEL_ENV;
  const isProduction = vercelEnv
    ? vercelEnv === "production"
    : process.env.NODE_ENV === "production";
  if (!isProduction) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}

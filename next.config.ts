import type { NextConfig } from "next";

/**
 * Response headers every route carries.
 *
 * The set Lighthouse and the usual scanners look for, minus a Content Security
 * Policy: Next's own inline scripts and the JSON-LD blocks would need a
 * per-request nonce, which means moving rendering off the static path for
 * every page. That trade is not worth making for a marketing site with no
 * third-party scripts; the headers below cover clickjacking, MIME sniffing,
 * referrer leakage and window-opener isolation without touching rendering.
 *
 * HSTS is what Vercel already sends; restating it here keeps the behaviour
 * when the site is hosted anywhere else, and adds `includeSubDomains` so a
 * stray http:// subdomain cannot downgrade the session.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // The default `X-Powered-By: Next.js` header advertises the framework to
  // anyone probing the site and helps nobody.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  experimental: {
    // Tailwind keeps the whole stylesheet under 20KB, so shipping it inline in
    // the document beats a separate render-blocking request: the page can paint
    // as soon as the HTML arrives instead of after a second round trip. That
    // round trip was the largest avoidable share of LCP on a throttled phone.
    // Returning visitors lose a cached stylesheet, but a marketing site's
    // traffic is mostly first visits from search and social.
    inlineCss: true,
  },

  images: {
    // Next only negotiates WebP by default. AVIF is listed first so browsers
    // that advertise it get it — it lands roughly 20-30% under WebP on the
    // large photographic art here, which is most of the page's image weight.
    // Anything that cannot take AVIF still falls back through this list.
    formats: ["image/avif", "image/webp"],
    // These are content images, not user uploads: they only change on deploy,
    // so re-optimising them every 4 hours (the default) buys nothing.
    minimumCacheTTL: 2678400, // 31 days
    // Author avatars in content/blogs.ts are hosted on Unsplash. Allowing the
    // host here lets them go through next/image (resizing, modern formats,
    // lazy loading) instead of raw <img> tags.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Images uploaded through the blog admin land in Vercel Blob, which
      // serves them from a per-store subdomain. Without this next/image
      // refuses every cover image the SEO team uploads.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

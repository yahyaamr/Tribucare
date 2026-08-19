/**
 * Canonical origin for every absolute URL the site emits — `metadataBase`,
 * the sitemap, robots.txt and the Organization JSON-LD.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL` — set this once the production domain is confirmed.
 *   2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's *production* hostname. Using
 *      it rather than `VERCEL_URL` means preview deploys still point crawlers
 *      at the real domain instead of a throwaway deployment URL.
 *   3. localhost, so `next dev` and local builds resolve to something valid.
 *
 * `isSiteUrlConfigured` separates a real domain from that localhost fallback.
 * Absolute URLs that are merely internal plumbing (metadataBase, which only
 * ever resolves relative paths) can use the fallback safely; claims published
 * as fact — the JSON-LD `url` — stay conditional on it, so an unconfigured
 * deploy omits the field rather than advertising an address nobody can reach.
 */

function resolveSiteUrl(): { url: string; configured: boolean } {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return { url: normalizeOrigin(explicit), configured: true };

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return { url: normalizeOrigin(vercel), configured: true };

  return { url: "http://localhost:3000", configured: false };
}

/** Accepts `example.com`, `https://example.com` or `https://example.com/`. */
function normalizeOrigin(value: string): string {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

const resolved = resolveSiteUrl();

export const siteUrl = resolved.url;
export const isSiteUrlConfigured = resolved.configured;

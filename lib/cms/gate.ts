/**
 * The knock gate — the panel's outer door, in front of the password.
 *
 * `ADMIN_PATH` names a secret URL. Visiting it sets a signed cookie and
 * nothing else; from then on `/admin` behaves normally for that browser, and
 * for everybody else `/admin` and `/api/admin/*` answer with the site's own
 * 404. Not a redirect and not a 401 — either of those confirms a panel is
 * there, which is the thing being hidden.
 *
 * This is obscurity, and obscurity is a layer rather than a lock: anyone who
 * sees the URL once keeps it. What it buys is that the scanners which sweep
 * every site for `/admin` find nothing to attack, so the shared password is
 * never reached by a drive-by. The password is still what stops a person who
 * has the URL.
 *
 * Unset `ADMIN_PATH` and the gate is simply off — `/admin` is reachable and
 * the password guards it as before. Failing open is deliberate: a missing env
 * var should not lock the SEO team out of their own site, and the credential
 * behind it has not moved.
 *
 * The cookie carries a hash rather than the path, so a cookie jar read off a
 * shared machine does not hand over the URL itself. Web Crypto rather than
 * `node:crypto` because `proxy.ts` runs without the Node runtime.
 */

export const KNOCK_COOKIE = "tribucare_gate";

const KNOCK_DAYS = 365;

/** The secret first segment, normalised without slashes. Empty means off. */
export function knockPath() {
  return (process.env.ADMIN_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
}

export function isGateEnabled() {
  return knockPath().length > 0;
}

export async function knockToken() {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`tribucare-gate:${knockPath()}`),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time over two hex digests of equal width. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function hasKnocked(value: string | undefined) {
  if (!isGateEnabled()) return true;
  if (!value) return false;
  return safeEqual(value, await knockToken());
}

export const knockCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: KNOCK_DAYS * 24 * 60 * 60,
};

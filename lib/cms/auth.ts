/**
 * Admin authentication: one shared password for the whole SEO team.
 *
 * The session cookie is `<expiry>.<hmac>`, signed with a key derived from the
 * password itself unless `ADMIN_SESSION_SECRET` is set. Signing matters — a
 * plain `admin=1` cookie is forgeable by anyone who thinks to try it, which
 * would make the password decorative.
 *
 * Written against Web Crypto rather than `node:crypto` so the same code runs
 * unchanged in `proxy.ts`, which does not get the Node runtime.
 *
 * Because the password is shared, changing it signs everyone out at once (the
 * derived key changes, so every outstanding cookie stops verifying). That is
 * the intended behaviour for a shared credential: it is the only way to revoke
 * access from someone who has left.
 */

export const SESSION_COOKIE = "tribucare_admin";
const SESSION_DAYS = 7;

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAuthConfigured() {
  return getAdminPassword().length > 0;
}

async function signingKey() {
  const secret =
    process.env.ADMIN_SESSION_SECRET || `tribucare:${getAdminPassword()}`;
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(payload: string) {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(),
    new TextEncoder().encode(payload),
  );
  return [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time comparison of two equal-length strings. Callers only ever
 *  hand it hex digests, which are fixed width, so the early length return
 *  cannot leak anything about a secret. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionValue() {
  const expiry = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return `${expiry}.${await sign(expiry)}`;
}

export async function isValidSessionValue(value: string | undefined) {
  // No password configured means no way to authenticate — deny rather than
  // fall open, so a missing env var cannot silently publish the admin panel.
  if (!value || !isAuthConfigured()) return false;

  const [expiry, signature] = value.split(".");
  if (!expiry || !signature) return false;

  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return safeEqual(signature, await sign(expiry));
}

/** Compares digests rather than the passwords themselves, so neither the
 *  content nor the *length* of the real password is observable through timing
 *  or through a length-mismatch shortcut. */
export async function verifyPassword(candidate: string) {
  const expected = getAdminPassword();
  if (!expected) return false;
  const [a, b] = await Promise.all([sign(candidate), sign(expected)]);
  return safeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  // Vercel always serves HTTPS; locally it would make the cookie undeliverable.
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
};

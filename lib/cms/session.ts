import { cookies } from "next/headers";
import { SESSION_COOKIE, isValidSessionValue } from "./auth";

/**
 * The real authorisation check, as opposed to the redirect in `proxy.ts`.
 *
 * Every admin page and every admin route handler calls this. `cookies()` is
 * async in Next 16 — synchronous access was removed, not just deprecated.
 */
export async function hasSession() {
  const store = await cookies();
  return isValidSessionValue(store.get(SESSION_COOKIE)?.value);
}

/** For route handlers: returns a 401 body to hand straight back, or null when
 *  the caller is allowed through. */
export async function requireSession() {
  if (await hasSession()) return null;
  return Response.json(
    { error: "Not signed in." },
    { status: 401, headers: { "cache-control": "no-store" } },
  );
}

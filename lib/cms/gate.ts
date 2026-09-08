/**
 * Where the admin panel is mounted.
 *
 * The routes live at `app/(admin)/admin/` and the API at `app/api/admin/`, but
 * those are internal addresses that nothing is ever served at. `ADMIN_PATH`
 * names the secret segment the panel is actually reached through, and
 * `proxy.ts` rewrites it onto the internal tree:
 *
 *     /<secret>            →  /admin
 *     /<secret>/posts      →  /admin/posts
 *     /<secret>/api/posts  →  /api/admin/posts
 *
 * A direct request to `/admin` or `/api/admin/*` answers with the site's own
 * 404 — not a redirect and not a 401, either of which confirms a panel is
 * there. Scanners sweeping for `/admin` find an ordinary missing page.
 *
 * This is obscurity, and obscurity is a layer rather than a lock: the secret
 * now sits in the URL bar, in browser history and in any screenshot of the
 * panel, so treat it as discoverable and let the password do the real work.
 * What it buys is that the password is never *reached* by a drive-by.
 *
 * Unset `ADMIN_PATH` and the base falls back to `/admin`, which is how local
 * development runs. Falling back rather than sealing shut is deliberate: a
 * missing env var should not lock the SEO team out of their own site, and the
 * credential behind it has not moved.
 *
 * `adminBase()` reads the environment and is therefore server-only. Client
 * components must not import it — a non-`NEXT_PUBLIC_` variable is `undefined`
 * in the browser bundle, so it would silently resolve to `/admin` and every
 * link would 404. They take the base from `useAdminBase()` instead, which the
 * panel layout hands down. That indirection is also what keeps the secret out
 * of the public site's JavaScript.
 */

const INTERNAL = "/admin";

export function adminBase() {
  const configured = (process.env.ADMIN_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
  return configured ? `/${configured}` : INTERNAL;
}

/** True once the panel has been moved off its internal address. */
export function isGateEnabled() {
  return adminBase() !== INTERNAL;
}

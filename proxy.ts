import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  createSessionValue,
  isValidSessionValue,
  sessionCookieOptions,
} from "@/lib/cms/auth";
import { adminBase, isGateEnabled } from "@/lib/cms/gate";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

/**
 * Two jobs, in this order: locale routing for the public site, and the gate in
 * front of the admin panel.
 *
 * In Next 16 this file is `proxy.ts` — the `middleware.ts` convention was
 * renamed (see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 *
 * ## Locale routing
 *
 * Both languages are served by one route tree at `app/(site)/[lang]/`, but only
 * Arabic carries a prefix in the URL. English keeps the paths it already has —
 * `/dermatology`, `/blogs/…` — because those are what is indexed and linked, and
 * moving them would forfeit that for nothing.
 *
 * So `/dermatology` is rewritten (invisibly) onto `/en/dermatology`, while
 * `/ar/dermatology` passes straight through. `/en/…` is redirected back to the
 * bare path: it resolves through the same tree, and leaving it reachable would
 * publish every English page at two URLs.
 */

const PUBLIC_FILE = /\.[^/]+$/;

/** Route-handler and metadata paths that are not localised pages. */
const NOT_LOCALISED = [
  "/api",
  "/admin",
  "/_next",
  "/opengraph-image",
  "/icon",
  "/apple-icon",
  "/sitemap.xml",
  "/robots.txt",
];

/**
 * What an un-knocked visitor gets: the site's own 404, at a real 404 status.
 *
 * Rewritten onto the locale catch-all rather than answered here, so the page is
 * byte-for-byte the one any other bad URL produces. A bespoke response — even a
 * plausible-looking one — is a tell, because it differs from the 404 next door.
 */
/**
 * What a request to the panel's internal address gets: the site's own 404, at a
 * real 404 status.
 *
 * Rewritten onto the locale catch-all rather than answered here, so the page is
 * the one any other bad URL produces. A bespoke response — even a plausible
 * one — is a tell, because it differs from the 404 next door.
 */
function notFound(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${request.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

/** Serves an internal admin path, re-issuing the session so the idle window
 *  slides while somebody is actually working. */
async function serve(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.rewrite(url);
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionValue(),
    sessionCookieOptions,
  );
  return response;
}

/**
 * The panel, reached through the secret base.
 *
 * `rest` is what followed it: "" for the dashboard, "/posts", "/login". Every
 * redirect is written back in terms of the public base, every rewrite in terms
 * of the internal one — mixing the two is how the secret leaks into a Location
 * header or how a link lands on a 404.
 */
async function adminGate(request: NextRequest, base: string, rest: string) {
  const { search } = request.nextUrl;

  const authed = await isValidSessionValue(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (rest === "/login") {
    if (!authed) return NextResponse.rewrite(pathUrl(request, "/admin/login"));
    return NextResponse.redirect(new URL(`${base}/posts`, request.url));
  }

  if (authed) return serve(request, `/admin${rest}`);

  const login = new URL(`${base}/login`, request.url);
  // Round-trips the requested page so a deep link survives the sign-in.
  login.searchParams.set("from", `${rest}${search}`);
  return NextResponse.redirect(login);
}

function pathUrl(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return url;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const base = adminBase();
  const gated = isGateEnabled();

  // The internal addresses, sealed. Nothing is ever served at them once the
  // panel has been mounted elsewhere — not a redirect to the real path, which
  // would hand the secret to whoever guessed `/admin`.
  if (gated && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return notFound(request);
  }
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    // A bare 404 rather than the 401 the handlers would give: `/api/admin/login`
    // answering at all tells a prober there is a panel to attack.
    if (gated) return new NextResponse(null, { status: 404 });
    return NextResponse.next();
  }

  // The panel, at the secret base.
  if (pathname === base || pathname.startsWith(`${base}/`)) {
    const rest = pathname.slice(base.length);

    // Its API lives under the same segment, so there is one secret rather than
    // two and no guessable URL left over.
    if (rest === "/api" || rest.startsWith("/api/")) {
      const target = `/api/admin${rest.slice(4)}`;
      const authed = await isValidSessionValue(
        request.cookies.get(SESSION_COOKIE)?.value,
      );
      // The handlers guard themselves with `requireSession`, so an
      // unauthenticated call is simply passed through to be refused. The proxy
      // only slides the idle window for someone who already has a session —
      // and must not, for the login route, which issues its own.
      return authed
        ? serve(request, target)
        : NextResponse.rewrite(pathUrl(request, target));
    }

    return adminGate(request, base, rest);
  }

  if (
    PUBLIC_FILE.test(pathname) ||
    NOT_LOCALISED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // `/en/anything` is the internal form leaking out. Send it to the canonical
  // bare path rather than serving the same page at a second URL.
  if (first === DEFAULT_LOCALE) {
    const rest = `/${segments.slice(1).join("/")}`;
    const url = request.nextUrl.clone();
    url.pathname = rest === "/" ? "/" : rest;
    // 308, not the default 307: the bare path is the permanent address, and a
    // permanent status is what lets a crawler consolidate the two.
    return NextResponse.redirect(url, 308);
  }

  // A real locale prefix — `/ar/…` — already matches the route tree.
  if (first && (LOCALES as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  // Everything else is English at its bare path. Rewrite, don't redirect: the
  // reader's URL has to stay as it is.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except Next internals and files with an extension. `/api` is
  // excluded — those handlers guard themselves with `requireSession` and must
  // answer with JSON rather than a redirect — with `/api/admin` added back so
  // the knock gate can hide it entirely from anyone who has not knocked.
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
    "/api/admin/:path*",
  ],
};

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSessionValue } from "@/lib/cms/auth";
import {
  KNOCK_COOKIE,
  hasKnocked,
  isGateEnabled,
  knockCookieOptions,
  knockPath,
  knockToken,
} from "@/lib/cms/gate";
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
 * `/dermatology`, `/blog/…` — because those are what is indexed and linked, and
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
function notFound(request: NextRequest) {
  const url = request.nextUrl.clone();
  // The requested path, moved under the default locale, where nothing matches
  // it and the catch-all throws. `/admin` is treated as exactly what it would
  // be if the panel did not exist: an unknown public URL.
  url.pathname = `/${DEFAULT_LOCALE}${request.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

async function adminGate(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Before anything else, including before admitting the panel exists.
  if (!(await hasKnocked(request.cookies.get(KNOCK_COOKIE)?.value))) {
    return notFound(request);
  }

  const authed = await isValidSessionValue(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (pathname === "/admin/login") {
    if (!authed) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/posts", request.url));
  }

  if (authed) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  // Round-trips the requested page so a deep link survives the sign-in.
  login.searchParams.set("from", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The knock. Sets the cookie and sends the visitor on to the panel — the
  // secret is spent here and never has to appear in the URL bar again.
  const secret = knockPath();
  if (secret && (pathname === `/${secret}` || pathname === `/${secret}/`)) {
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set(KNOCK_COOKIE, await knockToken(), knockCookieOptions);
    return response;
  }

  // The admin API is matched only so it can be hidden. A bare 404 rather than
  // the 401 the handlers would give: `/api/admin/login` answering at all is
  // enough to tell a prober there is a panel to attack.
  if (pathname.startsWith("/api/admin")) {
    if (isGateEnabled() && !(await hasKnocked(request.cookies.get(KNOCK_COOKIE)?.value))) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return adminGate(request);
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

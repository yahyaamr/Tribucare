import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSessionValue } from "@/lib/cms/auth";
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

async function adminGate(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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
  // Everything except Next internals and files with an extension. The admin API
  // guards itself and must answer with JSON rather than a redirect, so `/api`
  // is excluded here and handled by `requireSession` in each route.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

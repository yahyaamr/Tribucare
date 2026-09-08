"use client";

import { createContext, useCallback, useContext } from "react";

/**
 * The panel's base path, handed down from the server.
 *
 * Every link and every fetch inside the panel is written relative to this
 * rather than to a literal `/admin`, because `/admin` is sealed — the routes
 * are reached only through the secret segment named by `ADMIN_PATH`, and a
 * hardcoded path would land on the site's 404.
 *
 * It arrives as a prop from `(admin)/admin/layout.tsx` instead of being read
 * from the environment here. A client component cannot read `ADMIN_PATH` — it
 * is not `NEXT_PUBLIC_`, and making it public would inline the secret into the
 * JavaScript of every page on the marketing site, which is the one place it
 * must never appear. Passing it through the layout keeps it in the bundle that
 * only the panel loads.
 */

const AdminBaseContext = createContext("/admin");

export function AdminBaseProvider({
  base,
  children,
}: {
  base: string;
  children: React.ReactNode;
}) {
  return (
    <AdminBaseContext.Provider value={base}>{children}</AdminBaseContext.Provider>
  );
}

/** The base itself — `/tc-…`. Build page links as `` `${base}/posts` ``. */
export function useAdminBase() {
  return useContext(AdminBaseContext);
}

/**
 * Builds an admin API URL: `api("/posts")` → `/tc-…/api/posts`.
 *
 * The API is mounted under the same secret segment as the pages, so there is
 * one secret rather than two and nothing left at a guessable `/api/admin/*`.
 */
export function useAdminApi() {
  const base = useContext(AdminBaseContext);
  // Stable across renders so it can sit in an effect or callback dependency
  // list without re-firing the request on every keystroke.
  return useCallback((path: string) => `${base}/api${path}`, [base]);
}

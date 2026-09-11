"use client";

import { createContext, useContext } from "react";
import { adminStrings, type AdminStrings } from "@/lib/i18n/admin-strings";

/**
 * The panel's own strings, handed down from the server.
 *
 * Same shape as `base-path.tsx` next door, and for the same reason: the panel's
 * language is a cookie, only a server component can read it, and nearly every
 * screen in the panel is a client component. Prop-drilling the string bundle
 * through four editor levels would be noise at every call site.
 *
 * A server component inside the panel does not need this — it can call
 * `adminStrings(await adminLocale())` directly. This is for the client half.
 *
 * The default is English rather than a throw: a client component rendered
 * outside the provider (a test, a stray import) should render in English, not
 * crash.
 */

const AdminStringsContext = createContext<AdminStrings>(adminStrings("en"));

export function AdminStringsProvider({
  t,
  children,
}: {
  t: AdminStrings;
  children: React.ReactNode;
}) {
  return (
    <AdminStringsContext.Provider value={t}>
      {children}
    </AdminStringsContext.Provider>
  );
}

/** The whole bundle: `const t = useAdminStrings()`, then `t.posts.addNew`. */
export function useAdminStrings() {
  return useContext(AdminStringsContext);
}

/**
 * Substitutes `{name}` placeholders in a string.
 *
 * The panel has a handful of sentences that name the thing being acted on — a
 * delete confirmation, a row's screen-reader label. Splitting those into
 * fragments to concatenate around a value is what produces word order that is
 * right in English and wrong in Arabic, so the whole sentence stays one string
 * in each language and the value is substituted into it.
 */
export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

/**
 * The admin panel's language.
 *
 * Unlike the public site, the panel is not addressed per language — it lives at
 * `/admin` in both, and switching must not change the URL an editor has
 * bookmarked or is midway through using. So the choice is a cookie rather than
 * a path segment, set by the toggle in the admin bar and in Settings.
 *
 * That also means the panel's language is per person: one editor can work in
 * Arabic while another works in English, on the same posts.
 */

export const ADMIN_LOCALE_COOKIE = "tribucare_admin_lang";

export async function adminLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(ADMIN_LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

export const adminLocaleCookieOptions = {
  httpOnly: false,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 365 * 24 * 60 * 60,
};

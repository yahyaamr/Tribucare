/**
 * Locales.
 *
 * English keeps the URLs it already has — `/dermatology`, `/blog/…` — because
 * those are what is indexed and linked today, and moving them would cost the
 * site its rankings for nothing. Arabic is added alongside under `/ar/…`.
 *
 * Internally both are the same routes under `app/(site)/[lang]/`; `proxy.ts`
 * rewrites the unprefixed English paths onto `/en/…` so there is one set of
 * pages rather than two trees to keep in step.
 */

export const LOCALES = ["en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** `ltr` / `rtl`, used on `<html dir>`. */
export function directionOf(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** What each language calls itself — never "Arabic", always "العربية". */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

/** Short label for the compact nav toggle. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  ar: "ع",
};

/**
 * The public path for a locale.
 *
 * `/ar` prefixed, English bare. Used by the language switch and by every
 * internal link, so a link written once works in both languages.
 */
export function localePath(locale: Locale, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean === "/" ? "/" : clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/**
 * Strips a locale prefix off an incoming pathname.
 *
 * Returns the locale it found and the path without it, which is what the
 * language switch needs to send the reader to the same page in the other
 * language rather than back to the homepage.
 */
export function splitLocale(pathname: string): {
  locale: Locale;
  path: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && isLocale(first)) {
    const rest = `/${segments.slice(1).join("/")}`;
    return { locale: first, path: rest === "/" ? "/" : rest };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}

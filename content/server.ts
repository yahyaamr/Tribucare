import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import { getContent } from "./index";

/**
 * The current locale, read from the `[lang]` root parameter.
 *
 * `next/root-params` is what makes this possible without prop drilling: `[lang]`
 * sits above the site's root layout, so any server component can ask for it.
 * That matters here because sections take no props by convention — see
 * AGENTS.md — and threading a locale through every one of them would have
 * broken that rule across the whole codebase.
 *
 * Client components cannot call this (the docs are explicit), so they receive
 * what they need as props from their server parent.
 */
export async function currentLocale(): Promise<Locale> {
  const value = await lang();
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

/** The content bundle for the current request. */
export async function content() {
  return getContent(await currentLocale());
}

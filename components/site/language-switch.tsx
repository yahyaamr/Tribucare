"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LOCALE,
  LOCALE_SHORT,
  type Locale,
  localePath,
  splitLocale,
} from "@/lib/i18n/config";

/**
 * The language switch.
 *
 * A real `<Link>` rather than a button that swaps state, because the two
 * languages are two URLs: `/dermatology` and `/ar/dermatology`. That is what
 * lets Google index the Arabic site at all, and it means the switch is
 * middle-clickable, shareable and works without JavaScript.
 *
 * It stays on the current page rather than returning to the homepage — the
 * pathname is stripped of its locale prefix and re-prefixed with the other one.
 * Slugs are shared across locales (the Arabic bundle overrides copy, not URLs),
 * so the target always exists.
 */
export function LanguageSwitch({
  locale,
  label,
  className,
}: {
  locale: Locale;
  /** "Switch to Arabic" / "التبديل إلى الإنجليزية" — the accessible name. */
  label: string;
  className?: string;
}) {
  const pathname = usePathname() ?? "/";

  // `usePathname` reports the *rewritten* path under the proxy, so English
  // pages read as `/en/…` here even though the address bar shows `/…`.
  // Splitting handles both forms.
  const { path } = splitLocale(pathname);
  const other: Locale = locale === "ar" ? DEFAULT_LOCALE : "ar";

  return (
    <Link
      href={localePath(other, path)}
      // Always in view, rarely clicked: prefetching the other language's
      // payload cost every visitor ~110KB for a page most never open.
      prefetch={false}
      hrefLang={other}
      aria-label={label}
      title={label}
      className={cn(
        "group relative grid size-9 shrink-0 place-items-center rounded-lg text-brand-800 transition-colors duration-300 hover:bg-brand-50 focus-visible:bg-brand-50",
        className,
      )}
    >
      <span className="relative grid size-5 place-items-center">
        <Globe
          className="size-[1.125rem] transition-transform duration-500 group-hover:rotate-12"
          aria-hidden="true"
        />
      </span>
      {/* The target language's own name for itself, never a flag: Arabic is
          spoken across many countries and no flag stands for the language. */}
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 text-[0.5625rem] font-semibold text-brand-600"
      >
        {LOCALE_SHORT[other]}
      </span>
    </Link>
  );
}

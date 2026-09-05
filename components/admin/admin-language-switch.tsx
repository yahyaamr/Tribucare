"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALE_SHORT, type Locale } from "@/lib/i18n/config";

/**
 * The panel's language toggle.
 *
 * A button rather than a link, unlike the site's: the panel is one URL in both
 * languages, so switching is a cookie write followed by `router.refresh()` —
 * which re-renders the server components in the new language without leaving
 * the page or losing the editor's place.
 */
export function AdminLanguageSwitch({
  locale,
  label,
  variant = "bar",
  className,
}: {
  locale: Locale;
  label: string;
  /** "bar" is the compact icon in the admin bar; "full" is the labelled pair
   *  of buttons in Settings. */
  variant?: "bar" | "full";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  async function choose(next: Locale) {
    if (next === locale) return;
    setSaving(true);
    await fetch("/api/admin/language", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale: next }),
    }).catch(() => null);
    setSaving(false);
    startTransition(() => router.refresh());
  }

  const other: Locale = locale === "ar" ? "en" : "ar";
  const busy = saving || pending;

  if (variant === "full") {
    return (
      <div className={cn("flex gap-2", className)}>
        {(["en", "ar"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            disabled={busy}
            aria-pressed={locale === option}
            className={cn(
              "flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 disabled:opacity-60",
              locale === option
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-brand-200 text-ink-soft hover:bg-brand-50",
            )}
          >
            {option === "ar" ? "العربية" : "English"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => choose(other)}
      disabled={busy}
      aria-label={label}
      title={label}
      className={cn(
        "group relative grid size-8 place-items-center rounded-lg text-brand-200 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Globe className="size-4" aria-hidden="true" />
      )}
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 text-[0.5rem] font-semibold text-brand-300"
      >
        {LOCALE_SHORT[other]}
      </span>
    </button>
  );
}

"use client";

import { useAdminApi, useAdminBase } from "@/components/admin/base-path";
import { TAB_MARKER } from "@/components/admin/tab-session";
import type { AdminStrings } from "@/lib/i18n/admin-strings";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { TribuLogo } from "@/components/brand/logo";

export function LoginForm({
  configured,
  t,
}: {
  configured: boolean;
  t: AdminStrings["login"];
}) {
  const base = useAdminBase();
  const api = useAdminApi();
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /** Where the proxy sent them from. Only same-origin relative paths are
   *  honoured — an absolute URL here would be an open redirect. */
  const from = params.get("from");
  const next = from?.startsWith("/") && !from.startsWith("//") ? `${base}${from}` : base;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const response = await fetch(api("/login"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);

    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? t.failed);
      setBusy(false);
      return;
    }

    try {
      window.sessionStorage.setItem(TAB_MARKER, "1");
    } catch {
      // Storage unavailable (private mode); the guard no-ops to match.
    }

    router.replace(next);
    // The panel layout reads the cookie on the server, so the cached render
    // has to be dropped for the redirect to land anywhere but back here.
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center">
        <TribuLogo className="h-9 w-auto" tone="light" />
      </div>

      <div className="card-surface mt-8 p-7">
        <h1 className="font-display text-xl font-semibold text-ink">
          {t.title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          {t.intro}
        </p>

        {!configured ? (
          <p className="mt-6 rounded-xl border border-signal-500/40 bg-signal-500/10 p-4 text-sm leading-relaxed text-ink">
            {t.notConfigured.split("{env}").flatMap((part: string, i: number) =>
              i === 0
                ? [part]
                : [
                    <code key="env" className="font-mono text-xs">
                      ADMIN_PASSWORD
                    </code>,
                    part,
                  ],
            )}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6">
            <label
              htmlFor="admin-password"
              className="text-xs font-semibold tracking-wide text-ink uppercase"
            >
              {t.password}
            </label>
            <div className="relative mt-2">
              <KeyRound
                className="absolute top-1/2 start-3.5 size-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                id="admin-password"
                type="password"
                required
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-brand-200/80 bg-white py-2.5 pe-4 ps-10 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-faint focus:border-brand-600 focus:outline-none"
                placeholder={t.passwordPlaceholder}
              />
            </div>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !password}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-brand-800 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {busy ? t.signingIn : t.signIn}
            </button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-brand-200/70">
        {t.shareNote}
      </p>
    </div>
  );
}

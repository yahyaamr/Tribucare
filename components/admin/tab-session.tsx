"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminApi, useAdminBase } from "./base-path";

/**
 * Ends the session when the tab that signed in is gone.
 *
 * The cookie already covers two of the three ways a session should end: it is
 * a browser-session cookie, so quitting the browser discards it, and the signed
 * value carries an idle deadline the proxy slides forward on each request. What
 * neither covers is closing the tab and coming back to it, because a cookie
 * belongs to the browser rather than to the tab.
 *
 * `sessionStorage` is the one store scoped to a tab, so signing in leaves a
 * marker in it and the panel refuses to render without one.
 *
 * The unavoidable consequence: the browser gives no way to tell "reopened after
 * closing" from "opened in a second tab" — both are a tab with empty
 * `sessionStorage`. So opening the panel in a second tab signs the first one
 * out. That is the cost of the rule, and it is a deliberate trade rather than a
 * bug; the alternative is per-tab session tokens, which is a much larger change
 * for a panel two or three people share.
 */

export const TAB_MARKER = "tribucare_admin_tab";

export function TabSessionGuard() {
  const router = useRouter();
  const base = useAdminBase();
  const api = useAdminApi();

  useEffect(() => {
    // A `try` because Safari's private mode throws on access rather than
    // returning null, and a panel that cannot read storage should still load.
    let marked = false;
    try {
      marked = window.sessionStorage.getItem(TAB_MARKER) === "1";
    } catch {
      return;
    }
    if (marked) return;

    void (async () => {
      await fetch(api("/logout"), { method: "POST" }).catch(() => null);
      router.replace(`${base}/login`);
      router.refresh();
    })();
  }, [api, base, router]);

  return null;
}

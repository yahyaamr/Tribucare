"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Stops a writer walking out of an editor with unsaved work — and only then.
 *
 * Nothing in the panel autosaves, so every link in the sidebar and the admin
 * bar is a way to lose an article. Two guards, for the two ways out:
 *
 * - **A reload, a closed tab, or an outside URL** gets the browser's own
 *   `beforeunload` prompt. That dialog cannot be styled or worded, but it is
 *   the only thing that runs on those paths.
 * - **A link inside the panel** is caught before the router sees it. The
 *   listener sits on `document` in the capture phase, so it runs ahead of
 *   React's own handlers (which live on the root container) and can stop the
 *   `<Link>` from navigating. The destination is held, and the editor shows
 *   `<LeaveDialog>` with a real choice — save and go, go anyway, or stay —
 *   which `beforeunload` could never offer.
 *
 * Both are attached only while `dirty` is true, so a saved article lets every
 * link work exactly as it always did. Modified clicks (⌘-click, middle-click)
 * and links that open a new tab are left alone: the editor stays where it is,
 * so nothing is at risk.
 *
 * What it does not catch: the browser's back button, and the panel's own
 * programmatic navigations (sign-out, the post-save URL swap). The former has
 * no reliable interception in the App Router; the latter are the editor's own
 * doing.
 */
export function useLeaveGuard(dirty: boolean) {
  const router = useRouter();
  /** Where the writer was going when the guard stopped them, or null. */
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      // Another origin unloads the page, and `beforeunload` above has that.
      if (url.origin !== window.location.origin) return;
      // Same page — a hash jump, or a link back to where we already are.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setPending(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [dirty]);

  /** Go where the writer was going. */
  const leave = useCallback(() => {
    const href = pending;
    setPending(null);
    if (href) router.push(href);
  }, [pending, router]);

  /** Close the dialog and keep editing. */
  const stay = useCallback(() => setPending(null), []);

  return { pending, leave, stay };
}

/**
 * The prompt the guard raises. The media library's dialog, with three buttons
 * in place of the grid: the primary saves and goes, the destructive one goes
 * without saving, and Stay (or Escape, or the backdrop) closes it.
 */
export function LeaveDialog({
  open,
  saving,
  onSaveAndLeave,
  onLeave,
  onStay,
}: {
  open: boolean;
  /** True while the editor's own save is in flight. */
  saving: boolean;
  onSaveAndLeave: () => void;
  onLeave: () => void;
  onStay: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onStay();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onStay]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Stay on this page"
        onClick={onStay}
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-dialog-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <h2
          id="leave-dialog-title"
          className="font-display text-lg font-semibold text-ink"
        >
          Unsaved changes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          You have changes that have not been saved. Save them before you go,
          or leave and lose them.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onStay}
            disabled={saving}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50 disabled:opacity-60"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onLeave}
            disabled={saving}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            Leave without saving
          </button>
          <button
            type="button"
            onClick={onSaveAndLeave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-300 hover:bg-brand-800 disabled:opacity-60"
          >
            {saving && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {saving ? "Saving…" : "Save and leave"}
          </button>
        </div>
      </div>
    </div>
  );
}

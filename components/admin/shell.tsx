"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TribuLogo } from "@/components/brand/logo";
import { AdminLanguageSwitch } from "@/components/admin/admin-language-switch";
import type { Locale } from "@/lib/i18n/config";
import type { AdminStrings } from "@/lib/i18n/admin-strings";

/**
 * The admin chrome: WordPress's shape, TribuCare's palette.
 *
 * The layout is deliberately the one the SEO team already has muscle memory
 * for — a dark fixed sidebar on the left with icon+label items, a thin admin
 * bar across the top carrying a "view site" link, and the working area on a
 * light grey ground. What it does *not* borrow is WordPress's colour scheme:
 * the sidebar is `brand-950`, the accent is `brand-600` and the type is the
 * site's own, so the panel reads as part of TribuCare rather than as a
 * bolted-on install.
 *
 * On phones the sidebar becomes a slide-over behind a hamburger, which is what
 * wp-admin does at the same breakpoint.
 */

const NAV = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", key: "posts", icon: FileText, exact: false },
  { href: "/admin/news", key: "news", icon: Newspaper, exact: false },
  { href: "/admin/media", key: "media", icon: ImageIcon, exact: false },
  { href: "/admin/settings", key: "settings", icon: Settings, exact: false },
] as const;

export function AdminShell({
  children,
  locale,
  t,
}: {
  children: React.ReactNode;
  locale: Locale;
  t: AdminStrings;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    // `refresh` clears the cached server render of the panel before the
    // redirect, so signing back in never shows the previous session's data.
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    // `dir` sits here rather than on <html> because the panel's language is a
    // cookie, not a route — the layout above is shared with the login screen.
    <div dir={t.dir} className="min-h-screen bg-[#f2f5f5]">
      {/* ---- Admin bar ------------------------------------------------- */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center gap-3 bg-brand-950 pe-3 ps-3 text-white lg:ps-60">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="inline-flex size-8 items-center justify-center rounded-lg text-brand-200 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        >
          {open ? (
            <X className="size-4.5" aria-hidden="true" />
          ) : (
            <Menu className="size-4.5" aria-hidden="true" />
          )}
          <span className="sr-only">{open ? t.closeMenu : t.openMenu}</span>
        </button>

        <span className="text-[0.8125rem] font-semibold text-brand-100">
          {t.brand}
        </span>

        <div className="ms-auto flex items-center gap-1">
          <AdminLanguageSwitch
            locale={locale}
            label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          />
          <Link
            href="/blog"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t.viewSite}</span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-200 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-60"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {signingOut ? t.signingOut : t.signOut}
            </span>
          </button>
        </div>
      </header>

      {/* ---- Sidebar ---------------------------------------------------- */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-brand-950/50 lg:hidden"
        />
      )}

      <nav
        id="admin-sidebar"
        aria-label="Admin"
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-60 flex-col bg-brand-950 transition-transform duration-300 ease-[var(--ease-out)]",
          // The off-canvas transform is scoped to `max-lg` rather than being
          // undone by an `lg:translate-x-0`. Both are single-class variants, so
          // which one wins is a matter of stylesheet order — and under RTL the
          // `rtl:` rule was landing last, parking the whole sidebar off the
          // right edge of the desktop panel. Not existing above `lg` is not
          // order-dependent.
          open
            ? "translate-x-0"
            : "max-lg:-translate-x-full max-lg:rtl:translate-x-full",
        )}
      >
        <div className="flex h-12 items-center gap-2 px-4">
          <TribuLogo className="h-6 w-auto" tone="light" />
        </div>

        {/* Two creation buttons, one per content type. The blog keeps the
            filled treatment because it is the more frequent action; news gets
            the outlined one so the pair reads as primary + secondary rather
            than as two equal calls to action competing at the top of the
            sidebar. */}
        <div className="space-y-2 px-3 pt-4">
          <Link
            href="/admin/posts/new"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-brand-500"
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            {t.newPost}
          </Link>
          <Link
            href="/admin/news/new"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-brand-100 transition-colors duration-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t.newNews}
          </Link>
        </div>

        <ul className="mt-4 flex-1 space-y-0.5 px-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-white/10 text-white"
                      : "text-brand-200/80 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {t.nav[item.key]}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-5 pb-5 text-[0.6875rem] leading-relaxed text-brand-200/40">
          {t.sidebarNote}
        </p>
      </nav>

      {/* ---- Work area --------------------------------------------------- */}
      <main id="main" className="pt-12 lg:ps-60">
        {children}
      </main>
    </div>
  );
}

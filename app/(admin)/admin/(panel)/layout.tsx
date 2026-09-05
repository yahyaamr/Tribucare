import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { hasSession } from "@/lib/cms/session";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

/**
 * The real gate.
 *
 * `proxy.ts` already redirects unauthenticated requests here, but the Next docs
 * are explicit that proxy checks are optimistic and not an authorisation
 * boundary — so the session is verified again, on the server, before any
 * panel route renders.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasSession())) redirect("/admin/login");

  const locale = await adminLocale();
  return (
    <AdminShell locale={locale} t={adminStrings(locale)}>
      {children}
    </AdminShell>
  );
}

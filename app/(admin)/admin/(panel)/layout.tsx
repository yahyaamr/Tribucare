import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { StorageNotice } from "@/components/admin/storage-notice";
import { hasSession } from "@/lib/cms/session";
import { isBlobConfigured } from "@/lib/cms/store";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

/**
 * The real gate.
 *
 * `proxy.ts` already redirects unauthenticated requests here, but the Next docs
 * are explicit that proxy checks are optimistic and not an authorisation
 * boundary — so the session is verified again, on the server, before any
 * panel route renders.
 *
 * The storage notice sits here rather than on individual pages because the
 * condition it reports affects every one of them. On a deployment with no Blob
 * store the panel lists nothing while the public site still serves the
 * articles baked into the last build — so an editor opening the posts list
 * sees an empty table contradicting the live blog, with no explanation. It
 * belongs wherever that can be seen, which is everywhere.
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
      <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8 empty:hidden [&>*]:mt-0">
        <StorageNotice configured={isBlobConfigured()} />
      </div>
      {children}
    </AdminShell>
  );
}

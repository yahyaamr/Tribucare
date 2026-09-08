import type { Metadata } from "next";
import { AdminBaseProvider } from "@/components/admin/base-path";
import { adminBase } from "@/lib/cms/gate";

/**
 * Wraps every admin route, including the login screen.
 *
 * Two jobs: keep the panel out of search results, and publish the base path
 * everything below it builds links and fetches from. The gated shell —
 * sidebar, admin bar, session check — is one level down in `(panel)/layout.tsx`,
 * a route group so that the login page can share both without being wrapped in
 * the chrome it is the gateway to.
 *
 * Reading `adminBase()` here rather than in the components that need it is what
 * keeps `ADMIN_PATH` server-side: this is a server component, so the value is
 * resolved during render and passed down, never inlined into a public bundle.
 */
export const metadata: Metadata = {
  title: { default: "Blog Admin", template: "%s · Blog Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminBaseProvider base={adminBase()}>{children}</AdminBaseProvider>;
}

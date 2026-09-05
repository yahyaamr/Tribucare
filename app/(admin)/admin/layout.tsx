import type { Metadata } from "next";

/**
 * Wraps every admin route, including the login screen.
 *
 * Its only job is to keep the panel out of search results. The gated shell —
 * sidebar, admin bar, session check — is one level down in `(panel)/layout.tsx`,
 * a route group so that the login page can share this metadata without being
 * wrapped in the chrome it is the gateway to.
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
  return children;
}

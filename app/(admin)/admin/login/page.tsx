import { Suspense } from "react";
import { isAuthConfigured } from "@/lib/cms/auth";
import { LoginForm } from "@/components/admin/login-form";
import { adminLocale } from "@/lib/i18n/admin";
import { adminStrings } from "@/lib/i18n/admin-strings";

export async function generateMetadata() {
  const t = adminStrings(await adminLocale());
  return { title: t.login.signIn };
}

export default async function AdminLoginPage() {
  // The panel layout is not above this route — it is what you get *instead* of
  // the panel — so the language cookie is read here rather than inherited.
  const t = adminStrings(await adminLocale());
  return (
    <div
      dir={t.dir}
      className="ground-deep flex min-h-screen items-center justify-center px-5 py-16"
    >
      {/* `useSearchParams` inside the form needs a boundary to suspend at. */}
      <Suspense fallback={null}>
        <LoginForm configured={isAuthConfigured()} t={t.login} />
      </Suspense>
    </div>
  );
}

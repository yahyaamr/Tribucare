import { Suspense } from "react";
import { isAuthConfigured } from "@/lib/cms/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <div className="ground-deep flex min-h-screen items-center justify-center px-5 py-16">
      {/* `useSearchParams` inside the form needs a boundary to suspend at. */}
      <Suspense fallback={null}>
        <LoginForm configured={isAuthConfigured()} />
      </Suspense>
    </div>
  );
}

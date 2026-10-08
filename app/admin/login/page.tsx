import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
    // 2FA-DISABLED: redirect(session.user.needsEnrollment ? "/admin/onboarding/2fa" : "/admin");
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-sm text-on-surface-variant underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ← Lawon Bloom Fertility Centre
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-background p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Editorial admin</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Sign in to manage the journal.</p>
        <LoginForm />
      </div>
    </div>
  );
}

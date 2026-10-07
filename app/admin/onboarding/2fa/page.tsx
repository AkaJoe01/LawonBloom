import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TwoFactorSetup from "./two-factor-setup";

export const metadata: Metadata = { title: "Enable two-factor authentication" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (session.user.totpEnabled) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border border-outline-variant bg-background p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Set up two-factor authentication</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Required before admin access is granted. Scan the QR code with an authenticator app, then enter the
          6-digit code it shows.
        </p>
        <TwoFactorSetup email={session.user.email ?? ""} />
      </div>
    </div>
  );
}

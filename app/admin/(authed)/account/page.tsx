import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountForm from "@/components/admin/account-form";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Account" };

export default async function AdminAccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, role: true },
  });
  if (!user) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Account</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Your profile and password. Email and role are managed by an administrator.
        </p>
      </header>
      <AccountForm email={user.email} role={user.role} initialName={user.name ?? user.email} />
    </div>
  );
}

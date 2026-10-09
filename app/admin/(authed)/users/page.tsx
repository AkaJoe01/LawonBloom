import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import UsersPanel, { type UserRow } from "@/components/admin/users-panel";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const db = getDb();
  const rows = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      totpEnabled: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const users: UserRow[] = rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name ?? row.email,
    role: row.role,
    isActive: row.isActive,
    totpEnabled: row.totpEnabled,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }));

  return <UsersPanel users={users} currentUserId={session.user.id} />;
}

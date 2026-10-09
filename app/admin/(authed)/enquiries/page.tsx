import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import EnquiriesPanel, { type EnquiryRow } from "@/components/admin/enquiries-panel";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const db = getDb();
  const rows = await db.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  const items: EnquiryRow[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    postSlug: row.postSlug,
    consentAt: row.consentAt.toISOString(),
    consentVersion: row.consentVersion,
    readAt: row.readAt ? row.readAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }));

  return <EnquiriesPanel items={items} />;
}

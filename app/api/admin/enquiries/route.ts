import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const db = getDb();
  const enquiries = await db.enquiry.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      message: true,
      postSlug: true,
      consentAt: true,
      consentVersion: true,
      readAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ enquiries });
}

import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/log";
import { adminMutationGate, requireAdmin } from "@/lib/auth/guards";
import { apiError } from "@/lib/api-error";
import { getDb } from "@/lib/db";
import { originRejection } from "@/lib/security/origin";
import { enquiryActionSchema } from "@/lib/validation/blog";
import { zodFieldErrors } from "@/lib/validation/common";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const gate = await adminMutationGate(guard.session.user.id);
  if (gate) return gate;

  const { id } = await params;
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Invalid JSON body.");
  }
  const parsed = enquiryActionSchema.safeParse(raw);
  if (!parsed.success) {
    return apiError(400, "validation", "Invalid action.", { fieldErrors: zodFieldErrors(parsed.error) });
  }

  const db = getDb();
  const existing = await db.enquiry.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return apiError(404, "not_found", "Enquiry not found.");

  const read = parsed.data.action === "read";
  await db.enquiry.update({
    where: { id },
    data: { readAt: read ? new Date() : null },
  });
  logEvent(read ? "enquiry_marked_read" : "enquiry_marked_unread", {
    adminId: guard.session.user.id,
    enquiryId: id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const gate = await adminMutationGate(guard.session.user.id);
  if (gate) return gate;

  const { id } = await params;
  const db = getDb();
  const existing = await db.enquiry.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return apiError(404, "not_found", "Enquiry not found.");

  await db.enquiry.delete({ where: { id } });
  logEvent("enquiry_deleted", { adminId: guard.session.user.id, enquiryId: id });

  return new Response(null, { status: 204 });
}

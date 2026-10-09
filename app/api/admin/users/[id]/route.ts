import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/log";
import { getDb } from "@/lib/db";
import { adminMutationGate, requireAdmin } from "@/lib/auth/guards";
import { generatePassword, hashPassword } from "@/lib/auth/password";
import { originRejection } from "@/lib/security/origin";
import { userActionSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: { code: "invalid_json", message: "Invalid JSON body." } }, { status: 400 });
  }
  const parsed = userActionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation", message: "Unknown action." } }, { status: 400 });
  }

  const db = getDb();
  const target = await db.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!target) {
    return NextResponse.json({ error: { code: "not_found", message: "User not found." } }, { status: 404 });
  }

  const adminId = guard.session.user.id;

  if (parsed.data.action === "deactivate") {
    if (target.id === adminId) {
      return NextResponse.json(
        { error: { code: "self_deactivate", message: "You cannot deactivate your own account." } },
        { status: 403 },
      );
    }
    await db.user.update({
      where: { id: target.id },
      data: { isActive: false, sessionEpoch: { increment: 1 } },
    });
    logEvent("user_deactivated", { adminId, targetId: target.id });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "activate") {
    await db.user.update({ where: { id: target.id }, data: { isActive: true } });
    logEvent("user_activated", { adminId, targetId: target.id });
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "set-role") {
    if (target.id === adminId) {
      return NextResponse.json(
        { error: { code: "self_role_change", message: "You cannot change your own role." } },
        { status: 403 },
      );
    }
    await db.user.update({
      where: { id: target.id },
      data: { role: parsed.data.role, sessionEpoch: { increment: 1 } },
    });
    logEvent("user_role_changed", { adminId, targetId: target.id, role: parsed.data.role });
    return NextResponse.json({ ok: true });
  }

  const displayOncePassword = generatePassword();
  const passwordHash = await hashPassword(displayOncePassword);
  await db.user.update({
    where: { id: target.id },
    data: { passwordHash, sessionEpoch: { increment: 1 }, failedLogins: 0, lockedUntil: null },
  });
  logEvent("password_reset", { adminId, targetId: target.id });
  return NextResponse.json({ displayOncePassword });
}

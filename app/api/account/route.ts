import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/log";
import { requireSession, perUserGate } from "@/lib/auth/guards";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { apiError } from "@/lib/api-error";
import { getDb } from "@/lib/db";
import { originRejection } from "@/lib/security/origin";
import { accountUpdateSchema } from "@/lib/validation/auth";
import { zodFieldErrors } from "@/lib/validation/common";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const gate = await perUserGate(guard.session.user.id, 10, 60, "account-patch");
  if (gate) return gate;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Invalid JSON body.");
  }
  const parsed = accountUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return apiError(400, "validation", "Invalid account update.", { fieldErrors: zodFieldErrors(parsed.error) });
  }
  const input = parsed.data;

  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: guard.session.user.id },
    select: { id: true, name: true, passwordHash: true },
  });
  if (!user) return apiError(401, "unauthorized", "Sign in required.");

  const nameChanged = input.name !== undefined && input.name !== user.name;
  const data: { name?: string; passwordHash?: string; sessionEpoch?: { increment: number } } = {};
  if (nameChanged && input.name !== undefined) data.name = input.name;

  let reauth = false;
  if (input.newPassword !== undefined) {
    const valid = await verifyPassword(user.passwordHash, input.currentPassword ?? "");
    if (!valid) {
      return apiError(400, "invalid_password", "Your current password is incorrect.", {
        fieldErrors: { currentPassword: "Your current password is incorrect." },
      });
    }
    data.passwordHash = await hashPassword(input.newPassword);
    data.sessionEpoch = { increment: 1 };
    reauth = true;
  }

  if (Object.keys(data).length > 0) {
    await db.user.update({ where: { id: user.id }, data });
  }

  if (reauth) {
    logEvent("account_password_changed", { userId: user.id });
  } else if (nameChanged) {
    logEvent("account_name_changed", { userId: user.id });
  }

  return NextResponse.json({ ok: true, reauth });
}

import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export type SessionGuard = { ok: true; session: Session } | { ok: false; response: NextResponse };

function errorResponse(status: number, code: string, message: string): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function requireSession(): Promise<SessionGuard> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, response: errorResponse(401, "unauthorized", "Sign in required.") };
  }
  return { ok: true, session };
}

export async function requireAdmin(): Promise<SessionGuard> {
  const result = await requireSession();
  if (!result.ok) return result;
  const { user } = result.session;
  if (user.role !== "ADMIN") {
    return { ok: false, response: errorResponse(403, "forbidden", "Admin access required.") };
  }
  // 2FA-DISABLED: re-enable the totp_enrollment_required gate below.
  // if (!user.totpEnabled) {
  //   return {
  //     ok: false,
  //     response: errorResponse(403, "totp_enrollment_required", "Enable two-factor authentication to continue."),
  //   };
  // }
  return result;
}

export async function requireStaff(): Promise<SessionGuard> {
  const result = await requireSession();
  if (!result.ok) return result;
  const { role } = result.session.user;
  if (role !== "ADMIN" && role !== "EDITOR") {
    return { ok: false, response: errorResponse(403, "forbidden", "Staff access required.") };
  }
  return result;
}

export async function perUserGate(
  userId: string,
  limit: number,
  windowSeconds: number,
  prefix: string,
): Promise<NextResponse | null> {
  const gate = await checkRateLimit({ key: `${prefix}:${userId}`, limit, windowSeconds, prefix }, "open");
  if (!gate.ok) {
    return errorResponse(429, "rate_limited", "Too many requests. Try again shortly.");
  }
  return null;
}

export async function adminMutationGate(userId: string): Promise<NextResponse | null> {
  const gate = await checkRateLimit(
    { key: `admin-mutations:${userId}`, limit: 60, windowSeconds: 60, prefix: "admin_mutations" },
    "open",
  );
  if (!gate.ok) {
    return errorResponse(429, "rate_limited", "Too many requests. Try again shortly.");
  }
  return null;
}

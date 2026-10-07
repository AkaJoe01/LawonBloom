import { NextResponse } from "next/server";
import { logEvent } from "@/lib/observability/log";
import { auth } from "@/auth";
import { decryptTotpSecret, generateBackupCodes, hashBackupCode, verifyTotpCode } from "@/lib/auth/totp";
import { getDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { originRejection } from "@/lib/security/origin";
import { totpVerifySchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Sign in required." } }, { status: 401 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
  const gate = await checkRateLimit(
    { key: `totp-verify:${session.user.id}:${ip}`, limit: 10, windowSeconds: 300, prefix: "totp_verify" },
    "closed",
  );
  if (!gate.ok) {
    return NextResponse.json({ error: { code: "rate_limited", message: "Too many attempts. Try again shortly." } }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_json", message: "Invalid JSON body." } }, { status: 400 });
  }
  const parsed = totpVerifySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation", message: "A 6-digit code is required." } }, { status: 400 });
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, totpEnabled: true, totpSecret: true },
  });
  if (!user) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Sign in required." } }, { status: 401 });
  }
  if (user.totpEnabled) {
    return NextResponse.json({ error: { code: "already_enrolled", message: "Two-factor authentication is already enabled." } }, { status: 403 });
  }
  if (!user.totpSecret) {
    return NextResponse.json({ error: { code: "setup_required", message: "Start two-factor setup first." } }, { status: 400 });
  }

  let secret: string;
  try {
    secret = decryptTotpSecret(user.totpSecret);
  } catch {
    return NextResponse.json({ error: { code: "setup_required", message: "Start two-factor setup first." } }, { status: 400 });
  }

  const valid = await verifyTotpCode(parsed.data.code.replace(/\s/g, ""), secret);
  if (!valid) {
    return NextResponse.json({ error: { code: "invalid_code", message: "That code is not valid." } }, { status: 400 });
  }

  const codes = generateBackupCodes();
  await db.$transaction([
    db.backupCode.deleteMany({ where: { userId: user.id } }),
    db.user.update({ where: { id: user.id }, data: { totpEnabled: true } }),
    db.backupCode.createMany({
      data: codes.map((code) => ({ userId: user.id, codeHash: hashBackupCode(code) })),
    }),
  ]);
  logEvent("totp_enabled", { userId: user.id });

  return NextResponse.json({ ok: true, backupCodes: codes });
}

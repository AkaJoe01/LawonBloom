import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { encryptTotpSecret, generateTotpSecret, totpUri } from "@/lib/auth/totp";
import { originRejection } from "@/lib/security/origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rejected = originRejection(request);
  if (rejected) return rejected;

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Sign in required." } }, { status: 401 });
  }

  const ip = "setup";
  const gate = await checkRateLimit(
    { key: `totp-setup:${session.user.id}:${ip}`, limit: 5, windowSeconds: 60, prefix: "totp_setup" },
    "open",
  );
  if (!gate.ok) {
    return NextResponse.json({ error: { code: "rate_limited", message: "Too many attempts. Try again shortly." } }, { status: 429 });
  }

  const db = getDb();
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, totpEnabled: true } });
  if (!user) {
    return NextResponse.json({ error: { code: "unauthorized", message: "Sign in required." } }, { status: 401 });
  }
  if (user.totpEnabled) {
    return NextResponse.json({ error: { code: "already_enrolled", message: "Two-factor authentication is already enabled." } }, { status: 403 });
  }

  const secret = generateTotpSecret();
  const encrypted = encryptTotpSecret(secret);
  await db.user.update({ where: { id: user.id }, data: { totpSecret: encrypted } });

  const QRCode = (await import("qrcode")).default;
  const qrDataUrl = await QRCode.toDataURL(totpUri(user.email, secret));

  return NextResponse.json({ qrDataUrl, secretBase32: secret });
}

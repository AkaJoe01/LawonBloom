import { getDb } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyPassword } from "./password";
import { decryptTotpSecret, hashBackupCode, verifyTotpCode } from "./totp";

export interface AuthorizeInput {
  email: string;
  password: string;
  totp?: string;
  ip: string;
}

export interface SessionClaims {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "EDITOR";
  sessionEpoch: number;
  totpEnabled: boolean;
  needsEnrollment: boolean;
}

export type AuthorizeOutcome =
  | { status: "ok"; user: SessionClaims }
  | { status: "invalid" }
  | { status: "locked"; lockedUntil: Date }
  | { status: "two_factor" };

const LOCKOUT_MS = 10 * 60 * 1000;

async function consumeFailureBucket(email: string, ip: string): Promise<boolean> {
  const bucket = await checkRateLimit(
    { key: `login:${email}:${ip}`, limit: 5, windowSeconds: 900, prefix: "login" },
    "open",
  );
  return !bucket.ok;
}

async function applyLockout(user: {
  id: string;
  email: string;
  lockoutCount: number;
}): Promise<Date> {
  const db = getDb();
  const lockedUntil = new Date(Date.now() + LOCKOUT_MS);
  const lockoutCount = user.lockoutCount + 1;
  await db.user.update({
    where: { id: user.id },
    data: { lockedUntil, lockoutCount, failedLogins: 0 },
  });
  if (lockoutCount % 3 === 0) {
    await sendMail("account_lockout_alert", {
      email: user.email,
      lockoutCount,
      lockedUntilIso: lockedUntil.toISOString(),
    });
  }
  return lockedUntil;
}

export async function authorizeCredentials(input: AuthorizeInput): Promise<AuthorizeOutcome> {
  const db = getDb();
  const now = new Date();
  const user = await db.user.findUnique({ where: { email: input.email } });

  if (user?.lockedUntil && user.lockedUntil > now) {
    return { status: "locked", lockedUntil: user.lockedUntil };
  }

  const passwordOk = await verifyPassword(user?.passwordHash ?? "", input.password);

  if (!passwordOk) {
    const tripped = await consumeFailureBucket(input.email, input.ip);
    if (user) {
      if (tripped) {
        await applyLockout(user);
      } else {
        await db.user.update({
          where: { id: user.id },
          data: { failedLogins: user.failedLogins + 1 },
        });
      }
    }
    return { status: "invalid" };
  }

  if (!user || !user.isActive) {
    return { status: "invalid" };
  }

  if (user.totpEnabled) {
    if (!input.totp) {
      return { status: "two_factor" };
    }

    if (/^\d{6}$/.test(input.totp)) {
      if (!user.totpSecret) {
        return { status: "two_factor" };
      }
      let secret: string;
      try {
        secret = decryptTotpSecret(user.totpSecret);
      } catch {
        return { status: "two_factor" };
      }
      const valid = await verifyTotpCode(input.totp, secret);
      if (!valid) {
        const tripped = await consumeFailureBucket(input.email, input.ip);
        if (tripped) {
          await applyLockout(user);
        }
        return { status: "two_factor" };
      }
    } else if (/^[A-Z0-9]{10}$/.test(input.totp)) {
      const codeHash = hashBackupCode(input.totp);
      const backup = await db.backupCode.findFirst({
        where: { userId: user.id, codeHash, usedAt: null },
      });
      if (!backup) {
        const tripped = await consumeFailureBucket(input.email, input.ip);
        if (tripped) {
          await applyLockout(user);
        }
        return { status: "two_factor" };
      }
      await db.backupCode.update({
        where: { id: backup.id },
        data: { usedAt: new Date() },
      });
      console.info(JSON.stringify({ event: "backup_code_used", userId: user.id }));
    } else {
      return { status: "two_factor" };
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { failedLogins: 0, lastLoginAt: now },
  });

  return {
    status: "ok",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sessionEpoch: user.sessionEpoch,
      totpEnabled: user.totpEnabled,
      needsEnrollment: user.role === "ADMIN" && !user.totpEnabled,
    },
  };
}

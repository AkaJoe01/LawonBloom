import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt } from "node:crypto";
import { generateSecret, generateURI, verify } from "otplib";

export const TOTP_WINDOW_TOLERANCE_SECONDS = 30;

function getEncryptionKey(): Buffer {
  const raw = process.env.TOTP_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("TOTP_ENCRYPTION_KEY is not set");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("TOTP_ENCRYPTION_KEY must be base64-encoded 32 bytes");
  }
  return key;
}

export function generateTotpSecret(): string {
  return generateSecret({ length: 20 });
}

export function totpUri(accountName: string, secret: string): string {
  return generateURI({
    issuer: "Lawonbloom Fertility Centre",
    label: accountName,
    secret,
  });
}

export async function verifyTotpCode(code: string, secret: string): Promise<boolean> {
  try {
    const result = await verify({
      secret,
      token: code,
      epochTolerance: TOTP_WINDOW_TOLERANCE_SECONDS,
    });
    return result.valid;
  } catch {
    return false;
  }
}

export function encryptTotpSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptTotpSecret(payload: string): string {
  const [ivPart, tagPart, dataPart] = payload.split(".");
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error("malformed totp secret payload");
  }
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export const BACKUP_CODE_COUNT = 10;
export const BACKUP_CODE_LENGTH = 10;
export const BACKUP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < BACKUP_CODE_COUNT; i += 1) {
    let code = "";
    for (let j = 0; j < BACKUP_CODE_LENGTH; j += 1) {
      code += BACKUP_CODE_ALPHABET[randomInt(BACKUP_CODE_ALPHABET.length)];
    }
    codes.push(code);
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

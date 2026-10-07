import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generate } from "otplib";
import {
  BACKUP_CODE_COUNT,
  BACKUP_CODE_LENGTH,
  decryptTotpSecret,
  encryptTotpSecret,
  generateBackupCodes,
  generateTotpSecret,
  hashBackupCode,
  totpUri,
  verifyTotpCode,
} from "../../lib/auth/totp";

const KEY = Buffer.alloc(32, 7).toString("base64");

describe("totp primitives", () => {
  beforeEach(() => {
    process.env.TOTP_ENCRYPTION_KEY = KEY;
  });

  afterEach(() => {
    delete process.env.TOTP_ENCRYPTION_KEY;
    vi.useRealTimers();
  });

  it("generates a base32 secret", () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    expect(secret.length).toBeGreaterThanOrEqual(32);
  });

  it("builds an otpauth:// URI with issuer and label", () => {
    const uri = totpUri("admin@clinic.test", "JBSWY3DPEHPK3PXP");
    expect(uri.startsWith("otpauth://totp/")).toBe(true);
    expect(uri).toContain("Lawonbloom");
    expect(uri).toContain("secret=JBSWY3DPEHPK3PXP");
  });

  it("verifies a freshly generated code", async () => {
    const secret = generateTotpSecret();
    const code = await generate({ secret });
    expect(code).toHaveLength(6);
    await expect(verifyTotpCode(code, secret)).resolves.toBe(true);
  });

  it("rejects a wrong code and malformed codes", async () => {
    const secret = generateTotpSecret();
    await expect(verifyTotpCode("000000", secret)).resolves.toBe(false);
    await expect(verifyTotpCode("abc", secret)).resolves.toBe(false);
    await expect(verifyTotpCode("", secret)).resolves.toBe(false);
  });

  it("accepts codes within ±1 window (30s) and rejects ±2 (60s)", async () => {
    const secret = generateTotpSecret();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T12:00:00.000Z"));
    const code = await generate({ secret });

    vi.setSystemTime(new Date("2026-10-01T12:00:00.000Z"));
    await expect(verifyTotpCode(code, secret)).resolves.toBe(true);

    vi.setSystemTime(new Date("2026-10-01T12:00:30.000Z"));
    await expect(verifyTotpCode(code, secret)).resolves.toBe(true);

    vi.setSystemTime(new Date("2026-10-01T11:59:30.000Z"));
    await expect(verifyTotpCode(code, secret)).resolves.toBe(true);

    vi.setSystemTime(new Date("2026-10-01T12:01:00.000Z"));
    await expect(verifyTotpCode(code, secret)).resolves.toBe(false);
  });

  it("round-trips the encrypted secret (AES-256-GCM)", () => {
    const secret = generateTotpSecret();
    const payload = encryptTotpSecret(secret);
    expect(payload).not.toContain(secret);
    expect(decryptTotpSecret(payload)).toBe(secret);
  });

  it("fails to decrypt a tampered payload", () => {
    const payload = encryptTotpSecret(generateTotpSecret());
    const [iv, tag] = payload.split(".");
    const tampered = `${iv}.${tag}.${Buffer.from("AAAA").toString("base64url")}`;
    expect(() => decryptTotpSecret(tampered)).toThrow();
    expect(() => decryptTotpSecret("garbage")).toThrow();
  });

  it("requires a correctly-sized encryption key", () => {
    process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(16).toString("base64");
    expect(() => encryptTotpSecret("SECRET")).toThrow(/32 bytes/);
    delete process.env.TOTP_ENCRYPTION_KEY;
    expect(() => encryptTotpSecret("SECRET")).toThrow(/not set/);
  });

  it("generates 10 unique 10-char backup codes from the unambiguous alphabet", () => {
    const codes = generateBackupCodes();
    expect(codes).toHaveLength(BACKUP_CODE_COUNT);
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (const code of codes) {
      expect(code).toHaveLength(BACKUP_CODE_LENGTH);
      for (const char of code) expect(alphabet).toContain(char);
    }
    expect(new Set(codes).size).toBe(BACKUP_CODE_COUNT);
  });

  it("hashes backup codes deterministically and distinctly", () => {
    const [a, b] = generateBackupCodes();
    expect(hashBackupCode(a)).toBe(hashBackupCode(a));
    expect(hashBackupCode(a)).not.toBe(hashBackupCode(b));
    expect(hashBackupCode(a)).toMatch(/^[0-9a-f]{64}$/);
  });
});

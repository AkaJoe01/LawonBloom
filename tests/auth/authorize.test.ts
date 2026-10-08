import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  backupFindFirst: vi.fn(),
  backupUpdate: vi.fn(),
  sendMail: vi.fn(),
  checkRateLimit: vi.fn(),
  verifyPassword: vi.fn(),
  decryptTotpSecret: vi.fn(),
  verifyTotpCode: vi.fn(),
  hashBackupCode: vi.fn(),
}));

vi.mock("../../lib/db", () => ({
  getDb: () => ({
    user: { findUnique: mocks.userFindUnique, update: mocks.userUpdate },
    backupCode: { findFirst: mocks.backupFindFirst, update: mocks.backupUpdate },
  }),
}));

vi.mock("../../lib/mail", () => ({ sendMail: mocks.sendMail }));
vi.mock("../../lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("../../lib/auth/password", () => ({ verifyPassword: mocks.verifyPassword }));
vi.mock("../../lib/auth/totp", () => ({
  decryptTotpSecret: mocks.decryptTotpSecret,
  verifyTotpCode: mocks.verifyTotpCode,
  hashBackupCode: mocks.hashBackupCode,
}));

import { authorizeCredentials } from "../../lib/auth/authorize";

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user_1",
    email: "admin@clinic.test",
    passwordHash: "$argon2id$fake",
    name: "Admin",
    role: "ADMIN",
    isActive: true,
    totpSecret: null,
    totpEnabled: false,
    sessionEpoch: 4,
    failedLogins: 0,
    lockedUntil: null,
    lockoutCount: 0,
    lastLoginAt: null,
    ...overrides,
  };
}

const baseInput = { email: "admin@clinic.test", password: "hunter2hunter2", ip: "1.2.3.4" };

describe("authorizeCredentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.verifyPassword.mockResolvedValue(false);
    mocks.userUpdate.mockResolvedValue({});
    mocks.backupUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns invalid for an unknown email but still burns a rate bucket", async () => {
    mocks.userFindUnique.mockResolvedValue(null);
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome).toEqual({ status: "invalid" });
    expect(mocks.verifyPassword).toHaveBeenCalledWith("", "hunter2hunter2");
    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      { key: "login:admin@clinic.test:1.2.3.4", limit: 5, windowSeconds: 900, prefix: "login" },
      "open",
    );
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("short-circuits with locked for an active lockout (step 1)", async () => {
    const lockedUntil = new Date(Date.now() + 60_000);
    mocks.userFindUnique.mockResolvedValue(makeUser({ lockedUntil }));
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome).toEqual({ status: "locked", lockedUntil });
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
    expect(mocks.checkRateLimit).not.toHaveBeenCalled();
  });

  it("ignores an expired lockout", async () => {
    const lockedUntil = new Date(Date.now() - 60_000);
    mocks.userFindUnique.mockResolvedValue(makeUser({ lockedUntil }));
    mocks.verifyPassword.mockResolvedValue(true);
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome.status).toBe("ok");
  });

  it("increments failedLogins on a wrong password", async () => {
    mocks.userFindUnique.mockResolvedValue(makeUser({ failedLogins: 2 }));
    mocks.verifyPassword.mockResolvedValue(false);
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome).toEqual({ status: "invalid" });
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { failedLogins: 3 },
    });
  });

  it("locks the account when the failure bucket trips", async () => {
    mocks.userFindUnique.mockResolvedValue(makeUser({ failedLogins: 4 }));
    mocks.verifyPassword.mockResolvedValue(false);
    mocks.checkRateLimit.mockResolvedValue({ ok: false });
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome).toEqual({ status: "invalid" });
    const update = mocks.userUpdate.mock.calls[0][0];
    expect(update.data.lockedUntil).toBeInstanceOf(Date);
    expect(update.data.lockedUntil.getTime()).toBeGreaterThan(Date.now());
    expect(update.data.lockoutCount).toBe(1);
    expect(update.data.failedLogins).toBe(0);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("sends the account_lockout_alert mail on every third lockout", async () => {
    mocks.userFindUnique.mockResolvedValue(makeUser({ failedLogins: 4, lockoutCount: 2 }));
    mocks.verifyPassword.mockResolvedValue(false);
    mocks.checkRateLimit.mockResolvedValue({ ok: false });
    await authorizeCredentials(baseInput);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(
      "account_lockout_alert",
      expect.objectContaining({ email: "admin@clinic.test", lockoutCount: 3 }),
      { rid: undefined },
    );
  });

  it("returns generic invalid for a deactivated user with a correct password", async () => {
    mocks.userFindUnique.mockResolvedValue(makeUser({ isActive: false }));
    mocks.verifyPassword.mockResolvedValue(true);
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome).toEqual({ status: "invalid" });
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  /* 2FA-DISABLED: forced-enrollment assertion — needsEnrollment is hardcoded false while 2FA is commented out.
  it("lets an admin without TOTP in but flags forced enrollment (step 5)", async () => {
    mocks.userFindUnique.mockResolvedValue(makeUser());
    mocks.verifyPassword.mockResolvedValue(true);
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.user).toEqual({
        id: "user_1",
        email: "admin@clinic.test",
        name: "Admin",
        role: "ADMIN",
        sessionEpoch: 4,
        totpEnabled: false,
        needsEnrollment: true,
      });
    }
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { failedLogins: 0, lastLoginAt: expect.any(Date) },
    });
  });
  */

  it("lets an editor without TOTP in without an enrollment flag", async () => {
    mocks.userFindUnique.mockResolvedValue(makeUser({ role: "EDITOR", failedLogins: 1 }));
    mocks.verifyPassword.mockResolvedValue(true);
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.user.needsEnrollment).toBe(false);
      expect(outcome.user.role).toBe("EDITOR");
    }
  });

  /* 2FA-DISABLED: all second-factor tests below — authorize() skips the TOTP
     block while it is commented out. Re-enable together with the source.
  it("asks for the second factor when totp is enabled but absent (step 6)", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "enc.blob" }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    const outcome = await authorizeCredentials(baseInput);
    expect(outcome).toEqual({ status: "two_factor" });
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("accepts a valid TOTP code", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "enc.blob" }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.decryptTotpSecret.mockReturnValue("BASE32SECRET");
    mocks.verifyTotpCode.mockResolvedValue(true);
    const outcome = await authorizeCredentials({ ...baseInput, totp: "123456" });
    expect(outcome.status).toBe("ok");
    expect(mocks.verifyTotpCode).toHaveBeenCalledWith("123456", "BASE32SECRET");
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { failedLogins: 0, lastLoginAt: expect.any(Date) },
    });
  });

  it("re-prompts (two_factor) on a wrong TOTP code and consumes the bucket", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "enc.blob" }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.decryptTotpSecret.mockReturnValue("BASE32SECRET");
    mocks.verifyTotpCode.mockResolvedValue(false);
    const outcome = await authorizeCredentials({ ...baseInput, totp: "000000" });
    expect(outcome).toEqual({ status: "two_factor" });
    expect(mocks.checkRateLimit).toHaveBeenCalledTimes(1);
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("locks the account when a wrong TOTP trips the bucket", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "enc.blob", lockoutCount: 0 }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.decryptTotpSecret.mockReturnValue("BASE32SECRET");
    mocks.verifyTotpCode.mockResolvedValue(false);
    mocks.checkRateLimit.mockResolvedValue({ ok: false });
    const outcome = await authorizeCredentials({ ...baseInput, totp: "000000" });
    expect(outcome).toEqual({ status: "two_factor" });
    expect(mocks.userUpdate.mock.calls[0][0].data.lockoutCount).toBe(1);
  });

  it("re-prompts when the stored secret cannot be decrypted", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "corrupt" }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.decryptTotpSecret.mockImplementation(() => {
      throw new Error("bad tag");
    });
    const outcome = await authorizeCredentials({ ...baseInput, totp: "123456" });
    expect(outcome).toEqual({ status: "two_factor" });
    expect(mocks.verifyTotpCode).not.toHaveBeenCalled();
  });

  it("consumes a backup code exactly once and logs without the code value", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "enc.blob" }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.hashBackupCode.mockReturnValue("hash_abc");
    mocks.backupFindFirst.mockResolvedValue({ id: "bc_1", usedAt: null });

    const outcome = await authorizeCredentials({ ...baseInput, totp: "ABC2345678" });
    expect(outcome.status).toBe("ok");
    expect(mocks.backupFindFirst).toHaveBeenCalledWith({
      where: { userId: "user_1", codeHash: "hash_abc", usedAt: null },
    });
    expect(mocks.backupUpdate).toHaveBeenCalledWith({
      where: { id: "bc_1" },
      data: { usedAt: expect.any(Date) },
    });
    const logged = JSON.stringify(vi.mocked(console.info).mock.calls.map((call) => call[0]));
    expect(logged).toContain("backup_code_used");
    expect(logged).not.toContain("ABC2345678");
  });

  it("re-prompts when the backup code is unknown or already used", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "enc.blob" }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.hashBackupCode.mockReturnValue("hash_abc");
    mocks.backupFindFirst.mockResolvedValue(null);
    const outcome = await authorizeCredentials({ ...baseInput, totp: "ABC2345678" });
    expect(outcome).toEqual({ status: "two_factor" });
    expect(mocks.backupUpdate).not.toHaveBeenCalled();
  });

  it("re-prompts on a malformed second-factor value", async () => {
    mocks.userFindUnique.mockResolvedValue(
      makeUser({ totpEnabled: true, totpSecret: "enc.blob" }),
    );
    mocks.verifyPassword.mockResolvedValue(true);
    const outcome = await authorizeCredentials({ ...baseInput, totp: "not-a-code" });
    expect(outcome).toEqual({ status: "two_factor" });
  });
  */
});

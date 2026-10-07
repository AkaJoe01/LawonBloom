import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  checkRateLimit: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  toQr: vi.fn(),
  decryptTotpSecret: vi.fn(),
  verifyTotpCode: vi.fn(),
  generateBackupCodes: vi.fn(),
  hashBackupCode: vi.fn(),
  transaction: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("qrcode", () => ({ default: { toDataURL: mocks.toQr } }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    user: { findUnique: mocks.userFindUnique, update: mocks.userUpdate },
    backupCode: { deleteMany: mocks.deleteMany, createMany: mocks.createMany },
    $transaction: mocks.transaction,
  }),
}));
vi.mock("@/lib/auth/totp", () => ({
  decryptTotpSecret: mocks.decryptTotpSecret,
  verifyTotpCode: mocks.verifyTotpCode,
  generateBackupCodes: mocks.generateBackupCodes,
  hashBackupCode: mocks.hashBackupCode,
  generateTotpSecret: vi.fn(() => "NEWSSECRETBASE32"),
  encryptTotpSecret: vi.fn(() => "enc.newsecret"),
  totpUri: vi.fn(() => "otpauth://totp/test"),
}));

import { POST as setupPost } from "../../app/api/auth/totp/setup/route";
import { POST as verifyPost } from "../../app/api/auth/totp/verify/route";

function post(headers: Record<string, string> = {}, body?: unknown): Request {
  return new Request("http://localhost/api/auth/totp/setup", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      host: "localhost",
      ...headers,
    },
    body: body === undefined ? null : typeof body === "string" ? body : JSON.stringify(body),
  });
}

function session(totpEnabled: boolean) {
  return {
    user: { id: "user_1", email: "admin@clinic.test", role: "ADMIN", totpEnabled, needsEnrollment: !totpEnabled },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  };
}

const codes = Array.from({ length: 10 }, (_, i) => `CODE${String(i).padStart(6, "0")}`).map(
  (code) => code.slice(0, 10),
);

describe("POST /api/auth/totp/setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.userUpdate.mockResolvedValue({});
    mocks.toQr.mockResolvedValue("data:image/png;base64,QR");
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a cross-origin request", async () => {
    const response = await setupPost(post({ origin: "https://evil.example" }));
    expect(response.status).toBe(403);
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await setupPost(post());
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("unauthorized");
  });

  it("returns 429 when rate-limited", async () => {
    mocks.auth.mockResolvedValue(session(false));
    mocks.checkRateLimit.mockResolvedValue({ ok: false });
    const response = await setupPost(post());
    expect(response.status).toBe(429);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });

  it("returns 403 when 2FA is already enrolled", async () => {
    mocks.auth.mockResolvedValue(session(true));
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      email: "admin@clinic.test",
      totpEnabled: true,
    });
    const response = await setupPost(post());
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("already_enrolled");
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("stores an encrypted secret and returns the QR + base32 secret once", async () => {
    mocks.auth.mockResolvedValue(session(false));
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      email: "admin@clinic.test",
      totpEnabled: false,
    });
    const response = await setupPost(post());
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.qrDataUrl).toBe("data:image/png;base64,QR");
    expect(payload.secretBase32).toBe("NEWSSECRETBASE32");
    expect(mocks.toQr).toHaveBeenCalledWith("otpauth://totp/test");
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { totpSecret: "enc.newsecret" },
    });
    expect(mocks.userUpdate.mock.calls[0][0].data.totpSecret).not.toBe(payload.secretBase32);
  });
});

describe("POST /api/auth/totp/verify", () => {
  const verifyPost_ = () => verifyPost(post({}, { code: "123456" }));

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.userUpdate.mockResolvedValue({});
    mocks.deleteMany.mockResolvedValue({});
    mocks.createMany.mockResolvedValue({ count: 10 });
    mocks.transaction.mockResolvedValue([]);
    mocks.generateBackupCodes.mockReturnValue(codes);
    mocks.hashBackupCode.mockImplementation((code: string) => `hash:${code}`);
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 429 fail-closed when the rate gate is degraded", async () => {
    mocks.auth.mockResolvedValue(session(false));
    mocks.checkRateLimit.mockResolvedValue({ ok: false, degraded: true });
    const response = await verifyPost_();
    expect(response.status).toBe(429);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, windowSeconds: 300 }),
      "closed",
    );
  });

  it("returns 400 invalid_json on a malformed body", async () => {
    mocks.auth.mockResolvedValue(session(false));
    const response = await verifyPost(post({}, "{not json"));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_json");
  });

  it("returns 400 validation when the code is not 6 digits", async () => {
    mocks.auth.mockResolvedValue(session(false));
    const response = await verifyPost(post({}, { code: "12345" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("validation");
  });

  it("returns 403 already_enrolled for a fully enrolled admin", async () => {
    mocks.auth.mockResolvedValue(session(true));
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      totpEnabled: true,
      totpSecret: "enc.blob",
    });
    const response = await verifyPost_();
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe("already_enrolled");
  });

  it("returns 400 setup_required when no secret was generated", async () => {
    mocks.auth.mockResolvedValue(session(false));
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      totpEnabled: false,
      totpSecret: null,
    });
    const response = await verifyPost_();
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("setup_required");
  });

  it("returns 400 setup_required when the stored secret cannot be decrypted", async () => {
    mocks.auth.mockResolvedValue(session(false));
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      totpEnabled: false,
      totpSecret: "corrupt",
    });
    mocks.decryptTotpSecret.mockImplementation(() => {
      throw new Error("bad tag");
    });
    const response = await verifyPost_();
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("setup_required");
  });

  it("returns 400 invalid_code for a wrong code and stores nothing", async () => {
    mocks.auth.mockResolvedValue(session(false));
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      totpEnabled: false,
      totpSecret: "enc.blob",
    });
    mocks.decryptTotpSecret.mockReturnValue("BASE32SECRET");
    mocks.verifyTotpCode.mockResolvedValue(false);
    const response = await verifyPost_();
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_code");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("enables TOTP, stores backup-code hashes, and returns codes once", async () => {
    mocks.auth.mockResolvedValue(session(false));
    mocks.userFindUnique.mockResolvedValue({
      id: "user_1",
      totpEnabled: false,
      totpSecret: "enc.blob",
    });
    mocks.decryptTotpSecret.mockReturnValue("BASE32SECRET");
    mocks.verifyTotpCode.mockResolvedValue(true);
    mocks.verifyTotpCode.mockResolvedValue(true);

    const response = await verifyPost_();
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.backupCodes).toEqual(codes);
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { userId: "user_1" } });
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { totpEnabled: true },
    });
    expect(mocks.createMany).toHaveBeenCalledWith({
      data: codes.map((code) => ({ userId: "user_1", codeHash: `hash:${code}` })),
    });
    expect(vi.mocked(console.info)).toHaveBeenCalledWith(
      expect.stringContaining('"evt":"totp_enabled"'),
    );
  });
});

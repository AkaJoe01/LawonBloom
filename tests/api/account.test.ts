import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  checkRateLimit: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    user: {
      findUnique: mocks.userFindUnique,
      update: mocks.userUpdate,
    },
  }),
}));

import { hashPassword } from "../../lib/auth/password";
import { PATCH } from "../../app/api/account/route";

function request(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/account", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      host: "localhost",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function session() {
  return {
    user: { id: "me_1", email: "staff@clinic.test", role: "EDITOR", totpEnabled: false, needsEnrollment: false },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  };
}

describe("PATCH /api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.userUpdate.mockResolvedValue({});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 without a session", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await PATCH(request({ name: "New Name" }));
    expect(response.status).toBe(401);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin request before auth", async () => {
    const response = await PATCH(request({ name: "New Name" }, { origin: "https://evil.test" }));
    expect(response.status).toBe(403);
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it("returns 400 when there is nothing to update", async () => {
    mocks.auth.mockResolvedValue(session());
    const response = await PATCH(request({}));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("validation");
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 for a too-short new password", async () => {
    mocks.auth.mockResolvedValue(session());
    const response = await PATCH(request({ currentPassword: "x", newPassword: "short" }));
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe("validation");
    expect(payload.error.fieldErrors.newPassword).toBeTruthy();
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when the current password is wrong", async () => {
    mocks.auth.mockResolvedValue(session());
    mocks.userFindUnique.mockResolvedValue({
      id: "me_1",
      name: "Staff",
      passwordHash: await hashPassword("correct-password-123"),
    });
    const response = await PATCH(
      request({ currentPassword: "not-the-password", newPassword: "a-brand-new-pass-12" }),
    );
    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error.code).toBe("invalid_password");
    expect(payload.error.fieldErrors.currentPassword).toBeTruthy();
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("updates the name without a password or epoch bump", async () => {
    mocks.auth.mockResolvedValue(session());
    mocks.userFindUnique.mockResolvedValue({ id: "me_1", name: "Old Name", passwordHash: "hash" });
    const response = await PATCH(request({ name: "New Name" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, reauth: false });
    expect(mocks.userUpdate).toHaveBeenCalledWith({
      where: { id: "me_1" },
      data: { name: "New Name" },
    });
    expect(vi.mocked(console.info)).toHaveBeenCalledWith(
      expect.stringContaining('"evt":"account_name_changed"'),
    );
  });

  it("changes the password, bumps the epoch, and asks the client to reauth", async () => {
    mocks.auth.mockResolvedValue(session());
    mocks.userFindUnique.mockResolvedValue({
      id: "me_1",
      name: "Staff",
      passwordHash: await hashPassword("current-password-123"),
    });
    const response = await PATCH(
      request({ currentPassword: "current-password-123", newPassword: "a-brand-new-pass-12" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, reauth: true });
    const updateArgs = mocks.userUpdate.mock.calls[0][0];
    expect(updateArgs.data.passwordHash).toContain("$argon2id$");
    expect(updateArgs.data.passwordHash).not.toContain("a-brand-new-pass-12");
    expect(updateArgs.data.sessionEpoch).toEqual({ increment: 1 });
    expect(vi.mocked(console.info)).toHaveBeenCalledWith(
      expect.stringContaining('"evt":"account_password_changed"'),
    );
  });

  it("returns 429 when the per-user gate is exhausted", async () => {
    mocks.auth.mockResolvedValue(session());
    mocks.checkRateLimit.mockResolvedValue({ ok: false });
    const response = await PATCH(request({ name: "New Name" }));
    expect(response.status).toBe(429);
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });
});

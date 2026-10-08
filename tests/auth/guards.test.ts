import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, checkRateLimit } = vi.hoisted(() => ({
  authMock: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));

import { adminMutationGate, requireAdmin, requireSession } from "../../lib/auth/guards";

function session(role: "ADMIN" | "EDITOR", totpEnabled: boolean) {
  return {
    user: {
      id: "user_1",
      email: "user@clinic.test",
      role,
      totpEnabled,
      needsEnrollment: !totpEnabled,
    },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  };
}

describe("auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimit.mockResolvedValue({ ok: true });
  });

  it("returns 401 when there is no session", async () => {
    authMock.mockResolvedValue(null);
    const guard = await requireSession();
    expect(guard.ok).toBe(false);
    if (!guard.ok) {
      expect(guard.response.status).toBe(401);
      expect((await guard.response.json()).error.code).toBe("unauthorized");
    }
  });

  it("passes any signed-in session through requireSession", async () => {
    authMock.mockResolvedValue(session("EDITOR", false));
    const guard = await requireSession();
    expect(guard.ok).toBe(true);
  });

  it("blocks editors from admin guards with 403 forbidden", async () => {
    authMock.mockResolvedValue(session("EDITOR", false));
    const guard = await requireAdmin();
    expect(guard.ok).toBe(false);
    if (!guard.ok) {
      expect(guard.response.status).toBe(403);
      expect((await guard.response.json()).error.code).toBe("forbidden");
    }
  });

  /* 2FA-DISABLED: requireAdmin() no longer returns totp_enrollment_required while
     the guard in lib/auth/guards.ts is commented out.
  it("blocks an un-enrolled admin with totp_enrollment_required (4c)", async () => {
    authMock.mockResolvedValue(session("ADMIN", false));
    const guard = await requireAdmin();
    expect(guard.ok).toBe(false);
    if (!guard.ok) {
      expect(guard.response.status).toBe(403);
      expect((await guard.response.json()).error.code).toBe("totp_enrollment_required");
    }
  });
  */

  it("admits an enrolled admin", async () => {
    authMock.mockResolvedValue(session("ADMIN", true));
    const guard = await requireAdmin();
    expect(guard.ok).toBe(true);
  });

  it("lets the admin mutation gate pass under budget", async () => {
    const result = await adminMutationGate("user_1");
    expect(result).toBeNull();
    expect(checkRateLimit).toHaveBeenCalledWith(
      { key: "admin-mutations:user_1", limit: 60, windowSeconds: 60, prefix: "admin_mutations" },
      "open",
    );
  });

  it("returns 429 when the admin mutation gate is exhausted", async () => {
    checkRateLimit.mockResolvedValue({ ok: false });
    const result = await adminMutationGate("user_1");
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
    expect((await result!.json()).error.code).toBe("rate_limited");
  });
});

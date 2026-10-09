import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  checkRateLimit: vi.fn(),
  userFindUnique: vi.fn(),
  userFindMany: vi.fn(),
  userCreate: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    user: {
      findUnique: mocks.userFindUnique,
      findMany: mocks.userFindMany,
      create: mocks.userCreate,
      update: mocks.userUpdate,
    },
  }),
}));

import { GET, POST } from "../../app/api/admin/users/route";
import { PATCH } from "../../app/api/admin/users/[id]/route";

function request(path: string, body?: unknown): Request {
  return new Request(path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      host: "localhost",
    },
    body: body === undefined ? null : JSON.stringify(body),
  });
}

function patchRequest(id: string, body: unknown): Request {
  return new Request(`http://localhost/api/admin/users/${id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      host: "localhost",
    },
    body: JSON.stringify(body),
  });
}

function session(role: "ADMIN" | "EDITOR", totpEnabled: boolean) {
  return {
    user: { id: "admin_1", email: "admin@clinic.test", role, totpEnabled, needsEnrollment: false },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  };
}

const context = (id: string) => ({ params: Promise.resolve({ id }) });

describe("admin users endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.userCreate.mockImplementation(async ({ data }: { data: { email: string; name: string } }) => ({
      id: "editor_1",
      email: data.email,
      name: data.name,
    }));
    mocks.userUpdate.mockResolvedValue({});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/admin/users", () => {
    it("returns 401 without a session", async () => {
      mocks.auth.mockResolvedValue(null);
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it("returns 403 for editors", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await GET();
      expect(response.status).toBe(403);
      expect((await response.json()).error.code).toBe("forbidden");
    });

    /* 2FA-DISABLED: the totp_enrollment_required 403 is commented out in requireAdmin().
    it("returns 403 totp_enrollment_required for an un-enrolled admin", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", false));
      const response = await GET();
      expect(response.status).toBe(403);
      expect((await response.json()).error.code).toBe("totp_enrollment_required");
    });
    */

    it("lists users without exposing hash or secret fields", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindMany.mockResolvedValue([
        { id: "u1", email: "a@x.test", role: "ADMIN", isActive: true, totpEnabled: true },
      ]);
      const response = await GET();
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload.users).toHaveLength(1);
      const keys = Object.keys(payload.users[0]);
      expect(keys).not.toContain("passwordHash");
      expect(keys).not.toContain("totpSecret");
      expect(keys).not.toContain("sessionEpoch");
    });
  });

  describe("POST /api/admin/users", () => {
    it("rejects a cross-origin request before auth", async () => {
      const req = new Request("http://localhost/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json", host: "localhost" },
        body: JSON.stringify({ email: "a@x.test", name: "Editor" }),
      });
      const response = await POST(req);
      expect(response.status).toBe(403);
      expect(mocks.auth).not.toHaveBeenCalled();
    });

    it("returns 400 on invalid payload", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const response = await POST(request("http://localhost/api/admin/users", { email: "nope" }));
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("validation");
      expect(mocks.userCreate).not.toHaveBeenCalled();
    });

    it("returns 409 on duplicate email", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue({ id: "existing" });
      const response = await POST(
        request("http://localhost/api/admin/users", { email: "a@x.test", name: "Editor" }),
      );
      expect(response.status).toBe(409);
      expect((await response.json()).error.code).toBe("duplicate_email");
    });

    it("returns 429 when the admin mutation gate is exhausted", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.checkRateLimit.mockResolvedValue({ ok: false });
      const response = await POST(
        request("http://localhost/api/admin/users", { email: "a@x.test", name: "Editor" }),
      );
      expect(response.status).toBe(429);
    });

    it("creates an editor with a display-once password and audit log", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue(null);
      const response = await POST(
        request("http://localhost/api/admin/users", { email: "editor@x.test", name: "Editor One" }),
      );
      expect(response.status).toBe(201);
      const payload = await response.json();
      expect(payload.email).toBe("editor@x.test");
      expect(payload.displayOncePassword).toHaveLength(20);
      expect(mocks.userCreate).toHaveBeenCalledTimes(1);
      const createArgs = mocks.userCreate.mock.calls[0][0];
      expect(createArgs.data.role).toBe("EDITOR");
      expect(createArgs.data.passwordHash).toContain("$argon2id$");
      expect(createArgs.data.passwordHash).not.toBe(payload.displayOncePassword);
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(
        expect.stringContaining('"evt":"editor_created"'),
      );
    });
  });

  describe("PATCH /api/admin/users/:id", () => {
    it("returns 400 for an unknown action", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const response = await PATCH(
        patchRequest("u1", { action: "delete" }),
        context("u1"),
      );
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("validation");
    });

    it("returns 404 for a missing user", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue(null);
      const response = await PATCH(patchRequest("missing", { action: "deactivate" }), context("missing"));
      expect(response.status).toBe(404);
    });

    it("blocks self-deactivation with 403", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue({ id: "admin_1", email: "admin@clinic.test" });
      const response = await PATCH(patchRequest("admin_1", { action: "deactivate" }), context("admin_1"));
      expect(response.status).toBe(403);
      expect((await response.json()).error.code).toBe("self_deactivate");
      expect(mocks.userUpdate).not.toHaveBeenCalled();
    });

    it("deactivates and bumps the session epoch", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue({ id: "u2", email: "editor@x.test" });
      const response = await PATCH(patchRequest("u2", { action: "deactivate" }), context("u2"));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(mocks.userUpdate).toHaveBeenCalledWith({
        where: { id: "u2" },
        data: { isActive: false, sessionEpoch: { increment: 1 } },
      });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(
        expect.stringContaining('"evt":"user_deactivated"'),
      );
    });

    it("reactivates a user", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue({ id: "u2", email: "editor@x.test" });
      const response = await PATCH(patchRequest("u2", { action: "activate" }), context("u2"));
      expect(response.status).toBe(200);
      expect(mocks.userUpdate).toHaveBeenCalledWith({
        where: { id: "u2" },
        data: { isActive: true },
      });
    });

    it("rejects set-role without a target role", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const response = await PATCH(patchRequest("u2", { action: "set-role" }), context("u2"));
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("validation");
      expect(mocks.userUpdate).not.toHaveBeenCalled();
    });

    it("blocks changing your own role with 403", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue({ id: "admin_1", email: "admin@clinic.test" });
      const response = await PATCH(
        patchRequest("admin_1", { action: "set-role", role: "EDITOR" }),
        context("admin_1"),
      );
      expect(response.status).toBe(403);
      expect((await response.json()).error.code).toBe("self_role_change");
      expect(mocks.userUpdate).not.toHaveBeenCalled();
    });

    it("changes a role and bumps the session epoch", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue({ id: "u2", email: "editor@x.test" });
      const response = await PATCH(
        patchRequest("u2", { action: "set-role", role: "ADMIN" }),
        context("u2"),
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(mocks.userUpdate).toHaveBeenCalledWith({
        where: { id: "u2" },
        data: { role: "ADMIN", sessionEpoch: { increment: 1 } },
      });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(
        expect.stringContaining('"evt":"user_role_changed"'),
      );
    });

    it("resets a password with epoch bump and returns it once", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.userFindUnique.mockResolvedValue({ id: "u2", email: "editor@x.test" });
      const response = await PATCH(patchRequest("u2", { action: "reset-password" }), context("u2"));
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload.displayOncePassword).toHaveLength(20);
      const updateArgs = mocks.userUpdate.mock.calls[0][0];
      expect(updateArgs.data.passwordHash).toContain("$argon2id$");
      expect(updateArgs.data.sessionEpoch).toEqual({ increment: 1 });
      expect(updateArgs.data.failedLogins).toBe(0);
      expect(updateArgs.data.lockedUntil).toBeNull();
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(
        expect.stringContaining('"evt":"password_reset"'),
      );
    });
  });
});

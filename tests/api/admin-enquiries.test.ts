import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  checkRateLimit: vi.fn(),
  enquiryFindMany: vi.fn(),
  enquiryFindUnique: vi.fn(),
  enquiryUpdate: vi.fn(),
  enquiryDelete: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    enquiry: {
      findMany: mocks.enquiryFindMany,
      findUnique: mocks.enquiryFindUnique,
      update: mocks.enquiryUpdate,
      delete: mocks.enquiryDelete,
    },
  }),
}));

import { GET } from "../../app/api/admin/enquiries/route";
import { DELETE, PATCH } from "../../app/api/admin/enquiries/[id]/route";

function patchRequest(id: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost/api/admin/enquiries/${id}`, {
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

function deleteRequest(id: string, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost/api/admin/enquiries/${id}`, {
    method: "DELETE",
    headers: { origin: "http://localhost", host: "localhost", ...headers },
  });
}

function session(role: "ADMIN" | "EDITOR") {
  return {
    user: { id: "admin_1", email: "admin@clinic.test", role, totpEnabled: true, needsEnrollment: false },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  };
}

const context = (id: string) => ({ params: Promise.resolve({ id }) });

const baseEnquiry = {
  id: "e1",
  name: "Ada",
  email: "ada@example.com",
  phone: null,
  message: "I would like to know more.",
  postSlug: "understanding-ivf",
  consentAt: new Date("2026-01-01"),
  consentVersion: "v1",
  readAt: null,
  createdAt: new Date("2026-01-02"),
};

describe("admin enquiries endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.enquiryFindMany.mockResolvedValue([baseEnquiry]);
    mocks.enquiryFindUnique.mockResolvedValue({ id: "e1" });
    mocks.enquiryUpdate.mockResolvedValue({});
    mocks.enquiryDelete.mockResolvedValue({});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/admin/enquiries", () => {
    it("returns 401 without a session", async () => {
      mocks.auth.mockResolvedValue(null);
      const response = await GET();
      expect(response.status).toBe(401);
    });

    it("returns 403 for editors", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR"));
      const response = await GET();
      expect(response.status).toBe(403);
      expect((await response.json()).error.code).toBe("forbidden");
    });

    it("lists enquiries newest first with readAt", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      const response = await GET();
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload.enquiries).toHaveLength(1);
      expect(payload.enquiries[0].readAt).toBeNull();
      expect(payload.enquiries[0].consentVersion).toBe("v1");
      expect(mocks.enquiryFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: "desc" },
          take: 200,
        }),
      );
    });
  });

  describe("PATCH /api/admin/enquiries/:id", () => {
    it("rejects a cross-origin request before auth", async () => {
      const req = patchRequest("e1", { action: "read" }, { origin: "https://evil.test" });
      const response = await PATCH(req, context("e1"));
      expect(response.status).toBe(403);
      expect(mocks.auth).not.toHaveBeenCalled();
    });

    it("returns 400 for an unknown action", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      const response = await PATCH(patchRequest("e1", { action: "archive" }), context("e1"));
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("validation");
      expect(mocks.enquiryUpdate).not.toHaveBeenCalled();
    });

    it("returns 404 for a missing enquiry", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      mocks.enquiryFindUnique.mockResolvedValue(null);
      const response = await PATCH(patchRequest("missing", { action: "read" }), context("missing"));
      expect(response.status).toBe(404);
    });

    it("marks an enquiry read with a timestamp", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      const response = await PATCH(patchRequest("e1", { action: "read" }), context("e1"));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      const updateArgs = mocks.enquiryUpdate.mock.calls[0][0];
      expect(updateArgs.where).toEqual({ id: "e1" });
      expect(updateArgs.data.readAt).toBeInstanceOf(Date);
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(
        expect.stringContaining('"evt":"enquiry_marked_read"'),
      );
    });

    it("clears readAt when marking unread", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      const response = await PATCH(patchRequest("e1", { action: "unread" }), context("e1"));
      expect(response.status).toBe(200);
      expect(mocks.enquiryUpdate).toHaveBeenCalledWith({
        where: { id: "e1" },
        data: { readAt: null },
      });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(
        expect.stringContaining('"evt":"enquiry_marked_unread"'),
      );
    });
  });

  describe("DELETE /api/admin/enquiries/:id", () => {
    it("rejects a cross-origin request before auth", async () => {
      const req = deleteRequest("e1", { origin: "https://evil.test" });
      const response = await DELETE(req, context("e1"));
      expect(response.status).toBe(403);
      expect(mocks.auth).not.toHaveBeenCalled();
    });

    it("returns 404 for a missing enquiry", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      mocks.enquiryFindUnique.mockResolvedValue(null);
      const response = await DELETE(deleteRequest("missing"), context("missing"));
      expect(response.status).toBe(404);
      expect(mocks.enquiryDelete).not.toHaveBeenCalled();
    });

    it("deletes an enquiry with 204 and an audit log", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      const response = await DELETE(deleteRequest("e1"), context("e1"));
      expect(response.status).toBe(204);
      expect(mocks.enquiryDelete).toHaveBeenCalledWith({ where: { id: "e1" } });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(
        expect.stringContaining('"evt":"enquiry_deleted"'),
      );
    });

    it("returns 429 when the admin mutation gate is exhausted", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN"));
      mocks.checkRateLimit.mockResolvedValue({ ok: false });
      const response = await DELETE(deleteRequest("e1"), context("e1"));
      expect(response.status).toBe(429);
      expect(mocks.enquiryDelete).not.toHaveBeenCalled();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  checkRateLimit: vi.fn(),
  mediaFindUnique: vi.fn(),
  mediaFindMany: vi.fn(),
  mediaCount: vi.fn(),
  mediaCreate: vi.fn(),
  mediaUpdate: vi.fn(),
  mediaDelete: vi.fn(),
  postFindMany: vi.fn(),
  queryRaw: vi.fn(),
  transaction: vi.fn(),
  blobPut: vi.fn(),
  blobDel: vi.fn(),
  validateUpload: vi.fn(),
  processUpload: vi.fn(),
  checkUploadSize: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    $transaction: mocks.transaction,
    $queryRaw: mocks.queryRaw,
    media: {
      findUnique: mocks.mediaFindUnique,
      findMany: mocks.mediaFindMany,
      count: mocks.mediaCount,
      create: mocks.mediaCreate,
      update: mocks.mediaUpdate,
      delete: mocks.mediaDelete,
    },
    post: { findMany: mocks.postFindMany },
  }),
}));
vi.mock("@vercel/blob", () => ({ put: mocks.blobPut, del: mocks.blobDel }));
vi.mock("@/lib/media/pipeline", () => ({
  checkUploadSize: mocks.checkUploadSize,
  validateUpload: mocks.validateUpload,
  processUpload: mocks.processUpload,
  sniffImageMime: vi.fn(),
}));

import { GET as listGET, POST as uploadPOST } from "../../app/api/admin/media/route";
import { DELETE, PATCH } from "../../app/api/admin/media/[id]/route";

function session(role: "ADMIN" | "EDITOR", totpEnabled: boolean) {
  return {
    user: {
      id: role === "ADMIN" ? "admin_1" : "editor_1",
      email: "x@y.test",
      role,
      totpEnabled,
      needsEnrollment: false,
    },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  };
}

function originHeaders(extra: Record<string, string> = {}) {
  return { origin: "http://localhost", host: "localhost", ...extra };
}

function jsonRequest(path: string, method: string, body?: unknown): Request {
  return new Request(path, {
    method,
    headers: originHeaders({ "content-type": "application/json" }),
    body: body === undefined ? null : JSON.stringify(body),
  });
}

function uploadRequest(form: FormData, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/admin/media", {
    method: "POST",
    headers: originHeaders(headers),
    body: form,
  });
}

function fileForm(name = "photo.png"): FormData {
  const form = new FormData();
  form.append("file", new File([new Uint8Array([137, 80, 78, 71])], name, { type: "image/png" }));
  return form;
}

const baseMedia = {
  id: "m1",
  url: "https://blob.vercel-storage.com/media/abc.png",
  pathname: "media/abc.png",
  bytes: 1234,
  width: 1600,
  height: 900,
  mimeType: "image/png",
  altText: null,
  isDecorative: false,
  uploadedBy: "editor_1",
  createdAt: new Date("2026-01-01"),
};

const context = (id: string) => ({ params: Promise.resolve({ id }) });

describe("admin media endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
    mocks.mediaFindUnique.mockResolvedValue(null);
    mocks.mediaFindMany.mockResolvedValue([]);
    mocks.mediaCount.mockResolvedValue(0);
    mocks.mediaCreate.mockResolvedValue(baseMedia);
    mocks.mediaUpdate.mockResolvedValue(baseMedia);
    mocks.mediaDelete.mockResolvedValue(baseMedia);
    mocks.postFindMany.mockResolvedValue([]);
    mocks.queryRaw.mockResolvedValue([]);
    mocks.blobPut.mockResolvedValue({ url: baseMedia.url, pathname: baseMedia.pathname });
    mocks.blobDel.mockResolvedValue(undefined);
    mocks.checkUploadSize.mockReturnValue(null);
    mocks.validateUpload.mockResolvedValue({ ok: true, width: 1600, height: 900, format: "png" });
    mocks.processUpload.mockResolvedValue({
      data: Buffer.from("processed"),
      mimeType: "image/png",
      width: 1600,
      height: 900,
      bytes: 1234,
    });
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/admin/media", () => {
    it("returns 401 without a session", async () => {
      mocks.auth.mockResolvedValue(null);
      const response = await listGET(new Request("http://localhost/api/admin/media"));
      expect(response.status).toBe(401);
    });

    it("returns a paginated list for an editor", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.mediaFindMany.mockResolvedValue([{ ...baseMedia, createdAt: new Date("2026-01-01") }]);
      mocks.mediaCount.mockResolvedValue(25);
      const response = await listGET(new Request("http://localhost/api/admin/media?page=2"));
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload.page).toBe(2);
      expect(payload.pageSize).toBe(24);
      expect(payload.total).toBe(25);
      expect(payload.items[0]).toMatchObject({ id: "m1", width: 1600, mimeType: "image/png" });
      expect(payload.items[0]).not.toHaveProperty("pathname");
      const findManyArgs = mocks.mediaFindMany.mock.calls[0][0];
      expect(findManyArgs.skip).toBe(24);
      expect(findManyArgs.take).toBe(24);
    });

    it("rejects an invalid page", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const response = await listGET(new Request("http://localhost/api/admin/media?page=banana"));
      expect(response.status).toBe(400);
      expect((await response.json()).error.fieldErrors.page).toBeTruthy();
    });
  });

  describe("POST /api/admin/media", () => {
    it("rejects a cross-origin request before auth", async () => {
      const request = new Request("http://localhost/api/admin/media", {
        method: "POST",
        headers: { host: "localhost", "content-type": "multipart/form-data" },
        body: fileForm(),
      });
      const response = await uploadPOST(request);
      expect(response.status).toBe(403);
      expect(mocks.auth).not.toHaveBeenCalled();
    });

    it("returns 401 without a session", async () => {
      mocks.auth.mockResolvedValue(null);
      const response = await uploadPOST(uploadRequest(fileForm()));
      expect(response.status).toBe(401);
    });

    it("returns 429 when the upload gate is exhausted", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.checkRateLimit.mockResolvedValue({ ok: false });
      const response = await uploadPOST(uploadRequest(fileForm()));
      expect(response.status).toBe(429);
    });

    it("returns 413 early when Content-Length exceeds the cap", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const request = new Request("http://localhost/api/admin/media", {
        method: "POST",
        headers: originHeaders({ "content-length": String(10 * 1024 * 1024) }),
        body: "x",
      });
      const response = await uploadPOST(request);
      expect(response.status).toBe(413);
      expect((await response.json()).error.code).toBe("too_large");
      expect(mocks.validateUpload).not.toHaveBeenCalled();
    });

    it("returns 400 when no file is attached", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const form = new FormData();
      form.append("note", "no file here");
      const response = await uploadPOST(uploadRequest(form));
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("file_required");
    });

    it("returns 413 when the file itself exceeds 4 MB", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.checkUploadSize.mockReturnValue({ ok: false, status: 413, code: "too_large", message: "too big" });
      const response = await uploadPOST(uploadRequest(fileForm()));
      expect(response.status).toBe(413);
      expect(mocks.checkUploadSize).toHaveBeenCalledWith(4);
      expect(mocks.validateUpload).not.toHaveBeenCalled();
    });

    it("returns 415 for an unsupported type", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.validateUpload.mockResolvedValue({
        ok: false,
        status: 415,
        code: "unsupported_type",
        message: "Only JPEG, PNG, and WebP images are accepted.",
      });
      const response = await uploadPOST(uploadRequest(fileForm("funny.gif")));
      expect(response.status).toBe(415);
      expect((await response.json()).error.code).toBe("unsupported_type");
      expect(mocks.blobPut).not.toHaveBeenCalled();
    });

    it("returns 422 for dimensions that are too large", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.validateUpload.mockResolvedValue({
        ok: false,
        status: 422,
        code: "dimensions_too_large",
        message: "Images must be at most 6000px on their longest edge.",
      });
      const response = await uploadPOST(uploadRequest(fileForm()));
      expect(response.status).toBe(422);
      expect(mocks.processUpload).not.toHaveBeenCalled();
    });

    it("returns an honest 500 when sharp processing fails", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.processUpload.mockRejectedValue(new Error("sharp exploded"));
      const response = await uploadPOST(uploadRequest(fileForm()));
      expect(response.status).toBe(500);
      expect((await response.json()).error.code).toBe("processing_failed");
      expect(vi.mocked(console.error)).toHaveBeenCalledWith(expect.stringContaining("media_process_failed"));
      expect(mocks.blobPut).not.toHaveBeenCalled();
    });

    it("returns an honest 500 when blob storage fails", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.blobPut.mockRejectedValue(new Error("no token"));
      const response = await uploadPOST(uploadRequest(fileForm()));
      expect(response.status).toBe(500);
      expect((await response.json()).error.code).toBe("storage_failed");
      expect(mocks.mediaCreate).not.toHaveBeenCalled();
    });

    it("stores the image publicly with immutable caching and records the row", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await uploadPOST(uploadRequest(fileForm()));
      expect(response.status).toBe(201);
      const payload = await response.json();
      expect(payload).toEqual({
        id: "m1",
        url: baseMedia.url,
        w: 1600,
        h: 900,
        bytes: 1234,
        mime: "image/png",
      });
      const putArgs = mocks.blobPut.mock.calls[0];
      expect(putArgs[0]).toMatch(/^media\/.+\.png$/);
      expect(putArgs[1].toString()).toBe("processed");
      expect(putArgs[2]).toMatchObject({
        access: "public",
        addRandomSuffix: true,
        cacheControlMaxAge: 31536000,
        contentType: "image/png",
      });
      const createData = mocks.mediaCreate.mock.calls[0][0].data;
      expect(createData).toMatchObject({ width: 1600, height: 900, bytes: 1234, uploadedBy: "editor_1" });
    });
  });

  describe("PATCH /api/admin/media/:id", () => {
    it("returns 401 without a session", async () => {
      mocks.auth.mockResolvedValue(null);
      const response = await PATCH(
        jsonRequest("http://localhost/api/admin/media/m1", "PATCH", { altText: "x" }),
        context("m1"),
      );
      expect(response.status).toBe(401);
    });

    it("returns 400 on an invalid payload", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await PATCH(
        jsonRequest("http://localhost/api/admin/media/m1", "PATCH", { altText: "x".repeat(201) }),
        context("m1"),
      );
      expect(response.status).toBe(400);
      expect((await response.json()).error.fieldErrors.altText).toBeTruthy();
    });

    it("returns 404 for missing media", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await PATCH(
        jsonRequest("http://localhost/api/admin/media/x", "PATCH", { altText: "x" }),
        context("x"),
      );
      expect(response.status).toBe(404);
    });

    it("saves alt text for a non-decorative image", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.mediaFindUnique.mockResolvedValue(baseMedia);
      const response = await PATCH(
        jsonRequest("http://localhost/api/admin/media/m1", "PATCH", { altText: "Embryo transfer diagram", isDecorative: false }),
        context("m1"),
      );
      expect(response.status).toBe(200);
      const data = mocks.mediaUpdate.mock.calls[0][0].data;
      expect(data).toEqual({ altText: "Embryo transfer diagram", isDecorative: false });
    });

    it("clears alt text when an image is marked decorative", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.mediaFindUnique.mockResolvedValue({ ...baseMedia, altText: "old" });
      const response = await PATCH(
        jsonRequest("http://localhost/api/admin/media/m1", "PATCH", { isDecorative: true }),
        context("m1"),
      );
      expect(response.status).toBe(200);
      expect(mocks.mediaUpdate.mock.calls[0][0].data).toEqual({ altText: null, isDecorative: true });
    });

    it("returns 429 when the mutation gate is exhausted", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.checkRateLimit.mockResolvedValue({ ok: false });
      const response = await PATCH(
        jsonRequest("http://localhost/api/admin/media/m1", "PATCH", { altText: "x" }),
        context("m1"),
      );
      expect(response.status).toBe(429);
    });
  });

  describe("DELETE /api/admin/media/:id", () => {
    it("returns 401 without a session", async () => {
      mocks.auth.mockResolvedValue(null);
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/m1", "DELETE"),
        context("m1"),
      );
      expect(response.status).toBe(401);
    });

    it("returns 403 for an editor (admin only)", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/m1", "DELETE"),
        context("m1"),
      );
      expect(response.status).toBe(403);
      expect(mocks.mediaDelete).not.toHaveBeenCalled();
    });

    /* 2FA-DISABLED: the totp_enrollment_required 403 is commented out in requireAdmin().
    it("returns 403 when the admin has not enrolled in TOTP", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", false));
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/m1", "DELETE"),
        context("m1"),
      );
      expect(response.status).toBe(403);
      expect((await response.json()).error.code).toBe("totp_enrollment_required");
    });
    */

    it("returns 404 for missing media", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/x", "DELETE"),
        context("x"),
      );
      expect(response.status).toBe(404);
    });

    it("returns 409 with post titles when the image is still in use", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.mediaFindUnique.mockResolvedValue(baseMedia);
      mocks.postFindMany.mockResolvedValue([{ title: "IVF basics" }]);
      mocks.queryRaw.mockResolvedValue([{ title: "IUI timing" }]);
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/m1", "DELETE"),
        context("m1"),
      );
      expect(response.status).toBe(409);
      const payload = await response.json();
      expect(payload.error.code).toBe("in_use");
      expect(payload.error.usedBy).toBe(2);
      expect(payload.error.titles).toEqual(["IVF basics", "IUI timing"]);
      expect(mocks.blobDel).not.toHaveBeenCalled();
      expect(mocks.mediaDelete).not.toHaveBeenCalled();
    });

    it("deduplicates a post used as both cover and inline", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.mediaFindUnique.mockResolvedValue(baseMedia);
      mocks.postFindMany.mockResolvedValue([{ title: "Same post" }]);
      mocks.queryRaw.mockResolvedValue([{ title: "Same post" }]);
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/m1", "DELETE"),
        context("m1"),
      );
      expect(response.status).toBe(409);
      expect((await response.json()).error.usedBy).toBe(1);
    });

    it("deletes the blob then the row when unused", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.mediaFindUnique.mockResolvedValue(baseMedia);
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/m1", "DELETE"),
        context("m1"),
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ usedBy: 0 });
      expect(mocks.blobDel).toHaveBeenCalledWith("media/abc.png");
      expect(mocks.mediaDelete).toHaveBeenCalledWith({ where: { id: "m1" } });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(expect.stringContaining('"evt":"media_delete"'));
    });

    it("returns an honest 500 when blob deletion fails", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      mocks.mediaFindUnique.mockResolvedValue(baseMedia);
      mocks.blobDel.mockRejectedValue(new Error("no token"));
      const response = await DELETE(
        jsonRequest("http://localhost/api/admin/media/m1", "DELETE"),
        context("m1"),
      );
      expect(response.status).toBe(500);
      expect(mocks.mediaDelete).not.toHaveBeenCalled();
    });

    it("returns 403 for a cross-origin delete", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const request = new Request("http://localhost/api/admin/media/m1", {
        method: "DELETE",
        headers: { host: "localhost", "content-type": "application/json" },
      });
      const response = await DELETE(request, context("m1"));
      expect(response.status).toBe(403);
      expect(mocks.auth).not.toHaveBeenCalled();
    });
  });
});

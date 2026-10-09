import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  checkRateLimit: vi.fn(),
  revalidateTag: vi.fn(),
  postFindUnique: vi.fn(),
  postFindFirst: vi.fn(),
  postFindMany: vi.fn(),
  postCount: vi.fn(),
  postCreate: vi.fn(),
  postUpdate: vi.fn(),
  postDelete: vi.fn(),
  categoryFindUnique: vi.fn(),
  mediaFindUnique: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: mocks.checkRateLimit }));
vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    $transaction: mocks.transaction,
    post: {
      findUnique: mocks.postFindUnique,
      findFirst: mocks.postFindFirst,
      findMany: mocks.postFindMany,
      count: mocks.postCount,
      create: mocks.postCreate,
      update: mocks.postUpdate,
      delete: mocks.postDelete,
    },
    category: { findUnique: mocks.categoryFindUnique },
    media: { findUnique: mocks.mediaFindUnique },
  }),
}));

import { GET as listGET, POST as listPOST } from "../../app/api/admin/posts/route";
import { DELETE, GET as detailGET, PATCH } from "../../app/api/admin/posts/[id]/route";
import { POST as publishPOST } from "../../app/api/admin/posts/[id]/publish/route";
import { POST as unpublishPOST } from "../../app/api/admin/posts/[id]/unpublish/route";

const docContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Hello world body content for the post." }],
    },
  ],
};

const validPost = {
  title: "Understanding IVF",
  slug: "understanding-ivf",
  excerpt: "A short summary of IVF.",
  content: docContent,
  categoryId: "cat_1",
  coverImageId: null,
  disclaimer: "",
  reviewerName: null,
  reviewerCredential: null,
  reviewedAt: null,
  faqs: [],
  metaTitle: null,
  metaDescription: null,
};

const publishablePost = {
  ...validPost,
  coverImageId: "media_1",
  disclaimer: "This article is informational and not medical advice.",
  reviewedAt: "2026-09-01T00:00:00.000Z",
  reviewerName: "Dr. Amina Lawal",
  reviewerCredential: "MBBS, FRCOG",
};

function session(role: "ADMIN" | "EDITOR", totpEnabled: boolean) {
  return {
    user: { id: role === "ADMIN" ? "admin_1" : "editor_1", email: "x@y.test", role, totpEnabled, needsEnrollment: false },
    expires: new Date(Date.now() + 3600_000).toISOString(),
  };
}

function request(path: string, method: string, body?: unknown): Request {
  const hasBody = body !== undefined;
  return new Request(path, {
    method,
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      host: "localhost",
    },
    body: hasBody ? JSON.stringify(body) : null,
  });
}

const context = (id: string) => ({ params: Promise.resolve({ id }) });

const basePost = {
  id: "p1",
  title: "Understanding IVF",
  slug: "understanding-ivf",
  excerpt: "A short summary.",
  content: docContent,
  plainText: "",
  categoryId: "cat_1",
  coverImageId: null,
  status: "DRAFT" as const,
  disclaimer: "",
  reviewerName: null,
  reviewerCredential: null,
  reviewedAt: null,
  faqs: [],
  metaTitle: null,
  metaDescription: null,
  readingTime: 1,
  createdBy: "editor_1",
  updatedBy: null,
  publishedBy: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
  publishedAt: null,
};

describe("admin posts endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ ok: true });
    mocks.transaction.mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
    mocks.categoryFindUnique.mockResolvedValue({ id: "cat_1", slug: "fertility", name: "Fertility" });
    mocks.mediaFindUnique.mockResolvedValue({ id: "media_1", width: 1600 });
    mocks.postFindUnique.mockResolvedValue(null);
    mocks.postFindFirst.mockResolvedValue(null);
    mocks.postFindMany.mockResolvedValue([]);
    mocks.postCount.mockResolvedValue(0);
    mocks.postCreate.mockResolvedValue({ id: "p1", slug: "understanding-ivf", status: "DRAFT" });
    mocks.postUpdate.mockResolvedValue({ id: "p1", slug: "understanding-ivf", status: "DRAFT" });
    mocks.postDelete.mockResolvedValue({});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/admin/posts", () => {
    it("returns 401 without a session", async () => {
      mocks.auth.mockResolvedValue(null);
      const response = await listGET(new Request("http://localhost/api/admin/posts"));
      expect(response.status).toBe(401);
    });

    it("allows an editor (no TOTP required for reads)", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await listGET(new Request("http://localhost/api/admin/posts"));
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ items: [], total: 0, page: 1, pageSize: 10 });
    });

    it("applies status, category, and q filters with pagination", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const response = await listGET(
        new Request("http://localhost/api/admin/posts?status=DRAFT&category=fertility&q=ivf&page=2"),
      );
      expect(response.status).toBe(200);
      const findManyArgs = mocks.postFindMany.mock.calls[0][0];
      expect(findManyArgs.where).toEqual({
        status: "DRAFT",
        category: { slug: "fertility" },
        title: { contains: "ivf", mode: "insensitive" },
      });
      expect(findManyArgs.skip).toBe(10);
      expect(findManyArgs.take).toBe(10);
    });

    it("rejects an invalid query with fieldErrors", async () => {
      mocks.auth.mockResolvedValue(session("ADMIN", true));
      const response = await listGET(new Request("http://localhost/api/admin/posts?status=BANANA"));
      expect(response.status).toBe(400);
      const payload = await response.json();
      expect(payload.error.code).toBe("validation");
      expect(payload.error.fieldErrors.status).toBeTruthy();
    });
  });

  describe("POST /api/admin/posts", () => {
    it("rejects a cross-origin request before auth", async () => {
      const req = new Request("http://localhost/api/admin/posts", {
        method: "POST",
        headers: { "content-type": "application/json", host: "localhost" },
        body: JSON.stringify(validPost),
      });
      const response = await listPOST(req);
      expect(response.status).toBe(403);
      expect(mocks.auth).not.toHaveBeenCalled();
    });

    it("returns 400 with fieldErrors on an invalid payload", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await listPOST(
        request("http://localhost/api/admin/posts", "POST", { ...validPost, slug: "Bad Slug" }),
      );
      expect(response.status).toBe(400);
      const payload = await response.json();
      expect(payload.error.fieldErrors.slug).toBeTruthy();
      expect(mocks.postCreate).not.toHaveBeenCalled();
    });

    it("returns 400 for an unknown category reference", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.categoryFindUnique.mockResolvedValue(null);
      const response = await listPOST(
        request("http://localhost/api/admin/posts", "POST", { ...validPost, categoryId: "missing" }),
      );
      expect(response.status).toBe(400);
      expect((await response.json()).error.fieldErrors.categoryId).toBeTruthy();
    });

    it("returns 409 with a -2 suggestion when the slug is taken", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockImplementation(async ({ where }: { where: { slug?: string } }) =>
        where.slug === "understanding-ivf" ? { id: "p0" } : null,
      );
      const response = await listPOST(request("http://localhost/api/admin/posts", "POST", validPost));
      expect(response.status).toBe(409);
      const payload = await response.json();
      expect(payload.error.code).toBe("duplicate_slug");
      expect(payload.error.suggestion).toBe("understanding-ivf-2");
    });

    it("returns 429 when the create gate is exhausted", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.checkRateLimit.mockResolvedValue({ ok: false });
      const response = await listPOST(request("http://localhost/api/admin/posts", "POST", validPost));
      expect(response.status).toBe(429);
    });

    it("creates a draft with derived plainText/readingTime and the creator recorded", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await listPOST(request("http://localhost/api/admin/posts", "POST", validPost));
      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ id: "p1", slug: "understanding-ivf", status: "DRAFT" });
      const data = mocks.postCreate.mock.calls[0][0].data;
      expect(data.status).toBeUndefined();
      expect(data.plainText).toContain("Hello world body content");
      expect(data.readingTime).toBe(1);
      expect(data.createdBy).toBe("editor_1");
      expect(data.excerpt).toBe("A short summary of IVF.");
      expect(data.noindex).toBe(false);
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(expect.stringContaining('"evt":"post_created"'));
    });
  });

  describe("GET /api/admin/posts/:id", () => {
    it("returns 404 for a missing post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await detailGET(request("http://localhost/api/admin/posts/x", "GET"), context("x"));
      expect(response.status).toBe(404);
    });

    it("returns the full post including content", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, status: "PUBLISHED" });
      const response = await detailGET(request("http://localhost/api/admin/posts/p1", "GET"), context("p1"));
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload.content).toEqual(docContent);
      expect(payload.status).toBe("PUBLISHED");
    });
  });

  describe("PATCH /api/admin/posts/:id", () => {
    it("returns 400 on an invalid payload", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await PATCH(
        request("http://localhost/api/admin/posts/p1", "PATCH", { title: "Hi" }),
        context("p1"),
      );
      expect(response.status).toBe(400);
      expect((await response.json()).error.fieldErrors.title).toBeTruthy();
    });

    it("returns 404 for a missing post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await PATCH(
        request("http://localhost/api/admin/posts/x", "PATCH", { excerpt: "New" }),
        context("x"),
      );
      expect(response.status).toBe(404);
    });

    it("locks the slug on a published post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, status: "PUBLISHED" });
      const response = await PATCH(
        request("http://localhost/api/admin/posts/p1", "PATCH", { slug: "new-slug" }),
        context("p1"),
      );
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("slug_locked");
      expect(mocks.postUpdate).not.toHaveBeenCalled();
    });

    it("blocks clearing the cover image on a published post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, status: "PUBLISHED", coverImageId: "media_1" });
      const response = await PATCH(
        request("http://localhost/api/admin/posts/p1", "PATCH", { coverImageId: null }),
        context("p1"),
      );
      expect(response.status).toBe(400);
      expect((await response.json()).error.fieldErrors.coverImageId).toBeTruthy();
    });

    it("returns 409 when a draft rename collides", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockImplementation(
        async ({ where }: { where: { id?: string; slug?: string } }) =>
          where.slug ? (where.slug === "taken-slug" ? { id: "p0" } : null) : { ...basePost },
      );
      mocks.postFindFirst.mockResolvedValue({ id: "p0" });
      const response = await PATCH(
        request("http://localhost/api/admin/posts/p1", "PATCH", { slug: "taken-slug" }),
        context("p1"),
      );
      expect(response.status).toBe(409);
      expect((await response.json()).error.suggestion).toBe("taken-slug-2");
    });

    it("updates only the provided fields", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost });
      const response = await PATCH(
        request("http://localhost/api/admin/posts/p1", "PATCH", { excerpt: "Fresh excerpt" }),
        context("p1"),
      );
      expect(response.status).toBe(200);
      const data = mocks.postUpdate.mock.calls[0][0].data;
      expect(data.excerpt).toBe("Fresh excerpt");
      expect(data.updatedBy).toBe("editor_1");
      expect(data).not.toHaveProperty("title");
      expect(data).not.toHaveProperty("disclaimer");
      expect(data).not.toHaveProperty("content");
      expect(data).not.toHaveProperty("noindex");
      expect(mocks.revalidateTag).not.toHaveBeenCalled();
    });

    it("persists the noindex flag when provided", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost });
      const response = await PATCH(
        request("http://localhost/api/admin/posts/p1", "PATCH", { noindex: true }),
        context("p1"),
      );
      expect(response.status).toBe(200);
      expect(mocks.postUpdate.mock.calls[0][0].data.noindex).toBe(true);
    });

    it("recomputes stats and revalidates when editing published content", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, status: "PUBLISHED" });
      const response = await PATCH(
        request("http://localhost/api/admin/posts/p1", "PATCH", { content: docContent }),
        context("p1"),
      );
      expect(response.status).toBe(200);
      const data = mocks.postUpdate.mock.calls[0][0].data;
      expect(data.plainText).toContain("Hello world body content");
      expect(data.readingTime).toBe(1);
      expect(mocks.revalidateTag).toHaveBeenCalledWith("post:understanding-ivf", { expire: 0 });
      expect(mocks.revalidateTag).toHaveBeenCalledWith("blog", { expire: 0 });
    });
  });

  describe("DELETE /api/admin/posts/:id", () => {
    it("returns 404 for a missing post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await DELETE(request("http://localhost/api/admin/posts/x", "DELETE"), context("x"));
      expect(response.status).toBe(404);
    });

    it("deletes and revalidates", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost });
      const response = await DELETE(request("http://localhost/api/admin/posts/p1", "DELETE"), context("p1"));
      expect(response.status).toBe(204);
      expect(mocks.postDelete).toHaveBeenCalledWith({ where: { id: "p1" } });
      expect(mocks.revalidateTag).toHaveBeenCalledWith("post:understanding-ivf", { expire: 0 });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(expect.stringContaining('"evt":"post_deleted"'));
    });
  });

  describe("POST /api/admin/posts/:id/publish", () => {
    it("returns 422 with fieldErrors for a missing disclaimer and cover", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/p1/publish", "POST", {
          ...publishablePost,
          disclaimer: "",
          coverImageId: null,
        }),
        context("p1"),
      );
      expect(response.status).toBe(422);
      const payload = await response.json();
      expect(payload.error.code).toBe("validation");
      expect(payload.error.fieldErrors.disclaimer).toBeTruthy();
      expect(payload.error.fieldErrors.coverImageId).toBeTruthy();
      expect(mocks.postUpdate).not.toHaveBeenCalled();
    });

    it("returns 422 when the content has no real blocks", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/p1/publish", "POST", {
          ...publishablePost,
          content: { type: "doc", content: [{ type: "paragraph" }] },
        }),
        context("p1"),
      );
      expect(response.status).toBe(422);
      expect((await response.json()).error.fieldErrors.content).toBeTruthy();
    });

    it("returns 422 when the reviewer is missing", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/p1/publish", "POST", {
          ...publishablePost,
          reviewerName: null,
          reviewerCredential: null,
        }),
        context("p1"),
      );
      expect(response.status).toBe(422);
      const payload = await response.json();
      expect(payload.error.fieldErrors.reviewerName).toBeTruthy();
      expect(payload.error.fieldErrors.reviewerCredential).toBeTruthy();
      expect(mocks.postUpdate).not.toHaveBeenCalled();
    });

    it("returns 404 for a missing post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/x/publish", "POST", publishablePost),
        context("x"),
      );
      expect(response.status).toBe(404);
    });

    it("returns 422 when the cover image is narrower than 1200px", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost });
      mocks.mediaFindUnique.mockResolvedValue({ id: "media_1", width: 800 });
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/p1/publish", "POST", publishablePost),
        context("p1"),
      );
      expect(response.status).toBe(422);
      const payload = await response.json();
      expect(payload.error.fieldErrors.coverImageId).toContain("1200");
      expect(payload.error.fieldErrors.coverImageId).toContain("800");
      expect(mocks.postUpdate).not.toHaveBeenCalled();
    });

    it("locks the slug on an already-published post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, status: "PUBLISHED" });
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/p1/publish", "POST", { ...publishablePost, slug: "other" }),
        context("p1"),
      );
      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe("slug_locked");
    });

    it("publishes a draft with audit fields and revalidation", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost });
      mocks.postUpdate.mockResolvedValue({
        slug: "understanding-ivf",
        status: "PUBLISHED",
        publishedAt: new Date("2026-10-01"),
        updatedAt: new Date("2026-10-01"),
      });
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/p1/publish", "POST", publishablePost),
        context("p1"),
      );
      expect(response.status).toBe(200);
      const payload = await response.json();
      expect(payload.status).toBe("PUBLISHED");
      const data = mocks.postUpdate.mock.calls[0][0].data;
      expect(data.status).toBe("PUBLISHED");
      expect(data.publishedAt).toBeInstanceOf(Date);
      expect(data.publishedBy).toBe("editor_1");
      expect(data.updatedBy).toBe("editor_1");
      expect(data.plainText).toContain("Hello world body content");
      expect(data.noindex).toBe(false);
      expect(mocks.revalidateTag).toHaveBeenCalledWith("post:understanding-ivf", { expire: 0 });
      expect(mocks.revalidateTag).toHaveBeenCalledWith("blog", { expire: 0 });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(expect.stringContaining('"evt":"publish"'));
    });

    it("rejects a publish that would collide with another post slug", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, slug: "old-slug" });
      mocks.postFindFirst.mockResolvedValue({ id: "p0" });
      const response = await publishPOST(
        request("http://localhost/api/admin/posts/p1/publish", "POST", publishablePost),
        context("p1"),
      );
      expect(response.status).toBe(409);
      expect(mocks.postUpdate).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/posts/:id/unpublish", () => {
    it("returns 404 for a missing post", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      const response = await unpublishPOST(request("http://localhost/api/admin/posts/x/unpublish", "POST"), context("x"));
      expect(response.status).toBe(404);
    });

    it("returns 409 when the post is already a draft", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, status: "DRAFT" });
      const response = await unpublishPOST(
        request("http://localhost/api/admin/posts/p1/unpublish", "POST"),
        context("p1"),
      );
      expect(response.status).toBe(409);
      expect((await response.json()).error.code).toBe("already_draft");
    });

    it("moves a published post back to draft and revalidates", async () => {
      mocks.auth.mockResolvedValue(session("EDITOR", false));
      mocks.postFindUnique.mockResolvedValue({ ...basePost, status: "PUBLISHED" });
      mocks.postUpdate.mockResolvedValue({ id: "p1", slug: "understanding-ivf", status: "DRAFT" });
      const response = await unpublishPOST(
        request("http://localhost/api/admin/posts/p1/unpublish", "POST"),
        context("p1"),
      );
      expect(response.status).toBe(200);
      const data = mocks.postUpdate.mock.calls[0][0];
      expect(data.data.status).toBe("DRAFT");
      expect(data.data.updatedBy).toBe("editor_1");
      expect(mocks.revalidateTag).toHaveBeenCalledWith("post:understanding-ivf", { expire: 0 });
      expect(vi.mocked(console.info)).toHaveBeenCalledWith(expect.stringContaining('"evt":"post_unpublished"'));
    });
  });
});

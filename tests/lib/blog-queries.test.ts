import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  postFindMany: vi.fn(),
  postCount: vi.fn(),
  postFindFirst: vi.fn(),
  categoryFindUnique: vi.fn(),
  categoryFindMany: vi.fn(),
  configs: [] as { keyParts: string[]; options: { revalidate?: number; tags?: string[] } }[],
}));

vi.mock("next/cache", () => ({
  unstable_cache: (
    fn: (...args: never[]) => Promise<unknown>,
    keyParts: string[],
    options: { revalidate?: number; tags?: string[] },
  ) => {
    mocks.configs.push({ keyParts, options });
    return async (...args: never[]) =>
      JSON.parse(JSON.stringify(await fn(...args))) as Awaited<ReturnType<typeof fn>>;
  },
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    post: { findMany: mocks.postFindMany, count: mocks.postCount, findFirst: mocks.postFindFirst },
    category: { findUnique: mocks.categoryFindUnique, findMany: mocks.categoryFindMany },
  }),
}));

import {
  BLOG_PAGE_SIZE,
  getBlogCategories,
  getBlogCategory,
  getBlogIndex,
  getPostBySlug,
  getRelatedPosts,
  getRssPosts,
  searchPublishedPosts,
} from "@/lib/blog/queries";

const card = {
  id: "p1",
  title: "Understanding IVF",
  slug: "understanding-ivf",
  excerpt: "A guide",
  publishedAt: new Date("2026-01-01"),
  readingTime: 5,
  category: { name: "IVF", slug: "ivf" },
  coverImage: { url: "https://blob.vercel-storage.com/media/a.png", width: 1600, height: 900, altText: null, isDecorative: false },
};

describe("blog queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.configs.length = 0;
    mocks.postFindMany.mockResolvedValue([card]);
    mocks.postCount.mockResolvedValue(1);
    mocks.postFindFirst.mockResolvedValue({
      ...card,
      categoryId: "c1",
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
      reviewedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    mocks.categoryFindUnique.mockResolvedValue({ name: "IVF", slug: "ivf", description: null });
    mocks.categoryFindMany.mockResolvedValue([
      { name: "IVF", slug: "ivf", _count: { posts: 3 } },
    ]);
  });

  it("queries published posts newest-first for the index with blog tag and 60s revalidate", async () => {
    const result = await getBlogIndex(2);
    expect(result.total).toBe(1);
    expect(result.items[0].publishedAt).toBeInstanceOf(Date);
    expect(mocks.postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        skip: BLOG_PAGE_SIZE,
        take: BLOG_PAGE_SIZE,
      }),
    );
    expect(mocks.configs[0]).toEqual({
      keyParts: ["blog-index"],
      options: { revalidate: 60, tags: ["blog"] },
    });
  });

  it("returns null for an unknown category", async () => {
    mocks.categoryFindUnique.mockResolvedValue(null);
    expect(await getBlogCategory("ghost", 1)).toBeNull();
    expect(mocks.postFindMany).not.toHaveBeenCalled();
  });

  it("scopes category pages to the category slug", async () => {
    const result = await getBlogCategory("ivf", 1);
    expect(result?.category.name).toBe("IVF");
    expect(mocks.postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED", category: { slug: "ivf" } },
      }),
    );
  });

  it("searches title and plain text case-insensitively without caching", async () => {
    const result = await searchPublishedPosts("implantation", 1);
    expect(result.items).toHaveLength(1);
    expect(mocks.postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: "implantation", mode: "insensitive" } },
            { plainText: { contains: "implantation", mode: "insensitive" } },
          ],
        },
      }),
    );
    expect(mocks.configs).toHaveLength(0);
  });

  it("fetches only published posts by slug with post tag + blog tag", async () => {
    const post = await getPostBySlug("understanding-ivf");
    expect(post).not.toBeNull();
    expect(post!.publishedAt).toBeInstanceOf(Date);
    expect(post!.updatedAt).toBeInstanceOf(Date);
    expect(post!.reviewedAt).toBeInstanceOf(Date);
    expect(mocks.postFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "understanding-ivf", status: "PUBLISHED" },
      }),
    );
    const select = mocks.postFindFirst.mock.calls[0][0].select as Record<string, unknown>;
    expect(select.plainText).toBe(true);
    expect(select.updatedAt).toBe(true);
    expect(select.createdByUser).toEqual({ select: { name: true } });
    expect(mocks.configs[0]).toEqual({
      keyParts: ["blog-post"],
      options: { revalidate: 300, tags: ["blog", "post:understanding-ivf"] },
    });
  });

  it("returns null for a draft or missing slug", async () => {
    mocks.postFindFirst.mockResolvedValue(null);
    expect(await getPostBySlug("secret-draft")).toBeNull();
  });

  it("limits related posts to 3 from the same category, excluding self", async () => {
    await getRelatedPosts("understanding-ivf", "c1");
    expect(mocks.postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED", category: { id: "c1" }, slug: { not: "understanding-ivf" } },
        take: 3,
      }),
    );
  });

  it("maps category counts for the nav", async () => {
    const categories = await getBlogCategories();
    expect(categories).toEqual([{ name: "IVF", slug: "ivf", publishedCount: 3 }]);
    expect(mocks.categoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    );
  });

  it("limits the RSS query to the newest 20 published posts with an 1800s cache", async () => {
    await getRssPosts();
    expect(mocks.postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20, where: { status: "PUBLISHED" } }),
    );
    const select = mocks.postFindMany.mock.calls[0][0].select as Record<string, unknown>;
    expect(select.plainText).toBe(true);
    expect(select.metaDescription).toBeUndefined();
    expect(mocks.configs[0]).toEqual({
      keyParts: ["blog-rss"],
      options: { revalidate: 1800, tags: ["blog"] },
    });
  });
});

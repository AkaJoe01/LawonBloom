import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  postFindMany: vi.fn(),
  categoryFindMany: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache:
    (fn: (...args: never[]) => Promise<unknown>) =>
    async (...args: never[]) =>
      JSON.parse(JSON.stringify(await fn(...args))),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: () => ({
    post: { findMany: mocks.postFindMany },
    category: { findMany: mocks.categoryFindMany },
  }),
}));

import {
  categorySitemapEntries,
  getSitemapData,
  isStaticSitemapRoute,
  postSitemapEntries,
  staticSitemapEntries,
} from "@/lib/sitemap";
import { SITE_ROUTES } from "@/lib/routes";
import { APEX, SITE_PAGE_CATALOG } from "@/lib/seo";

describe("isStaticSitemapRoute", () => {
  it("excludes admin, dynamic, and search routes", () => {
    expect(isStaticSitemapRoute("/")).toBe(true);
    expect(isStaticSitemapRoute("/blog")).toBe(true);
    expect(isStaticSitemapRoute("/admin")).toBe(false);
    expect(isStaticSitemapRoute("/admin/posts/new")).toBe(false);
    expect(isStaticSitemapRoute("/blog/[slug]")).toBe(false);
    expect(isStaticSitemapRoute("/blog/category/[slug]")).toBe(false);
    expect(isStaticSitemapRoute("/blog/search")).toBe(false);
  });
});

describe("staticSitemapEntries", () => {
  it("covers every public static route with apex URLs and no placeholders", () => {
    const entries = staticSitemapEntries();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(APEX);
    expect(urls).toContain(`${APEX}/blog`);
    expect(urls).toContain(`${APEX}/clinical-excellence/ivf`);
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
    expect(urls.some((url) => url.includes("[") || url.includes("]"))).toBe(false);
    expect(urls.some((url) => url.includes("/blog/search"))).toBe(false);
    expect(urls.some((url) => url.includes("/blog/category/"))).toBe(false);

    const expected = SITE_ROUTES.filter(isStaticSitemapRoute).length;
    expect(entries).toHaveLength(expected);
    expect(expected).toBeGreaterThanOrEqual(23);
  });

  it("prioritises home above the blog index above supporting pages", () => {
    const entries = staticSitemapEntries();
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));
    expect(byUrl.get(APEX)!.priority).toBe(1);
    expect(byUrl.get(`${APEX}/blog`)!.priority).toBe(0.9);
    expect(byUrl.get(`${APEX}/blog`)!.changeFrequency).toBe("weekly");
    expect(byUrl.get(`${APEX}/faq`)!.priority).toBe(0.7);
  });

  it("omits lastModified on static entries and matches the SEO catalog (Q16)", () => {
    const entries = staticSitemapEntries();
    expect(entries).toHaveLength(24);
    for (const entry of entries) {
      expect(entry).not.toHaveProperty("lastModified");
    }
    const expected = new Set([
      APEX,
      ...Object.keys(SITE_PAGE_CATALOG).map((path) => `${APEX}${path}`),
      `${APEX}/blog`,
    ]);
    expect(new Set(entries.map((entry) => entry.url))).toEqual(expected);
  });
});

describe("dynamic sitemap entries", () => {
  it("maps posts with lastModified from updatedAt", () => {
    const updatedAt = new Date("2026-02-01T10:00:00.000Z");
    expect(postSitemapEntries([{ slug: "ivf-101", updatedAt }])).toEqual([
      {
        url: `${APEX}/blog/ivf-101`,
        lastModified: updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      },
    ]);
  });

  it("maps category hubs as weekly", () => {
    expect(categorySitemapEntries([{ slug: "ivf" }])).toEqual([
      {
        url: `${APEX}/blog/category/ivf`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ]);
  });
});

describe("getSitemapData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.postFindMany.mockResolvedValue([{ slug: "a", updatedAt: new Date() }]);
    mocks.categoryFindMany.mockResolvedValue([{ slug: "ivf" }]);
  });

  it("queries only published posts and every category, cached for a day", async () => {
    const data = await getSitemapData();
    expect(data.posts).toHaveLength(1);
    expect(data.posts[0].updatedAt).toBeInstanceOf(Date);
    expect(data.categories).toEqual([{ slug: "ivf" }]);
    expect(mocks.postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
    );
    expect(mocks.categoryFindMany).toHaveBeenCalledWith({ select: { slug: true } });
  });
});

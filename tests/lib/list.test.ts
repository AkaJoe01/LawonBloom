import { describe, expect, it } from "vitest";
import { POSTS_PAGE_SIZE, postListOrderBy, postListWhere } from "@/lib/posts/list";
import { postListQuery } from "@/lib/validation/post";

describe("postListWhere", () => {
  it("returns an empty filter when nothing is set", () => {
    expect(postListWhere(postListQuery.parse({}))).toEqual({});
  });

  it("filters by status", () => {
    expect(postListWhere(postListQuery.parse({ status: "DRAFT" }))).toEqual({ status: "DRAFT" });
  });

  it("filters by category slug", () => {
    expect(postListWhere(postListQuery.parse({ category: "ivf" }))).toEqual({
      category: { slug: "ivf" },
    });
  });

  it("filters by title with case-insensitive search", () => {
    expect(postListWhere(postListQuery.parse({ q: "ivf" }))).toEqual({
      title: { contains: "ivf", mode: "insensitive" },
    });
  });

  it("combines all filters and applies the page default", () => {
    const query = postListQuery.parse({ status: "PUBLISHED", category: "iui", q: "cycle" });
    expect(query.page).toBe(1);
    expect(postListWhere(query)).toEqual({
      status: "PUBLISHED",
      category: { slug: "iui" },
      title: { contains: "cycle", mode: "insensitive" },
    });
  });
});

describe("postListOrderBy", () => {
  it("sorts by title ascending by default", () => {
    expect(postListOrderBy("title", undefined)).toEqual({ title: "asc" });
    expect(postListOrderBy("title", "asc")).toEqual({ title: "asc" });
  });

  it("sorts by title descending on demand", () => {
    expect(postListOrderBy("title", "desc")).toEqual({ title: "desc" });
  });

  it("sorts published posts newest-first unless ascending is requested", () => {
    expect(postListOrderBy("published", undefined)).toEqual({ publishedAt: "desc" });
    expect(postListOrderBy("published", "desc")).toEqual({ publishedAt: "desc" });
    expect(postListOrderBy("published", "asc")).toEqual({ publishedAt: "asc" });
  });

  it("falls back to updatedAt newest-first", () => {
    expect(postListOrderBy(undefined, undefined)).toEqual({ updatedAt: "desc" });
    expect(postListOrderBy("unknown", "desc")).toEqual({ updatedAt: "desc" });
    expect(postListOrderBy(undefined, "asc")).toEqual({ updatedAt: "asc" });
    expect(postListOrderBy(undefined, "nonsense")).toEqual({ updatedAt: "desc" });
  });
});

describe("POSTS_PAGE_SIZE", () => {
  it("matches the plan's 10-per-page list size", () => {
    expect(POSTS_PAGE_SIZE).toBe(10);
  });
});

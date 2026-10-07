import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/categories";

describe("CATEGORIES", () => {
  it("exposes six seeded categories", () => {
    expect(CATEGORIES).toHaveLength(6);
  });

  it("has unique slugs with populated copy", () => {
    const slugs = CATEGORIES.map((category) => category.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const category of CATEGORIES) {
      expect(category.name.trim().length).toBeGreaterThan(0);
      expect(category.description.trim().length).toBeGreaterThan(0);
    }
  });
});

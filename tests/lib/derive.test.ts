import { describe, expect, it } from "vitest";
import { computeReadingTime, derivePlainText, slugify, suggestUniqueSlug } from "../../lib/posts/derive";
import type { TiptapDoc } from "../../lib/validation/post";

const doc = (content: unknown[]): TiptapDoc => ({ type: "doc", content }) as TiptapDoc;

describe("derivePlainText", () => {
  it("extracts text across nested blocks", () => {
    const plain = derivePlainText(
      doc([
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "IVF basics" }] },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "In-vitro" },
            { type: "text", text: " fertilization", marks: [{ type: "bold" }] },
          ],
        },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "First step" }] }] },
          ],
        },
      ]),
    );
    expect(plain).toBe("IVF basics In-vitro fertilization First step");
  });

  it("returns an empty string for non-text content", () => {
    expect(derivePlainText(doc([{ type: "paragraph" }]))).toBe("");
    expect(derivePlainText(doc([{ type: "horizontalRule" }]))).toBe("");
  });
});

describe("computeReadingTime", () => {
  it("rounds up to a minimum of 1 minute", () => {
    expect(computeReadingTime("")).toBe(1);
    expect(computeReadingTime(Array.from({ length: 220 }, () => "word").join(" "))).toBe(1);
    expect(computeReadingTime(Array.from({ length: 221 }, () => "word").join(" "))).toBe(2);
    expect(computeReadingTime(Array.from({ length: 440 }, () => "word").join(" "))).toBe(2);
    expect(computeReadingTime(Array.from({ length: 441 }, () => "word").join(" "))).toBe(3);
  });
});

describe("slugify", () => {
  it("lowercases, hyphenates, and strips edges", () => {
    expect(slugify("  IVF: What to Expect!  ")).toBe("ivf-what-to-expect");
    expect(slugify("Emma's Journey — Week One")).toBe("emma-s-journey-week-one");
  });

  it("falls back safely for degenerate titles", () => {
    expect(slugify("!!!")).toBe("post");
    expect(slugify("ab")).toBe("ab");
  });

  it("respects the slug length cap", () => {
    const slug = slugify(Array.from({ length: 40 }, () => "word").join(" "));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("suggestUniqueSlug", () => {
  it("returns the base slug when free", async () => {
    const result = await suggestUniqueSlug("ivf-basics", async () => false);
    expect(result).toBe("ivf-basics");
  });

  it("appends the first free numeric suffix", async () => {
    const taken = new Set(["ivf-basics", "ivf-basics-2"]);
    const result = await suggestUniqueSlug("ivf-basics", async (slug) => taken.has(slug));
    expect(result).toBe("ivf-basics-3");
  });

  it("keeps suffixed slugs within the length cap", async () => {
    const base = "a".repeat(80);
    const result = await suggestUniqueSlug(base, async (slug) => slug === base);
    expect(result).toHaveLength(80);
    expect(result.endsWith("-2")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { hasBlockContent, postCreate, postListQuery, postPublish, tiptapDocSchema } from "../../lib/validation/post";

const paragraph = (text: string) => ({
  type: "paragraph",
  content: [{ type: "text", text }],
});

const fullDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Understanding IVF" }] },
    paragraph("A long enough body paragraph for the post."),
  ],
};

const validBase = {
  title: "Understanding IVF",
  slug: "understanding-ivf",
  excerpt: "A short summary.",
  content: fullDoc,
  categoryId: "clxyz1234",
  coverImageId: null,
  disclaimer: "",
  reviewerName: null,
  reviewerCredential: null,
  reviewedAt: null,
  faqs: [],
  metaTitle: null,
  metaDescription: null,
};

describe("tiptapDocSchema (closed-world allowlist)", () => {
  it("accepts the standard block set", () => {
    const result = tiptapDocSchema.safeParse({
      type: "doc",
      content: [
        paragraph("Plain paragraph."),
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "H3" }] },
        { type: "blockquote", content: [paragraph("Quoted.")] },
        { type: "horizontalRule" },
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [paragraph("One")] }],
        },
        {
          type: "orderedList",
          content: [{ type: "listItem", content: [paragraph("First")] }],
        },
        {
          type: "image",
          attrs: { src: "https://cdn.example.com/x.png", alt: "Scan", "data-decorative": false, caption: "Day 5" },
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                { type: "tableHeader", content: [paragraph("Day")] },
                { type: "tableCell", content: [paragraph("5")] },
              ],
            },
          ],
        },
        { type: "callout", attrs: { variant: "medical" }, content: [paragraph("Medical note.")] },
        {
          type: "embed",
          attrs: { provider: "youtube", url: "https://www.youtube-nocookie.com/embed/abc12345" },
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown node types (codeBlock, columns, hardBreak)", () => {
    for (const bad of [
      { type: "codeBlock", content: [paragraph("x")] },
      { type: "columns" },
      { type: "hardBreak" },
      { type: "htmlNode" },
    ]) {
      const result = tiptapDocSchema.safeParse({ type: "doc", content: [bad] });
      expect(result.success).toBe(false);
    }
  });

  it("rejects unknown marks and unsafe link protocols", () => {
    const withMark = (mark: unknown) => ({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "hi", marks: [mark] }] }],
    });
    expect(tiptapDocSchema.safeParse(withMark({ type: "strike" })).success).toBe(false);
    expect(
      tiptapDocSchema.safeParse(
        withMark({ type: "link", attrs: { href: "javascript:alert(1)" } }),
      ).success,
    ).toBe(false);
    expect(
      tiptapDocSchema.safeParse(withMark({ type: "link", attrs: { href: "https://ok.example" } })).success,
    ).toBe(true);
    expect(
      tiptapDocSchema.safeParse(withMark({ type: "link", attrs: { href: "/journey" } })).success,
    ).toBe(true);
  });

  it("rejects headings other than h2/h3 and level-1 structure", () => {
    const h1 = { type: "doc", content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "x" }] }] };
    expect(tiptapDocSchema.safeParse(h1).success).toBe(false);
    const h4 = { type: "doc", content: [{ type: "heading", attrs: { level: 4 }, content: [{ type: "text", text: "x" }] }] };
    expect(tiptapDocSchema.safeParse(h4).success).toBe(false);
  });

  it("rejects embed URLs outside the allowlist or paired with the wrong provider", () => {
    const embed = (provider: string, url: string) => ({
      type: "doc",
      content: [{ type: "embed", attrs: { provider, url } }],
    });
    expect(tiptapDocSchema.safeParse(embed("youtube", "https://www.youtube.com/embed/abc12345")).success).toBe(false);
    expect(tiptapDocSchema.safeParse(embed("youtube", "https://evil.example.com/embed/abc12345")).success).toBe(false);
    expect(tiptapDocSchema.safeParse(embed("youtube", "https://player.vimeo.com/video/12345")).success).toBe(false);
    expect(tiptapDocSchema.safeParse(embed("vimeo", "https://www.youtube-nocookie.com/embed/abc12345")).success).toBe(false);
    expect(tiptapDocSchema.safeParse(embed("youtube", "https://www.youtube-nocookie.com/embed/abc12345")).success).toBe(true);
    expect(tiptapDocSchema.safeParse(embed("vimeo", "https://player.vimeo.com/video/12345")).success).toBe(true);
  });

  it("rejects empty documents", () => {
    expect(tiptapDocSchema.safeParse({ type: "doc", content: [] }).success).toBe(false);
  });
});

describe("postCreate", () => {
  it("accepts a valid payload with defaults applied", () => {
    const result = postCreate.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.disclaimer).toBe("");
      expect(result.data.faqs).toEqual([]);
    }
  });

  it("rejects reserved and malformed slugs", () => {
    expect(postCreate.safeParse({ ...validBase, slug: "admin" }).success).toBe(false);
    expect(postCreate.safeParse({ ...validBase, slug: "Bad Slug" }).success).toBe(false);
    expect(postCreate.safeParse({ ...validBase, slug: "ok-slug" }).success).toBe(true);
  });

  it("enforces title, excerpt, and FAQ bounds", () => {
    expect(postCreate.safeParse({ ...validBase, title: "Hi" }).success).toBe(false);
    expect(postCreate.safeParse({ ...validBase, excerpt: "x".repeat(301) }).success).toBe(false);
    expect(
      postCreate.safeParse({
        ...validBase,
        faqs: [{ question: "Short?", answer: "Tiny." }],
      }).success,
    ).toBe(false);
    expect(
      postCreate.safeParse({
        ...validBase,
        faqs: [{ question: "Is IVF painful?", answer: "Most patients report only mild discomfort." }],
      }).success,
    ).toBe(true);
  });
});

describe("postPublish", () => {
  it("requires disclaimer ≥20, cover, content, and a non-future review date", () => {
    const publishable = {
      ...validBase,
      disclaimer: "Always consult a qualified fertility specialist.",
      coverImageId: "clcover1234",
      reviewedAt: new Date().toISOString(),
      content: { type: "doc", content: [paragraph("Real content here.")] },
    };
    const result = postPublish.safeParse(publishable);
    expect(result.success).toBe(true);

    expect(postPublish.safeParse({ ...publishable, disclaimer: "Too short" }).success).toBe(false);
    expect(postPublish.safeParse({ ...publishable, coverImageId: null }).success).toBe(false);
    expect(
      postPublish.safeParse({ ...publishable, content: { type: "doc", content: [{ type: "paragraph" }] } }).success,
    ).toBe(false);
    expect(
      postPublish.safeParse({ ...publishable, reviewedAt: new Date(Date.now() + 5 * 86400_000).toISOString() }).success,
    ).toBe(false);
  });
});

describe("postListQuery", () => {
  it("coerces and defaults pagination", () => {
    expect(postListQuery.parse({})).toEqual({ page: 1 });
    expect(postListQuery.parse({ page: "3", status: "DRAFT" })).toEqual({ page: 3, status: "DRAFT" });
    expect(postListQuery.safeParse({ page: "0" }).success).toBe(false);
    expect(postListQuery.safeParse({ status: "ARCHIVED" }).success).toBe(false);
  });
});

describe("hasBlockContent", () => {
  it("detects text-bearing and media-only content", () => {
    expect(hasBlockContent({ type: "doc", content: [paragraph("Hello")] })).toBe(true);
    expect(hasBlockContent({ type: "doc", content: [{ type: "horizontalRule" }] })).toBe(true);
    expect(hasBlockContent({ type: "doc", content: [{ type: "paragraph" }] })).toBe(false);
  });
});

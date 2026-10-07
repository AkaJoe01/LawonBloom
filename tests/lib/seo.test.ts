import { describe, expect, it } from "vitest";
import {
  APEX,
  OG_FALLBACK_URL,
  ORG_ID,
  ORG_LOGO_URL,
  ORG_NAME,
  articleJsonLd,
  apexUrl,
  blogAlternates,
  breadcrumbJsonLd,
  buildCategoryMetadata,
  buildIndexMetadata,
  buildPostMetadata,
  clampText,
  faqJsonLd,
  organizationJsonLd,
  pageRobots,
  pickDescription,
  postOgImageUrl,
  postUrl,
  rssDescription,
  serializeJsonLd,
} from "@/lib/seo";

const post = {
  title: "Understanding IVF cycles",
  slug: "understanding-ivf",
  metaTitle: null,
  metaDescription: null,
  excerpt: "A patient-first walkthrough.",
  plainText: "IVF is a multi-step treatment. ".repeat(20),
  publishedAt: new Date("2026-01-15T09:00:00.000Z"),
  updatedAt: new Date("2026-01-17T11:30:00.000Z"),
  categoryName: "IVF",
  authorName: "Dr. Saanu",
};

describe("url helpers", () => {
  it("builds apex URLs", () => {
    expect(apexUrl("/")).toBe(APEX);
    expect(apexUrl("")).toBe(APEX);
    expect(apexUrl("/blog")).toBe(`${APEX}/blog`);
    expect(apexUrl("blog")).toBe(`${APEX}/blog`);
  });

  it("builds post and OG image URLs", () => {
    expect(postUrl("ivf-101")).toBe(`${APEX}/blog/ivf-101`);
    expect(postOgImageUrl("ivf-101")).toBe(`${APEX}/blog/ivf-101/opengraph-image`);
  });
});

describe("clampText / pickDescription / rssDescription", () => {
  it("leaves short text untouched and clamps long text with an ellipsis", () => {
    expect(clampText("  short   text ", 100)).toBe("short text");
    const long = "word ".repeat(60);
    const clamped = clampText(long, 50);
    expect(clamped.length).toBeLessThanOrEqual(50);
    expect(clamped.endsWith("…")).toBe(true);
  });

  it("prefers metaDescription, then excerpt, then plainText", () => {
    expect(pickDescription("meta", "excerpt", "body")).toBe("meta");
    expect(pickDescription(null, "excerpt", "body")).toBe("excerpt");
    expect(pickDescription(null, null, "x".repeat(300))).toHaveLength(155);
    expect(pickDescription(null, null, "")).toBeUndefined();
    expect(pickDescription(undefined, undefined, "body")).toBe("body");
  });

  it("builds RSS descriptions excerpt-first with a 300 char cap", () => {
    expect(rssDescription("excerpt wins", "body")).toBe("excerpt wins");
    expect(rssDescription(null, "body")).toBe("body");
    const capped = rssDescription(null, "z".repeat(400));
    expect(capped).toHaveLength(301);
    expect(capped.startsWith("z".repeat(300))).toBe(true);
    expect(capped.endsWith("…")).toBe(true);
  });
});

describe("alternates and robots", () => {
  it("exposes canonical and RSS discovery", () => {
    expect(blogAlternates("/blog")).toEqual({
      canonical: `${APEX}/blog`,
      types: { "application/rss+xml": `${APEX}/blog/rss.xml` },
    });
  });

  it("noindexes pages beyond the first", () => {
    expect(pageRobots(1)).toBeNull();
    expect(pageRobots(2)).toEqual({ index: false, follow: true });
  });
});

describe("route metadata builders", () => {
  it("builds full article metadata for posts", () => {
    const metadata = buildPostMetadata({ ...post, metaTitle: "IVF, plainly" });
    expect(metadata.title).toBe("IVF, plainly");
    expect(metadata.description).toBe("A patient-first walkthrough.");
    expect(metadata.alternates?.canonical).toBe(`${APEX}/blog/understanding-ivf`);
    const og = metadata.openGraph as unknown as Record<string, unknown>;
    expect(og.type).toBe("article");
    expect(og.publishedTime).toBe("2026-01-15T09:00:00.000Z");
    expect(og.modifiedTime).toBe("2026-01-17T11:30:00.000Z");
    expect(og.authors).toEqual(["Dr. Saanu"]);
    expect(og.section).toBe("IVF");
    expect(og.images).toEqual([
      { url: `${APEX}/blog/understanding-ivf/opengraph-image`, width: 1200, height: 630, alt: post.title },
      { url: OG_FALLBACK_URL, width: 1200, height: 630, alt: ORG_NAME },
    ]);
    expect((metadata.twitter as unknown as Record<string, unknown>).card).toBe(
      "summary_large_image",
    );
  });

  it("falls back to plainText description and omits missing author", () => {
    const metadata = buildPostMetadata({
      ...post,
      excerpt: null,
      plainText: "body ".repeat(100),
      authorName: null,
    });
    expect(metadata.description).toHaveLength(155);
    expect(
      (metadata.openGraph as unknown as Record<string, unknown>).authors,
    ).toBeUndefined();
  });

  it("indexes page 1 of the blog index and noindexes later pages", () => {
    const first = buildIndexMetadata(1);
    expect(first.robots).toBeNull();
    expect(first.alternates?.canonical).toBe(`${APEX}/blog`);
    const second = buildIndexMetadata(2);
    expect(second.robots).toEqual({ index: false, follow: true });
    expect(second.title).toBe("Journal - page 2");
  });

  it("formats category metadata with the required og:title", () => {
    const metadata = buildCategoryMetadata({
      name: "IVF",
      slug: "ivf",
      description: "All about IVF.",
      page: 1,
    });
    expect(metadata.title).toBe("IVF - Lawon Bloom Journal");
    expect(metadata.openGraph?.title).toBe("IVF - Lawon Bloom Journal");
    expect(metadata.description).toBe("All about IVF.");
    expect(metadata.robots).toBeNull();
    expect(buildCategoryMetadata({ name: "X", slug: "x", description: null, page: 3 }).robots).toEqual({
      index: false,
      follow: true,
    });
  });
});

describe("JSON-LD builders", () => {
  it("emits one Organization node with a stable @id", () => {
    const org = organizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(org["@id"]).toBe(ORG_ID);
    expect(org.logo).toEqual({ "@type": "ImageObject", url: ORG_LOGO_URL, width: 512, height: 512 });
  });

  it("builds an Article with publisher reference and ISO dates", () => {
    const article = articleJsonLd({
      title: "T".repeat(150),
      description: "desc",
      slug: "long-post",
      publishedAt: new Date("2026-03-12T09:00:00.000Z"),
      updatedAt: new Date("2026-03-14T11:20:00.000Z"),
      authorName: "Dr. Saanu",
      reviewerName: null,
      reviewerCredential: null,
    });
    expect(article.headline).toHaveLength(110);
    expect(article.datePublished).toBe("2026-03-12T09:00:00.000Z");
    expect(article.dateModified).toBe("2026-03-14T11:20:00.000Z");
    expect(article.author).toEqual({ "@type": "Person", name: "Dr. Saanu" });
    expect(article.publisher).toMatchObject({ "@id": ORG_ID });
    expect(article.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": `${APEX}/blog/long-post`,
    });
    expect(article.reviewedBy).toBeUndefined();
  });

  it("adds reviewedBy only when populated, with credential as jobTitle", () => {
    const withReviewer = articleJsonLd({
      title: "t",
      description: "d",
      slug: "s",
      publishedAt: null,
      updatedAt: new Date(),
      authorName: null,
      reviewerName: "Dr. Aminu",
      reviewerCredential: "MBBS, FMCOG",
    });
    expect(withReviewer.reviewedBy).toEqual({
      "@type": "Person",
      name: "Dr. Aminu",
      jobTitle: "MBBS, FMCOG",
    });
    expect(withReviewer.author).toEqual({ "@type": "Person", name: ORG_NAME });
    expect(withReviewer.datePublished).toBe(withReviewer.dateModified);

    const noCredential = articleJsonLd({
      title: "t",
      description: "d",
      slug: "s",
      publishedAt: null,
      updatedAt: new Date(),
      authorName: null,
      reviewerName: "Dr. Aminu",
      reviewerCredential: null,
    });
    expect(noCredential.reviewedBy).toEqual({ "@type": "Person", name: "Dr. Aminu" });
  });

  it("returns null FAQPage for no FAQs and shapes real ones", () => {
    expect(faqJsonLd([])).toBeNull();
    const faq = faqJsonLd([{ question: "Is IVF painful?", answer: "Most patients report mild discomfort." }])!;
    expect(faq["@type"]).toBe("FAQPage");
    const entities = faq.mainEntity as Record<string, unknown>[];
    expect(entities[0]).toEqual({
      "@type": "Question",
      name: "Is IVF painful?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most patients report mild discomfort.",
      },
    });
  });

  it("builds breadcrumbs with 1-based positions and apex URLs", () => {
    const crumbs = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "Post", path: "/blog/some-post" },
    ]);
    expect(crumbs.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: APEX },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${APEX}/blog` },
      { "@type": "ListItem", position: 3, name: "Post", item: `${APEX}/blog/some-post` },
    ]);
  });

  it("serializes JSON-LD without allowing script breakout", () => {
    const serialized = serializeJsonLd({
      "@type": "Article",
      description: "</script><script>alert(1)</script>",
    });
    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
    expect(JSON.parse(serialized).description).toContain("</script>");
  });
});

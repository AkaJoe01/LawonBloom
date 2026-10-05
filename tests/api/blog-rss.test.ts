import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getRssPosts: vi.fn() }));

vi.mock("@/lib/blog/queries", () => ({ getRssPosts: mocks.getRssPosts }));

import { GET } from "../../app/(site)/blog/rss.xml/route";

describe("GET /blog/rss.xml", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getRssPosts.mockResolvedValue([
      {
        title: "IVF & IUI basics",
        slug: "ivf-iui-basics",
        excerpt: "Explaining <both> treatments",
        publishedAt: new Date("2026-01-15T12:00:00.000Z"),
        metaDescription: null,
        category: { name: "Treatments" },
      },
      {
        title: "Draft-looking post without a date",
        slug: "no-date",
        excerpt: null,
        publishedAt: null,
        metaDescription: null,
        category: { name: "Treatments" },
      },
    ]);
  });

  it("serves an RSS feed with escaped XML and cache headers", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/rss+xml; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("public, s-maxage=1800");

    const body = await response.text();
    expect(body).toContain("<rss version=\"2.0\"");
    expect(body).toContain("<title>Lawon Bloom Fertility Centre Journal</title>");
    expect(body).toContain("<title>IVF &amp; IUI basics</title>");
    expect(body).toContain("<description>Explaining &lt;both&gt; treatments</description>");
    expect(body).toContain("https://lawonbloomfertilitycentre.com/blog/ivf-iui-basics");
    expect(body).toContain("<pubDate>Thu, 15 Jan 2026 12:00:00 GMT</pubDate>");
    expect(body).toContain('<atom:link href="https://lawonbloomfertilitycentre.com/blog/rss.xml"');
  });

  it("skips posts without a publish date", async () => {
    const body = await (await GET()).text();
    expect(body).not.toContain("no-date");
  });

  it("serves a valid empty feed when the query fails instead of a 500", async () => {
    mocks.getRssPosts.mockRejectedValue(new Error("db down"));
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain("<channel>");
    expect(body).not.toContain("<item>");
    expect(body).toContain("</rss>");
  });
});

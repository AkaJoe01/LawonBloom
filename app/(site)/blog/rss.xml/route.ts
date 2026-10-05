import { getRssPosts } from "@/lib/blog/queries";

const SITE_URL = "https://lawonbloomfertilitycentre.com";

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET(): Promise<Response> {
  let posts: Awaited<ReturnType<typeof getRssPosts>> = [];
  try {
    posts = await getRssPosts();
  } catch {
    posts = [];
  }

  const items = posts
    .filter((post) => post.publishedAt)
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      const description = post.metaDescription ?? post.excerpt ?? post.title;
      return [
        "    <item>",
        `      <title>${esc(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <category>${esc(post.category.name)}</category>`,
        `      <pubDate>${new Date(post.publishedAt as Date).toUTCString()}</pubDate>`,
        `      <description>${esc(description)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Lawon Bloom Fertility Centre Journal</title>",
    `    <link>${SITE_URL}/blog</link>`,
    "    <description>Evidence-based fertility guidance from the Lawon Bloom clinical team in Ibadan.</description>",
    "    <language>en</language>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=1800",
    },
  });
}

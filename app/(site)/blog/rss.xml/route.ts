import { getRssPosts } from "@/lib/blog/queries";
import { rssDescription } from "@/lib/seo";

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
      const description = rssDescription(post.excerpt, post.plainText);
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

  const newest = posts.reduce<Date | null>(
    (latest, post) =>
      post.publishedAt && (!latest || post.publishedAt > latest) ? post.publishedAt : latest,
    null,
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Lawon Bloom Fertility Centre Journal</title>",
    `    <link>${SITE_URL}/blog</link>`,
    "    <description>Evidence-based fertility guidance from the Lawon Bloom clinical team in Ibadan.</description>",
    "    <language>en-ng</language>",
    `    <lastBuildDate>${(newest ?? new Date()).toUTCString()}</lastBuildDate>`,
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

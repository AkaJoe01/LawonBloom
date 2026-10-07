import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { BLOG_TAG } from "@/lib/cache";
import { getDb } from "@/lib/db";
import { SITE_ROUTES } from "@/lib/routes";
import { apexUrl } from "@/lib/seo";

const EXCLUDED_STATIC = new Set(["/blog/search"]);

export function isStaticSitemapRoute(route: string): boolean {
  if (route.startsWith("/admin")) return false;
  if (route.includes("[")) return false;
  if (EXCLUDED_STATIC.has(route)) return false;
  return true;
}

function routePriority(path: string): number {
  if (path === "/") return 1;
  if (path === "/blog") return 0.9;
  if (path.startsWith("/clinical-excellence") || path.startsWith("/journey")) return 0.8;
  return 0.7;
}

export function staticSitemapEntries(): MetadataRoute.Sitemap {
  return SITE_ROUTES.filter(isStaticSitemapRoute).map((path) => ({
    url: apexUrl(path),
    changeFrequency: path === "/blog" ? ("weekly" as const) : ("monthly" as const),
    priority: routePriority(path),
  }));
}

export interface SitemapPost {
  slug: string;
  updatedAt: Date;
}

export interface SitemapCategory {
  slug: string;
}

async function fetchSitemapData(): Promise<{
  posts: SitemapPost[];
  categories: SitemapCategory[];
}> {
  const db = getDb();
  const [posts, categories] = await Promise.all([
    db.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({ select: { slug: true } }),
  ]);
  return { posts, categories };
}

export async function getSitemapData(): Promise<{
  posts: SitemapPost[];
  categories: SitemapCategory[];
}> {
  const data = await unstable_cache(fetchSitemapData, ["sitemap-data"], {
    revalidate: 86400,
    tags: [BLOG_TAG],
  })();
  return {
    posts: data.posts.map((post) => ({
      slug: post.slug,
      updatedAt:
        post.updatedAt instanceof Date ? post.updatedAt : new Date(post.updatedAt),
    })),
    categories: data.categories,
  };
}

export function postSitemapEntries(posts: SitemapPost[]): MetadataRoute.Sitemap {
  return posts.map((post) => ({
    url: apexUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}

export function categorySitemapEntries(
  categories: SitemapCategory[],
): MetadataRoute.Sitemap {
  return categories.map((category) => ({
    url: apexUrl(`/blog/category/${category.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

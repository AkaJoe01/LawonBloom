import type { MetadataRoute } from "next";
import {
  categorySitemapEntries,
  getSitemapData,
  postSitemapEntries,
  staticSitemapEntries,
} from "@/lib/sitemap";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let data: { posts: { slug: string; updatedAt: Date }[]; categories: { slug: string }[] } = {
    posts: [],
    categories: [],
  };
  try {
    data = await getSitemapData();
  } catch {
    data = { posts: [], categories: [] };
  }
  return [
    ...staticSitemapEntries(),
    ...categorySitemapEntries(data.categories),
    ...postSitemapEntries(data.posts),
  ];
}

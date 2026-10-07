import type { Metadata } from "next";
import {
  OG_FALLBACK_URL,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  ORG_NAME,
  RSS_URL,
  SITE_NAME,
  TITLE_SUFFIX,
  apexUrl,
  postOgImageUrl,
  postUrl,
} from "./site";

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function clampText(text: string, maxChars: number): string {
  const flat = collapseWhitespace(text);
  if (flat.length <= maxChars) return flat;
  return `${flat.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

export function pickDescription(
  metaDescription: string | null | undefined,
  excerpt: string | null | undefined,
  plainText: string,
  maxChars = 155,
): string | undefined {
  if (metaDescription) return metaDescription;
  if (excerpt) return excerpt;
  const flat = collapseWhitespace(plainText);
  if (!flat) return undefined;
  return clampText(flat, maxChars);
}

export function rssDescription(
  excerpt: string | null | undefined,
  plainText: string,
  maxChars = 300,
): string {
  if (excerpt) return excerpt;
  const flat = collapseWhitespace(plainText);
  if (flat.length <= maxChars) return flat;
  return `${flat.slice(0, maxChars).trimEnd()}…`;
}

export function blogAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: apexUrl(path),
    types: { "application/rss+xml": RSS_URL },
  };
}

export function pageRobots(page: number): Metadata["robots"] {
  return page > 1 ? { index: false, follow: true } : null;
}

export type RouteType = "home" | "service" | "contact" | "listing" | "legal" | "static";

export interface BuildMetadataInput {
  routeType: RouteType;
  title: string;
  description: string;
  path: string;
  image?: string;
  robots?: Metadata["robots"];
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  if (!input.path.startsWith("/")) {
    throw new Error(`SEO path must start with "/": ${input.path}`);
  }
  if (!input.description.trim()) {
    throw new Error(`SEO description required for ${input.path}`);
  }
  const isHome = input.routeType === "home";
  const fullTitle = isHome ? input.title : `${input.title}${TITLE_SUFFIX}`;
  if (fullTitle.length > 60) {
    throw new Error(`SEO title exceeds 60 chars (${fullTitle.length}): "${fullTitle}"`);
  }
  const description = clampText(input.description, 160);
  const url = apexUrl(input.path);
  const images = [
    {
      url: input.image ?? OG_IMAGE_PATH,
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      alt: ORG_NAME,
    },
  ];
  return {
    title: isHome ? { absolute: input.title } : input.title,
    description,
    alternates: { canonical: url },
    robots: input.robots,
    openGraph: {
      type: "website",
      title: fullTitle,
      description,
      url,
      siteName: ORG_NAME,
      images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

export interface PostMetadataInput {
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  excerpt: string | null;
  plainText: string;
  publishedAt: Date | null;
  updatedAt: Date;
  categoryName: string;
  authorName: string | null;
}

export function buildPostMetadata(post: PostMetadataInput): Metadata {
  const title = post.metaTitle ?? post.title;
  const description = pickDescription(post.metaDescription, post.excerpt, post.plainText);
  const url = postUrl(post.slug);
  const images = [
    { url: postOgImageUrl(post.slug), width: 1200, height: 630, alt: post.title },
    { url: OG_FALLBACK_URL, width: 1200, height: 630, alt: ORG_NAME },
  ];
  return {
    title,
    description,
    alternates: blogAlternates(`/blog/${post.slug}`),
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt ? post.publishedAt.toISOString() : undefined,
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
      section: post.categoryName,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export function buildIndexMetadata(page: number): Metadata {
  const isTop = page === 1;
  const title = isTop ? "Journal" : `Journal - page ${page}`;
  return {
    title,
    description:
      "Evidence-based fertility guidance from the Lawon Bloom clinical team in Ibadan: IVF, IUI, egg freezing, and patient care.",
    alternates: blogAlternates("/blog"),
    robots: pageRobots(page),
    openGraph: {
      type: "website",
      title: isTop ? `${SITE_NAME}` : `${title} | ${SITE_NAME}`,
      url: apexUrl("/blog"),
      siteName: SITE_NAME,
      images: [{ url: OG_FALLBACK_URL, width: 1200, height: 630, alt: ORG_NAME }],
    },
    twitter: { card: "summary_large_image", title },
  };
}

export function buildCategoryMetadata(input: {
  name: string;
  slug: string;
  description: string | null;
  page: number;
}): Metadata {
  const title = `${input.name} - Lawon Bloom Journal`;
  return {
    title,
    description: input.description ?? undefined,
    alternates: blogAlternates(`/blog/category/${input.slug}`),
    robots: pageRobots(input.page),
    openGraph: {
      type: "website",
      title,
      url: apexUrl(`/blog/category/${input.slug}`),
      siteName: SITE_NAME,
      images: [{ url: OG_FALLBACK_URL, width: 1200, height: 630, alt: ORG_NAME }],
    },
    twitter: { card: "summary_large_image", title },
  };
}

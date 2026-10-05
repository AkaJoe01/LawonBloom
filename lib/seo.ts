import type { Metadata } from "next";

export const APEX = "https://lawonbloomfertilitycentre.com";
export const ORG_NAME = "Lawon Bloom Fertility Centre";
export const ORG_ID = `${APEX}/#organization`;
export const ORG_LOGO_URL = `${APEX}/logo/logo.png`;
export const OG_FALLBACK_URL = `${APEX}/og-fallback.png`;
export const SITE_NAME = "Lawon Bloom Fertility Centre Journal";
export const RSS_URL = `${APEX}/blog/rss.xml`;

export type JsonLd = Record<string, unknown>;

export function apexUrl(path: string): string {
  if (path === "/" || path === "") return APEX;
  return `${APEX}${path.startsWith("/") ? path : `/${path}`}`;
}

export function postUrl(slug: string): string {
  return apexUrl(`/blog/${slug}`);
}

export function postOgImageUrl(slug: string): string {
  return apexUrl(`/blog/${slug}/opengraph-image`);
}

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

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: APEX,
    logo: {
      "@type": "ImageObject",
      url: ORG_LOGO_URL,
      width: 512,
      height: 512,
    },
  };
}

export interface ArticleJsonLdInput {
  title: string;
  description: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string | null;
  reviewerName: string | null;
  reviewerCredential: string | null;
}

export function articleJsonLd(post: ArticleJsonLdInput): JsonLd {
  const data: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: clampText(post.title, 110),
    description: post.description,
    image: [postOgImageUrl(post.slug), OG_FALLBACK_URL],
    datePublished: (post.publishedAt ?? post.updatedAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName ?? ORG_NAME,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: ORG_NAME,
      logo: { "@type": "ImageObject", url: ORG_LOGO_URL },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl(post.slug),
    },
  };
  if (post.reviewerName) {
    data.reviewedBy = {
      "@type": "Person",
      name: post.reviewerName,
      ...(post.reviewerCredential ? { jobTitle: post.reviewerCredential } : {}),
    };
  }
  return data;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqJsonLd(faqs: FaqEntry[]): JsonLd | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: apexUrl(item.path),
    })),
  };
}

export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}

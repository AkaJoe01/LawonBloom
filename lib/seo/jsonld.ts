import { clampText } from "./metadata";
import {
  APEX,
  ORG_ID,
  ORG_LOGO_URL,
  ORG_NAME,
  apexUrl,
  postOgImageUrl,
  postUrl,
} from "./site";

export type JsonLd = Record<string, unknown>;

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
    image: [postOgImageUrl(post.slug), `${APEX}/og-fallback.png`],
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

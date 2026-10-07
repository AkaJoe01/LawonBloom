import { clampText } from "./metadata";
import {
  ADDRESS,
  APEX,
  CLINIC_ID,
  EMAIL,
  ORG_ID,
  ORG_LOGO_URL,
  ORG_NAME,
  PHONE,
  WEBSITE_ID,
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
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Patient enquiries",
      telephone: PHONE,
      email: EMAIL,
      areaServed: "NG",
    },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: APEX,
    name: ORG_NAME,
    publisher: { "@id": ORG_ID },
  };
}

const CLINIC_SERVICES = [
  "In Vitro Fertilization (IVF)",
  "Intrauterine Insemination (IUI)",
  "Genetic Testing",
  "Fertility Preservation",
  "Holistic Support",
  "Surrogacy Services",
] as const;

export function clinicJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": CLINIC_ID,
    name: ORG_NAME,
    url: APEX,
    telephone: PHONE,
    image: ORG_LOGO_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS.street,
      addressLocality: ADDRESS.locality,
      addressRegion: ADDRESS.region,
      addressCountry: ADDRESS.country,
    },
    availableService: CLINIC_SERVICES.map((name) => ({
      "@type": "MedicalProcedure",
      name,
    })),
    parentOrganization: { "@id": ORG_ID },
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

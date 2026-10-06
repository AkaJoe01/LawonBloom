import { generateHTML } from "@tiptap/html/server";
import sanitizeHtml from "sanitize-html";
import type { JSONContent } from "@tiptap/core";
import { Callout, Embed, VIMEO_EMBED, YOUTUBE_EMBED, createBaseExtensions } from "@/lib/tiptap/extensions";
import type { TiptapDoc } from "@/lib/validation/post";

const SAFE_EXTERNAL = /^https?:\/\//i;

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "blockquote",
    "hr",
    "strong",
    "em",
    "u",
    "code",
    "a",
    "img",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "div",
    "iframe",
  ],
  allowedAttributes: {
    a: ["href", "rel", "target"],
    img: ["src", "alt", "width", "height", "loading"],
    div: ["data-variant", "data-blocked-embed", "data-embed-src", "data-embed-title"],
    iframe: [
      "src",
      "title",
      "width",
      "height",
      "loading",
      "allow",
      "allowfullscreen",
      "frameborder",
      "referrerpolicy",
      "class",
    ],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs): sanitizeHtml.Tag => {
      const href = attribs.href ?? "";
      if (SAFE_EXTERNAL.test(href) || href.startsWith("mailto:")) {
        return {
          tagName,
          attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
        };
      }
      return { tagName, attribs: { href } };
    },
    iframe: (_tagName, attribs): sanitizeHtml.Tag => {
      const src = attribs.src ?? "";
      const allowed = YOUTUBE_EMBED.test(src) || VIMEO_EMBED.test(src);
      if (!allowed) {
        return { tagName: "div", attribs: { "data-blocked-embed": "true" } };
      }
      return {
        tagName: "iframe",
        attribs: {
          src,
          title: attribs.title ?? "Embedded video",
          loading: "lazy",
          allow: "accelerometer; encrypted-media; picture-in-picture; web-share",
          allowfullscreen: "",
          referrerpolicy: "strict-origin-when-cross-origin",
        },
      };
    },
  },
};

export function docToHtml(doc: TiptapDoc): string {
  return generateHTML(doc as unknown as JSONContent, [...createBaseExtensions(), Callout, Embed]);
}

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, sanitizeOptions);
}

export function renderPostHtml(doc: TiptapDoc): string {
  return sanitizePostHtml(docToHtml(doc));
}

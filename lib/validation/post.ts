import { z } from "zod";
import { reservedSlugs, slugMax } from "./common";

const hrefSchema = z
  .string()
  .trim()
  .max(2000)
  .refine(
    (value) => /^https?:\/\//i.test(value) || value.startsWith("/") || value.startsWith("#"),
    "link must be http(s), a relative path, or a fragment",
  );

const markSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("underline") }),
  z.object({ type: z.literal("code") }),
  z.object({
    type: z.literal("link"),
    attrs: z.object({
      href: hrefSchema,
      target: z.enum(["_blank"]).optional(),
      rel: z.string().max(100).optional(),
    }),
  }),
]);

const textNode = z.object({
  type: z.literal("text"),
  text: z.string().min(1),
  marks: z.array(markSchema).optional(),
});

const inlineNode = z.union([textNode]);

const paragraphNode = z.object({
  type: z.literal("paragraph"),
  content: z.array(inlineNode).optional(),
});

const headingNode = z.object({
  type: z.literal("heading"),
  attrs: z.object({ level: z.union([z.literal(2), z.literal(3)]) }),
  content: z.array(inlineNode).min(1),
});

const imageNode = z.object({
  type: z.literal("image"),
  attrs: z.object({
    src: z
      .string()
      .trim()
      .max(2000)
      .refine((value) => /^https?:\/\//i.test(value) || value.startsWith("/"), "image src must be http(s) or site-relative"),
    alt: z.string().max(300).nullable().optional(),
    "data-decorative": z.boolean().optional(),
    caption: z.string().max(300).optional(),
  }),
});

const horizontalRuleNode = z.object({ type: z.literal("horizontalRule") });

const calloutNode = z.object({
  type: z.literal("callout"),
  attrs: z.object({ variant: z.enum(["medical", "note"]) }),
  content: z.array(z.lazy(() => blockSchema)).min(1),
});

const EMBED_URL_SHAPES = [
  /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{6,}$/,
  /^https:\/\/player\.vimeo\.com\/video\/\d+/,
];

const embedNode = z.object({
  type: z.literal("embed"),
  attrs: z
    .object({
      provider: z.enum(["youtube", "vimeo"]),
      url: z
        .string()
        .trim()
        .max(500)
        .refine(
          (value) => EMBED_URL_SHAPES.some((shape) => shape.test(value)),
          "embed url must be a youtube-nocookie or vimeo player URL",
        ),
    })
    .superRefine((attrs, ctx) => {
      const isYoutube = EMBED_URL_SHAPES[0].test(attrs.url);
      const isVimeo = EMBED_URL_SHAPES[1].test(attrs.url);
      if (attrs.provider === "youtube" && !isYoutube) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "youtube provider requires a youtube-nocookie embed URL" });
      }
      if (attrs.provider === "vimeo" && !isVimeo) {
        ctx.addIssue({ code: "custom", path: ["url"], message: "vimeo provider requires a player.vimeo.com URL" });
      }
    }),
});

const cellAttrs = z.object({
  colspan: z.number().int().min(1).max(20).optional(),
  rowspan: z.number().int().min(1).max(20).optional(),
  colwidth: z.array(z.number().int().positive()).nullable().optional(),
});

const tableCellNode = z.object({
  type: z.union([z.literal("tableCell"), z.literal("tableHeader")]),
  attrs: cellAttrs.optional(),
  content: z.array(z.lazy(() => blockSchema)).min(1),
});

const tableRowNode = z.object({
  type: z.literal("tableRow"),
  content: z.array(z.lazy(() => tableCellNode)).min(1),
});

const tableNode = z.object({
  type: z.literal("table"),
  attrs: z.object({ columnWidths: z.array(z.number().int()).nullable().optional() }).optional(),
  content: z.array(z.lazy(() => tableRowNode)).min(1),
});

const listItemNode = z.object({
  type: z.literal("listItem"),
  content: z.array(z.lazy(() => blockSchema)).min(1),
});

const bulletListNode = z.object({
  type: z.literal("bulletList"),
  content: z.array(z.lazy(() => listItemNode)).min(1),
});

const orderedListNode = z.object({
  type: z.literal("orderedList"),
  attrs: z.object({ start: z.number().int().optional() }).optional(),
  content: z.array(z.lazy(() => listItemNode)).min(1),
});

const blockquoteNode = z.object({
  type: z.literal("blockquote"),
  content: z.array(z.lazy(() => blockSchema)).min(1),
});

const blockSchema: z.ZodType = z.lazy(() =>
  z.union([
    paragraphNode,
    headingNode,
    bulletListNode,
    orderedListNode,
    blockquoteNode,
    horizontalRuleNode,
    imageNode,
    tableNode,
    calloutNode,
    embedNode,
  ]),
);

export const tiptapDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(blockSchema).min(1),
});

export type TiptapDoc = z.infer<typeof tiptapDocSchema>;

export function hasBlockContent(doc: TiptapDoc): boolean {
  const walk = (nodes: unknown[]): boolean =>
    nodes.some((node) => {
      if (typeof node !== "object" || node === null) return false;
      const n = node as { type?: string; content?: unknown[]; text?: string; attrs?: Record<string, unknown> };
      if (n.type === "paragraph") {
        return Boolean(n.content && walk(n.content));
      }
      if (n.type === "text") return Boolean(n.text);
      if (n.type === "image" || n.type === "horizontalRule" || n.type === "embed") return true;
      if (n.type === "callout") return true;
      if (n.content && walk(n.content)) return true;
      return false;
    });
  return walk(doc.content);
}

const faqSchema = z.array(
  z.object({
    question: z.string().trim().min(5).max(200),
    answer: z.string().trim().min(10).max(2000),
  }),
).max(20);

export const postBase = z.object({
  title: z.string().trim().min(5).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(slugMax)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase words separated by hyphens")
    .refine((value) => !(reservedSlugs as readonly string[]).includes(value), "slug is reserved"),
  excerpt: z.string().trim().max(300).optional(),
  content: tiptapDocSchema,
  categoryId: z.string().min(1),
  coverImageId: z.string().min(1).nullish(),
  disclaimer: z.string().trim().max(2000).default(""),
  reviewerName: z.string().trim().max(120).nullish(),
  reviewerCredential: z.string().trim().max(120).nullish(),
  reviewedAt: z.coerce.date().nullish(),
  faqs: faqSchema.default([]),
  metaTitle: z.string().trim().max(60).nullish(),
  metaDescription: z.string().trim().max(160).nullish(),
  noindex: z.boolean().default(false),
});

export const postCreate = postBase;

export const postUpdate = postBase.partial();

const todayPlus1d = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const postPublish = postBase
  .extend({
    content: tiptapDocSchema.refine(hasBlockContent, "Post content is required before publish"),
    disclaimer: z.string().trim().min(20, "Disclaimer required before publish"),
    coverImageId: z.string().min(1, "Cover image required before publish"),
    reviewedAt: z.coerce.date().refine((date) => date.getTime() <= todayPlus1d().getTime(), "Review date cannot be in the future"),
    reviewerName: z.string().trim().min(2, "Reviewer name required before publish").max(120),
    reviewerCredential: z.string().trim().min(2, "Reviewer credential required before publish").max(120),
  });

export const postListQuery = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  category: z.string().trim().max(slugMax).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export type PostBaseInput = z.infer<typeof postBase>;
export type PostCreateInput = z.infer<typeof postCreate>;
export type PostUpdateInput = z.infer<typeof postUpdate>;
export type PostPublishInput = z.infer<typeof postPublish>;
export type PostListQuery = z.infer<typeof postListQuery>;

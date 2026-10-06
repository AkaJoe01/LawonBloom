import { Node, mergeAttributes } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import { StarterKit } from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";

export const YOUTUBE_EMBED = /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{6,}$/;
export const VIMEO_EMBED = /^https:\/\/player\.vimeo\.com\/video\/\d+/;

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: { default: "note" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "div[data-variant]",
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const variant = element.getAttribute("data-variant");
          return variant === "medical" || variant === "note" ? { variant } : false;
        },
      },
    ];
  },
  renderHTML({ node }) {
    const variant = node.attrs.variant === "medical" ? "medical" : "note";
    return [
      "div",
      mergeAttributes({ "data-variant": variant, class: `callout callout-${variant}` }),
      0,
    ];
  },
});

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      provider: { default: "youtube" },
      url: { default: "" },
    };
  },
  parseHTML() {
    return [
      {
        tag: "iframe[src]",
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          const src = element.getAttribute("src") ?? "";
          if (YOUTUBE_EMBED.test(src)) return { provider: "youtube", url: src };
          if (VIMEO_EMBED.test(src)) return { provider: "vimeo", url: src };
          return false;
        },
      },
    ];
  },
  renderHTML({ node }) {
    const url = typeof node.attrs.url === "string" ? node.attrs.url : "";
    const provider = node.attrs.provider === "vimeo" ? "vimeo" : "youtube";
    const allowed = YOUTUBE_EMBED.test(url) || VIMEO_EMBED.test(url);
    if (!allowed) {
      return ["div", { "data-blocked-embed": "true" }];
    }
    const title = provider === "vimeo" ? "Vimeo video" : "YouTube video";
    return [
      "div",
      { "data-embed-src": url, "data-embed-title": title },
      ["p", {}, `Play video: ${title}`],
    ];
  },
});

const LBImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-decorative": { default: false },
      caption: { default: null },
    };
  },
});

export function createBaseExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: false,
      strike: false,
      hardBreak: false,
      link: false,
    }),
    Link.configure({
      openOnClick: false,
      autolink: false,
      defaultProtocol: "https",
      protocols: ["http", "https", "mailto"],
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    LBImage.configure({ inline: false, allowBase64: false, HTMLAttributes: { loading: "lazy" } }),
    TableKit.configure({ table: { resizable: true } }),
    Callout,
    Embed,
  ];
}

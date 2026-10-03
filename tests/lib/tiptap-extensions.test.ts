import { describe, expect, it } from "vitest";
import { Callout, Embed, VIMEO_EMBED, YOUTUBE_EMBED, createBaseExtensions } from "@/lib/tiptap/extensions";

interface Rule {
  tag: string;
  getAttrs: (element: unknown) => unknown;
}

function firstRule(extension: { config: unknown }): Rule {
  const config = extension.config as { parseHTML?: () => Rule[] };
  const rules = config.parseHTML?.() ?? [];
  expect(rules.length).toBeGreaterThan(0);
  return rules[0];
}

function fakeElement(attrs: Record<string, string | null>) {
  return {
    getAttribute: (name: string) => (name in attrs ? attrs[name] : null),
  };
}

describe("Callout parseHTML", () => {
  const rule = firstRule(Callout);

  it("targets div[data-variant]", () => {
    expect(rule.tag).toBe("div[data-variant]");
  });

  it("rejects string inputs", () => {
    expect(rule.getAttrs("div[data-variant]")).toBe(false);
  });

  it("accepts note and medical variants only", () => {
    expect(rule.getAttrs(fakeElement({ "data-variant": "medical" }))).toEqual({ variant: "medical" });
    expect(rule.getAttrs(fakeElement({ "data-variant": "note" }))).toEqual({ variant: "note" });
    expect(rule.getAttrs(fakeElement({ "data-variant": "other" }))).toBe(false);
    expect(rule.getAttrs(fakeElement({ "data-variant": null }))).toBe(false);
    expect(rule.getAttrs(fakeElement({}))).toBe(false);
  });
});

describe("Embed parseHTML", () => {
  const rule = firstRule(Embed);

  it("targets iframes with a src", () => {
    expect(rule.tag).toBe("iframe[src]");
  });

  it("rejects string inputs", () => {
    expect(rule.getAttrs("iframe[src]")).toBe(false);
  });

  it("detects the youtube-nocookie provider", () => {
    const src = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
    expect(rule.getAttrs(fakeElement({ src }))).toEqual({ provider: "youtube", url: src });
  });

  it("detects the vimeo provider", () => {
    const src = "https://player.vimeo.com/video/76979871";
    expect(rule.getAttrs(fakeElement({ src }))).toEqual({ provider: "vimeo", url: src });
  });

  it("rejects everything else, including missing src", () => {
    expect(rule.getAttrs(fakeElement({ src: "https://evil.com/embed" }))).toBe(false);
    expect(rule.getAttrs(fakeElement({ src: null }))).toBe(false);
    expect(rule.getAttrs(fakeElement({}))).toBe(false);
  });
});

describe("embed url patterns", () => {
  it("matches only canonical embed urls", () => {
    expect(YOUTUBE_EMBED.test("https://www.youtube-nocookie.com/embed/abcdefgh")).toBe(true);
    expect(YOUTUBE_EMBED.test("https://www.youtube.com/embed/abcdefgh")).toBe(false);
    expect(YOUTUBE_EMBED.test("https://www.youtube-nocookie.com/watch?v=abcdefgh")).toBe(false);
    expect(YOUTUBE_EMBED.test("https://www.youtube-nocookie.com/embed/short")).toBe(false);
    expect(VIMEO_EMBED.test("https://player.vimeo.com/video/123456")).toBe(true);
    expect(VIMEO_EMBED.test("https://vimeo.com/123456")).toBe(false);
    expect(VIMEO_EMBED.test("https://player.vimeo.com/video/abc")).toBe(false);
  });
});

describe("createBaseExtensions", () => {
  it("includes callout, embed, image, link and table support", () => {
    const names = createBaseExtensions().map((extension) => extension.name);
    expect(names).toContain("callout");
    expect(names).toContain("embed");
    expect(names).toContain("image");
    expect(names).toContain("link");
    expect(names).toContain("tableKit");
  });

  it("wires starterkit as a container plus the admin-specific extensions", () => {
    const names = createBaseExtensions().map((extension) => extension.name);
    expect(names).toEqual(["starterKit", "link", "image", "tableKit", "callout", "embed"]);
  });
});

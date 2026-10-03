import { describe, expect, it } from "vitest";
import { docToHtml, renderPostHtml, sanitizePostHtml } from "@/lib/posts/render";
import type { TiptapDoc } from "@/lib/validation/post";

function doc(content: unknown[]): TiptapDoc {
  return { type: "doc", content } as unknown as TiptapDoc;
}

describe("docToHtml", () => {
  it("renders a plain paragraph", () => {
    const html = docToHtml(doc([{ type: "paragraph", content: [{ type: "text", text: "hello" }] }]));
    expect(html).toBe("<p>hello</p>");
  });

  it("renders h2 and h3 headings from the restricted heading config", () => {
    const html = docToHtml(
      doc([
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Two" }] },
        { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Three" }] },
      ]),
    );
    expect(html).toContain("<h2>Two</h2>");
    expect(html).toContain("<h3>Three</h3>");
  });

  it("renders a medical callout wrapper with its content", () => {
    const html = docToHtml(
      doc([
        {
          type: "callout",
          attrs: { variant: "medical" },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Rest" }] }],
        },
      ]),
    );
    expect(html).toContain('<div data-variant="medical"');
    expect(html).toContain("callout callout-medical");
    expect(html).toContain("<p>Rest</p>");
  });

  it("falls back to the note variant for callouts", () => {
    const html = docToHtml(
      doc([
        {
          type: "callout",
          attrs: { variant: "other" },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Note" }] }],
        },
      ]),
    );
    expect(html).toContain('<div data-variant="note"');
    expect(html).toContain("callout callout-note");
  });

  it("renders an embed node as an iframe", () => {
    const html = docToHtml(
      doc([
        {
          type: "embed",
          attrs: { provider: "youtube", url: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" },
        },
      ]),
    );
    expect(html).toContain("<iframe");
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(html).toContain('title="YouTube video"');
    expect(html).toContain('class="post-embed"');
  });
});

describe("sanitizePostHtml", () => {
  it("adds rel and target to external links", () => {
    const html = sanitizePostHtml('<p><a href="https://example.com/page">x</a></p>');
    expect(html).toContain('href="https://example.com/page"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("keeps internal links bare", () => {
    const html = sanitizePostHtml('<p><a href="/about" target="_blank">x</a></p>');
    expect(html).toContain('href="/about"');
    expect(html).not.toContain("target");
    expect(html).not.toContain("rel");
  });

  it("treats mailto links as external", () => {
    const html = sanitizePostHtml('<p><a href="mailto:hello@lawonbloom.com">x</a></p>');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("keeps bare anchors href-only", () => {
    const html = sanitizePostHtml('<p><a href="#faq">x</a></p>');
    expect(html).toContain('href="#faq"');
    expect(html).not.toContain("target");
  });

  it("drops protocol-relative and javascript urls", () => {
    expect(sanitizePostHtml('<p><a href="//evil.com/x">x</a></p>')).not.toContain("evil.com");
    expect(sanitizePostHtml('<p><a href="javascript:alert(1)">x</a></p>')).not.toContain("javascript");
  });

  it("keeps links without an href intact", () => {
    const html = sanitizePostHtml("<p><a>x</a></p>");
    expect(html).toMatch(/<a[^>]*>x<\/a>/);
  });

  it("keeps allowed youtube-nocookie and vimeo embeds", () => {
    const youtube = sanitizePostHtml(
      '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>',
    );
    expect(youtube).toContain("<iframe");
    expect(youtube).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(youtube).toContain('loading="lazy"');

    const vimeo = sanitizePostHtml('<iframe src="https://player.vimeo.com/video/123456" title="V"></iframe>');
    expect(vimeo).toContain("<iframe");
    expect(vimeo).toContain('title="V"');
  });

  it("blocks every other embed source", () => {
    expect(sanitizePostHtml('<iframe src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></iframe>')).not.toContain(
      "<iframe",
    );
    expect(sanitizePostHtml('<iframe src="https://evil.com/embed"></iframe>')).not.toContain("<iframe");
    expect(sanitizePostHtml('<iframe src="https://player.vimeo.com/video/abc"></iframe>')).not.toContain(
      "<iframe",
    );
  });

  it("strips scripts with their contents", () => {
    const html = sanitizePostHtml("<p>ok</p><script>alert(1)</script>");
    expect(html).toContain("ok");
    expect(html).not.toContain("alert(1)");
  });

  it("strips disallowed tags but keeps their text", () => {
    const html = sanitizePostHtml("<h1>Title</h1>");
    expect(html).not.toContain("<h1");
    expect(html).toContain("Title");
  });

  it("keeps allowed image attributes and drops event handlers", () => {
    const html = sanitizePostHtml(
      '<p><img src="https://x.com/a.jpg" alt="a" onerror="alert(1)" loading="lazy"></p>',
    );
    expect(html).toContain('src="https://x.com/a.jpg"');
    expect(html).toContain('alt="a"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("onerror");
  });

  it("blocks data-uris in images", () => {
    expect(sanitizePostHtml('<p><img src="data:image/png;base64,AAAA"></p>')).not.toContain("data:image");
  });

  it("keeps callout wrappers and tables", () => {
    expect(sanitizePostHtml('<div data-variant="medical"><p>x</p></div>')).toContain('data-variant="medical"');
    expect(
      sanitizePostHtml("<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>c</td></tr></tbody></table>"),
    ).toContain("<table>");
  });

  it("drops style attributes", () => {
    expect(sanitizePostHtml('<p style="color:red">x</p>')).not.toContain("style");
  });
});

describe("renderPostHtml", () => {
  it("renders and sanitizes in one pass", () => {
    const html = renderPostHtml(doc([{ type: "paragraph", content: [{ type: "text", text: "hello" }] }]));
    expect(html).toBe("<p>hello</p>");
  });

  it("drops blocked embeds that survive serialization", () => {
    const html = renderPostHtml(
      doc([{ type: "embed", attrs: { provider: "youtube", url: "https://evil.com/embed" } }]),
    );
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("evil.com");
  });

  it("passes callouts through sanitization", () => {
    const html = renderPostHtml(
      doc([
        {
          type: "callout",
          attrs: { variant: "note" },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Note" }] }],
        },
      ]),
    );
    expect(html).toContain('data-variant="note"');
    expect(html).toContain("<p>Note</p>");
  });
});

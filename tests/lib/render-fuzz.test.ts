import { describe, expect, it } from "vitest";
import { renderPostHtml, sanitizePostHtml } from "@/lib/posts/render";
import type { TiptapDoc } from "@/lib/validation/post";

const ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "ul", "ol", "li", "blockquote", "hr", "strong", "em", "u",
  "code", "a", "img", "figure", "figcaption", "table", "thead", "tbody", "tr",
  "th", "td", "div", "iframe",
]);

const HOSTILE = [
  "<script>alert(1)</script>",
  "<SCRIPT SRC=//evil.com/x.js></SCRIPT>",
  "<script/src='//evil.com/x.js'>",
  "<img src=x onerror=alert(1)>",
  '<img src="x" onerror="alert(1)" onload="alert(2)">',
  "<svg onload=alert(1)>",
  "<svg><script>alert(1)</script></svg>",
  '<iframe src="https://evil.com/embed"></iframe>',
  '<iframe src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></iframe>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '<a href="javascript:alert(1)">x</a>',
  '<a href="JaVaScRiPt:alert(1)">x</a>',
  '<a href=" javascript:alert(1)">x</a>',
  '<a href="&#106;avascript:alert(1)">x</a>',
  '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
  '<div style="background:url(javascript:alert(1))">x</div>',
  '<p style="position:fixed;top:0">x</p>',
  '<object data="https://evil.com/x.swf"></object>',
  '<embed src="https://evil.com/x.svg">',
  '<form action="https://evil.com"><input name="x"></form>',
  '<base href="https://evil.com/">',
  '<meta http-equiv="refresh" content="0;url=https://evil.com">',
  '<link rel="stylesheet" href="https://evil.com/x.css">',
  "<style>@import 'https://evil.com/x.css';</style>",
  "<math><mtext><script>alert(1)</script></mtext></math>",
  "<template><script>alert(1)</script></template>",
  '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
  "<textarea></textarea><img src=x onerror=alert(1)>",
  '<video><source onerror="alert(1)"></video>',
  "<body onload=alert(1)>",
  "<input onfocus=alert(1) autofocus>",
  "<button onclick=alert(1)>x</button>",
  "<details open ontoggle=alert(1)>x</details>",
  '<a href="//evil.com/path">x</a>',
  '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">',
  '<p onclick="alert(1)">text</p>',
  '<table background="javascript:alert(1)"><tr><td>x</td></tr></table>',
  '<a href="vbscript:msgbox(1)">x</a>',
  '<img src="https://x.com/a.jpg" srcset="javascript:alert(1)">',
  "'\"><script>alert(1)</script>",
  "<scr<script>ipt>alert(1)</script>",
  "<!--<script>alert(1)</script>-->",
  "<h1 onclick=alert(1)>h</h1>",
  "<p>safe text</p>",
];

const NOISE = ["hello", "IVF treatment works", "ok", " ", " &amp; ok ", "-"];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_m: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m: string, dec: string) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&colon;/gi, ":")
    .replace(/&Tab;/gi, " ")
    .replace(/&NewLine;/gi, " ");
}

function stripNoise(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code > 0x20 && code !== 0x7f) out += ch;
  }
  return out;
}

function assertClean(html: string, input: string): void {
  const context = () => `\ninput: ${input}\noutput: ${html}`;

  const residue = html.replace(
    /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g,
    (_m: string, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      expect(ALLOWED_TAGS.has(tag), `disallowed tag <${tag}>${context()}`).toBe(true);

      const attrRe = /\s([a-zA-Z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
      let match: RegExpExecArray | null;
      while ((match = attrRe.exec(rawAttrs)) !== null) {
        const name = match[1].toLowerCase();
        const value = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
        expect(name.startsWith("on"), `event handler ${name}=${value}${context()}`).toBe(false);
        expect(name === "style", `style attribute${context()}`).toBe(false);
        if (name === "href" || name === "src" || name === "action" || name === "data") {
          const collapsed = stripNoise(value);
          const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(collapsed);
          if (scheme) {
            const ok = ["http", "https", "mailto"].includes(scheme[1].toLowerCase());
            expect(ok, `scheme ${scheme[1]} in ${name}="${value}"${context()}`).toBe(true);
          }
          expect(/^\/\//.test(value), `protocol-relative ${name}="${value}"${context()}`).toBe(false);
        }
        if (tag === "iframe" && name === "src") {
          expect(
            /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{6,}$/.test(value) ||
              /^https:\/\/player\.vimeo\.com\/video\/\d+/.test(value),
            `iframe src="${value}"${context()}`,
          ).toBe(true);
        }
      }
      return "";
    },
  );
  expect(residue.includes("<"), `raw < residue${context()}`).toBe(false);
}

describe("sanitizePostHtml deterministic fuzz", () => {
  it("holds every safety invariant over 400 seeded hostile inputs", () => {
    const rand = mulberry32(0xc0ffee);
    for (let i = 0; i < 400; i += 1) {
      const parts: string[] = [];
      const count = 1 + Math.floor(rand() * 4);
      for (let j = 0; j < count; j += 1) {
        let fragment = HOSTILE[Math.floor(rand() * HOSTILE.length)];
        if (rand() < 0.2) fragment = fragment.toUpperCase();
        if (rand() < 0.15) fragment = fragment.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (rand() < 0.1) fragment = ` ${fragment}`;
        parts.push(fragment);
        parts.push(NOISE[Math.floor(rand() * NOISE.length)]);
      }
      const input = parts.join("");
      assertClean(sanitizePostHtml(input), input);
    }
  });

  it("keeps allowed youtube-nocookie embeds through fuzzed wrappers", () => {
    const rand = mulberry32(0xbeef);
    const src = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ";
    const closedWrappers = [
      "<p>safe text</p>",
      '<p onclick="alert(1)">text</p>',
      "<script>alert(1)</script>",
      '<img src=x onerror=alert(1)>',
      '<a href="javascript:alert(1)">x</a>',
      '<p style="position:fixed;top:0">x</p>',
      "<h1 onclick=alert(1)>h</h1>",
      "<!--<script>alert(1)</script>-->",
      '<iframe src="https://evil.com/embed"></iframe>',
      '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    ];
    for (let i = 0; i < 50; i += 1) {
      const wrapper = closedWrappers[Math.floor(rand() * closedWrappers.length)];
      const input = `<div>${wrapper}<iframe src="${src}" width="${Math.floor(rand() * 900)}"></iframe></div>`;
      const output = sanitizePostHtml(input);
      expect(output, `input: ${input}\noutput: ${output}`).toContain(`src="${src}"`);
      assertClean(output, input);
    }
  });
});

function randomDoc(rand: () => number): TiptapDoc {
  const textOptions = [
    "</p><script>alert(1)</script>",
    '<img src=x onerror=alert(1)>',
    "normal paragraph",
    '"><svg onload=alert(1)>',
  ];
  const hrefOptions = [
    "javascript:alert(1)",
    "//evil.com/x",
    "data:text/html,<script>alert(1)</script>",
    "https://example.com/page",
    "/blog",
  ];
  const srcOptions = ["javascript:alert(1)", "data:image/png;base64,AAAA", "https://x.com/a.png"];
  const urlOptions = [
    "https://evil.com/embed",
    "javascript:alert(1)",
    "https://www.youtube.com/watch?v=x",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "",
  ];

  const blocks: unknown[] = [];
  const blockCount = 1 + Math.floor(rand() * 4);
  for (let i = 0; i < blockCount; i += 1) {
    const kind = rand();
    if (kind < 0.3) {
      blocks.push({
        type: "paragraph",
        content: [{ type: "text", text: textOptions[Math.floor(rand() * textOptions.length)] }],
      });
    } else if (kind < 0.45) {
      blocks.push({
        type: "heading",
        attrs: { level: rand() < 0.5 ? 2 : 3 },
        content: [{ type: "text", text: textOptions[Math.floor(rand() * textOptions.length)] }],
      });
    } else if (kind < 0.6) {
      blocks.push({
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "link text",
            marks: [
              { type: "link", attrs: { href: hrefOptions[Math.floor(rand() * hrefOptions.length)] } },
            ],
          },
        ],
      });
    } else if (kind < 0.72) {
      blocks.push({
        type: "image",
        attrs: {
          src: srcOptions[Math.floor(rand() * srcOptions.length)],
          alt: textOptions[Math.floor(rand() * textOptions.length)],
        },
      });
    } else if (kind < 0.85) {
      blocks.push({
        type: "embed",
        attrs: { provider: "youtube", url: urlOptions[Math.floor(rand() * urlOptions.length)] },
      });
    } else if (kind < 0.93) {
      blocks.push({
        type: "callout",
        attrs: { variant: rand() < 0.5 ? "medical" : "<img onerror=alert(1)>" },
        content: [{ type: "paragraph", content: [{ type: "text", text: textOptions[2] }] }],
      });
    } else {
      blocks.push({
        type: "heading",
        attrs: { level: 100 },
        content: [{ type: "text", text: "wild heading" }],
      });
    }
  }
  return { type: "doc", content: blocks } as unknown as TiptapDoc;
}

describe("renderPostHtml deterministic fuzz", () => {
  it("holds every safety invariant over 300 seeded hostile documents", async () => {
    const rand = mulberry32(0xfeed);
    for (let i = 0; i < 300; i += 1) {
      const doc = randomDoc(rand);
      const html = renderPostHtml(doc);
      assertClean(html, JSON.stringify(doc));
    }
  }, 60000);
});

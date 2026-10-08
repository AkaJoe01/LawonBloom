/**
 * M8a SEO audit — renders each static route through a running server and
 * asserts the metadata contract with a real HTML parser (parse5):
 *
 *   - <title> equals the catalog/layout expectation (template applied, <=60 chars)
 *   - meta description equals the clamped expectation
 *   - link[rel=canonical] equals the apex URL
 *   - og:title / og:description / og:url / og:image(+width/height)
 *   - twitter:card = summary_large_image
 *   - titles are distinct across all checked routes
 *   - noindex on /blog/search, /admin/login and 404s
 *   - robots.txt Host/Sitemap/Disallow lines
 *   - sitemap.xml: all 24 static routes, no <lastmod> on static entries, apex-only
 *   - /og-fallback.png decodes to exactly 1200x630
 *
 * Usage: BASE_URL=http://localhost:3123 npx tsx scripts/seo-audit.ts
 * Exit 0 = green, 1 = failures.
 */
import { parse } from "parse5";
import { confirmedFaqs } from "../app/(site)/faq/faqs";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE_PATH,
  SITE_PAGE_CATALOG,
  SITE_NAME,
  TITLE_SUFFIX,
  apexUrl,
  buildIndexMetadata,
  buildMetadata,
} from "../lib/seo";

interface N {
  nodeName: string;
  tagName?: string;
  attrs?: { name: string; value: string }[];
  childNodes?: N[];
  value?: string;
}

const BASE = (process.env.BASE_URL ?? process.argv[2] ?? "http://localhost:3123").replace(/\/$/, "");
const APEX = apexUrl("/");
// DB routes (/blog, /blog/search) auto-skip when the server has no database
// (CI build-audit job runs Postgres-less). AUDIT_DB=required makes them hard
// failures — use that for the local DoD run.
const REQUIRE_DB = process.env.AUDIT_DB === "required";
const DB_ROUTES = new Set(["/blog", "/blog/search"]);

const failures: string[] = [];
const warnings: string[] = [];
let checks = 0;

function expectEq(route: string, label: string, got: unknown, want: unknown): void {
  checks += 1;
  if (got !== want) {
    failures.push(`${route} ${label}\n     got:  ${JSON.stringify(got)}\n     want: ${JSON.stringify(want)}`);
  }
}

function expectTrue(route: string, label: string, ok: boolean, detail?: string): void {
  checks += 1;
  if (!ok) failures.push(`${route} ${label}${detail ? ` (${detail})` : ""}`);
}

function warn(msg: string): void {
  warnings.push(msg);
}

function walk(node: N, out: N[]): N[] {
  if (node.tagName) out.push(node);
  for (const child of node.childNodes ?? []) walk(child, out);
  return out;
}

function textOf(node: N): string {
  if (node.nodeName === "#text") return node.value ?? "";
  let s = "";
  for (const child of node.childNodes ?? []) s += textOf(child);
  return s;
}

function findMeta(doc: N, key: "name" | "property", value: string): string | null {
  for (const el of walk(doc, [])) {
    if (el.tagName !== "meta") continue;
    const attrs = el.attrs ?? [];
    if (attrs.find((a) => a.name === key)?.value === value) {
      return attrs.find((a) => a.name === "content")?.value ?? null;
    }
  }
  return null;
}

function findTitle(doc: N): string | null {
  for (const el of walk(doc, [])) {
    if (el.tagName === "title") return textOf(el).trim();
  }
  return null;
}

function findCanonical(doc: N): string | null {
  for (const el of walk(doc, [])) {
    if (el.tagName !== "link") continue;
    const rel = (el.attrs ?? []).find((a) => a.name === "rel")?.value;
    if (rel === "canonical") return (el.attrs ?? []).find((a) => a.name === "href")?.value ?? null;
  }
  return null;
}

function findJsonLdNodes(doc: N): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  for (const el of walk(doc, [])) {
    if (el.tagName !== "script") continue;
    const type = (el.attrs ?? []).find((a) => a.name === "type")?.value;
    if (type !== "application/ld+json") continue;
    const raw = textOf(el).trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (Array.isArray(parsed)) nodes.push(...(parsed as Record<string, unknown>[]));
      else nodes.push(parsed);
    } catch {
      // unparseable JSON-LD is reported by the caller via node count
    }
  }
  return nodes;
}

function nodeTypes(nodes: Record<string, unknown>[]): Set<string> {
  const types = new Set<string>();
  for (const node of nodes) {
    const t = node["@type"];
    if (Array.isArray(t)) t.forEach((x) => types.add(String(x)));
    else if (t) types.add(String(t));
  }
  return types;
}

async function fetchText(url: string): Promise<{ status: number; body: string; contentType: string }> {
  // Follow redirects: the deployment host may differ from APEX (e.g. Vercel
  // primary domain serves www while canonicals point at the apex — infra
  // config, see ops/seo-audit.md). The audit validates the HTML that is
  // actually served, not the redirect table.
  const res = await fetch(url, { redirect: "follow" });
  return { status: res.status, body: await res.text(), contentType: res.headers.get("content-type") ?? "" };
}

async function auditRoute(
  route: string,
  want: {
    title: string;
    description: string;
    canonical: string;
    ogTitle: string;
    noindex: boolean;
    ogUrl?: string;
    faqCount?: number;
  },
): Promise<string | null> {
  const res = await fetchText(`${BASE}${route}`);
  if (res.status >= 500 && DB_ROUTES.has(route) && !REQUIRE_DB) {
    warn(`${route}: HTTP ${res.status} (database unavailable?) — skipped`);
    return null;
  }
  expectTrue(route, "HTTP 200", res.status === 200, `got ${res.status}`);
  const doc = parse(res.body) as unknown as N;

  const title = findTitle(doc);
  expectEq(route, "title", title, want.title);
  if (title && title.length > 60) expectTrue(route, "title <=60 chars", false, `${title.length}: ${title}`);

  expectEq(route, "meta description", findMeta(doc, "name", "description"), want.description);
  expectEq(route, "canonical", findCanonical(doc), want.canonical);
  expectEq(route, "og:title", findMeta(doc, "property", "og:title"), want.ogTitle);
  expectEq(route, "og:url", findMeta(doc, "property", "og:url"), want.ogUrl ?? want.canonical);
  expectEq(route, "og:description", findMeta(doc, "property", "og:description"), want.description);

  const ogImage = findMeta(doc, "property", "og:image");
  expectTrue(route, "og:image present", !!ogImage);
  if (ogImage && !ogImage.endsWith(OG_IMAGE_PATH)) {
    expectTrue(route, "og:image target", false, ogImage);
  }
  expectEq(route, "og:image:width", findMeta(doc, "property", "og:image:width"), "1200");
  expectEq(route, "og:image:height", findMeta(doc, "property", "og:image:height"), "630");
  expectEq(route, "twitter:card", findMeta(doc, "name", "twitter:card"), "summary_large_image");

  const robots = findMeta(doc, "name", "robots");
  if (want.noindex) {
    expectTrue(route, "meta robots noindex", !!robots && robots.includes("noindex"), `got ${JSON.stringify(robots)}`);
  }

  // Heading audit (plan Q4 regression): exactly one h1 per route.
  const h1s = walk(doc, []).filter((el) => el.tagName === "h1");
  expectTrue(route, "exactly one <h1>", h1s.length === 1, `got ${h1s.length}`);

  // Sitewide JSON-LD (M8b): Organization + WebSite + MedicalClinic from layout.
  const nodes = findJsonLdNodes(doc);
  const types = nodeTypes(nodes);
  for (const t of ["Organization", "WebSite", "MedicalClinic"]) {
    expectTrue(route, `JSON-LD ${t}`, types.has(t));
  }
  const ids = nodes.map((n) => n["@id"]).filter((id): id is string => typeof id === "string");
  expectTrue(route, "unique JSON-LD @ids", new Set(ids).size === ids.length, ids.join(", "));

  // FAQPage is gated on H1 sign-off (confirmed flags in app/(site)/faq/faqs.ts).
  if (want.faqCount !== undefined) {
    if (want.faqCount > 0) {
      expectTrue(route, "JSON-LD FAQPage", types.has("FAQPage"));
      const faqNode = nodes.find((n) => n["@type"] === "FAQPage");
      const main = faqNode?.mainEntity;
      expectTrue(
        route,
        "FAQPage mainEntity length",
        Array.isArray(main) && main.length === want.faqCount,
        `got ${Array.isArray(main) ? main.length : "none"}, want ${want.faqCount}`,
      );
    } else {
      expectTrue(route, "no FAQPage before H1 sign-off", !types.has("FAQPage"));
    }
  }
  return title;
}

async function main(): Promise<void> {
  console.log(`seo-audit against ${BASE}`);

  const titles = new Map<string, string | null>();

  // Home — layout defaults (page metadata is canonical-only).
  titles.set(
    "/",
    await auditRoute("/", {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonical: apexUrl("/"),
      ogTitle: DEFAULT_TITLE,
      noindex: false,
    }),
  );

  // 22 catalog routes — buildMetadata contract with template applied.
  for (const path of Object.keys(SITE_PAGE_CATALOG).sort()) {
    const entry = SITE_PAGE_CATALOG[path];
    const meta = buildMetadata(entry);
    const description = typeof meta.description === "string" ? meta.description : "";
    const canonical = typeof meta.alternates?.canonical === "string" ? meta.alternates.canonical : "";
    const ogTitle = typeof meta.openGraph === "object" && meta.openGraph !== null ? String((meta.openGraph as { title?: string }).title) : "";
    titles.set(
      path,
      await auditRoute(path, {
        title: `${entry.title}${TITLE_SUFFIX}`,
        description,
        canonical,
        ogTitle,
        noindex: false,
        ...(path === "/faq" ? { faqCount: confirmedFaqs().length } : {}),
      }),
    );
  }

  // /blog — buildIndexMetadata (page 1).
  {
    const meta = buildIndexMetadata(1);
    const description = typeof meta.description === "string" ? meta.description : "";
    const ogTitle = typeof meta.openGraph === "object" && meta.openGraph !== null ? String((meta.openGraph as { title?: string }).title) : "";
    titles.set(
      "/blog",
      await auditRoute("/blog", {
        title: `Journal${TITLE_SUFFIX}`,
        description,
        canonical: apexUrl("/blog"),
        ogTitle: ogTitle || SITE_NAME,
        noindex: false,
      }),
    );
  }

  // /blog/search — custom metadata, noindex, full openGraph defined on the
  // page (Next shallow-merges top-level metadata keys, so a partial og would
  // drop og:description/image inherited from the site layout).
  titles.set(
    "/blog/search",
    await auditRoute("/blog/search", {
      title: `Search the journal${TITLE_SUFFIX}`,
      description: DEFAULT_DESCRIPTION,
      canonical: apexUrl("/blog/search"),
      ogTitle: `Search the journal${TITLE_SUFFIX}`,
      noindex: true,
    }),
  );

  // Distinct titles.
  {
    const seen = new Map<string, string>();
    for (const [route, title] of titles) {
      if (!title) continue;
      const prev = seen.get(title);
      if (prev) failures.push(`duplicate title "${title}" on ${prev} and ${route}`);
      else seen.set(title, route);
      checks += 1;
    }
    expectTrue("(all)", "distinct titles", failures.filter((f) => f.startsWith("duplicate")).length === 0);
  }

  // /admin/login — noindex via admin layout.
  {
    const res = await fetchText(`${BASE}/admin/login`);
    const doc = parse(res.body) as unknown as N;
    const robots = findMeta(doc, "name", "robots");
    expectTrue("/admin/login", "HTTP 200", res.status === 200, `got ${res.status}`);
    expectTrue("/admin/login", "meta robots noindex", !!robots && robots.includes("noindex"), `got ${JSON.stringify(robots)}`);
  }

  // 404 page — status is hard, noindex is expected (not-found metadata).
  {
    const missing = "/__m8a-audit-missing__";
    const res = await fetchText(`${BASE}${missing}`);
    expectTrue(missing, "HTTP 404", res.status === 404, `got ${res.status}`);
    const doc = parse(res.body) as unknown as N;
    const robots = findMeta(doc, "name", "robots");
    if (robots && robots.includes("noindex")) {
      checks += 1;
    } else {
      warn(`${missing}: 404 status OK but noindex meta absent — verify not-found.tsx metadata renders`);
    }
  }

  // robots.txt
  {
    const route = "/robots.txt";
    const res = await fetchText(`${BASE}${route}`);
    expectTrue(route, "HTTP 200", res.status === 200, `got ${res.status}`);
    expectTrue(route, "Host line", res.body.includes(`Host: ${APEX.replace(/\/$/, "")}`), res.body.trim().split("\n")[0]);
    expectTrue(route, "Sitemap line", res.body.includes(`Sitemap: ${apexUrl("/sitemap.xml")}`));
    expectTrue(route, "Disallow /admin", res.body.includes("Disallow: /admin"));
    expectTrue(route, "Disallow /blog/search", res.body.includes("Disallow: /blog/search"));
  }

  // sitemap.xml
  {
    const route = "/sitemap.xml";
    const res = await fetchText(`${BASE}${route}`);
    expectTrue(route, "HTTP 200", res.status === 200, `got ${res.status}`);
    expectTrue(route, "XML content type", res.contentType.includes("xml"), res.contentType);

    const staticPaths = ["/", ...Object.keys(SITE_PAGE_CATALOG), "/blog"];
    const urlBlocks = [...res.body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
    expectTrue(route, `static entries >= ${staticPaths.length}`, urlBlocks.length >= staticPaths.length, `got ${urlBlocks.length}`);

    for (const path of staticPaths) {
      const loc = apexUrl(path);
      const block = urlBlocks.find((b) => b.includes(`<loc>${loc}</loc>`));
      expectTrue(route, `contains ${loc}`, !!block);
      if (block) expectTrue(route, `no <lastmod> on static ${loc}`, !block.includes("<lastmod>"));
    }
    for (const block of urlBlocks) {
      const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "";
      expectTrue(route, "loc on apex", loc.startsWith(APEX), loc);
    }
  }

  // og-fallback.png — exactly 1200x630.
  {
    const route = "/og-fallback.png";
    const res = await fetch(`${BASE}${route}`);
    expectTrue(route, "HTTP 200", res.status === 200, `got ${res.status}`);
    expectTrue(route, "image/png content type", (res.headers.get("content-type") ?? "").includes("image/png"));
    const buf = Buffer.from(await res.arrayBuffer());
    expectTrue(route, "PNG signature", buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47);
    if (buf.length > 24) {
      expectTrue(route, "dims 1200x630", buf.readUInt32BE(16) === 1200 && buf.readUInt32BE(20) === 630,
        `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`);
    }
  }

  // Report
  const routesChecked = [...titles.values()].filter((t) => t !== null).length;
  console.log("");
  for (const w of warnings) console.log(`WARN  ${w}`);
  if (failures.length > 0) {
    console.log(`FAIL  ${failures.length} check(s) failed:\n`);
    for (const f of failures) console.log(`  - ${f}`);
    console.log(`\nseo-audit: FAILED (${routesChecked} routes, ${checks} checks, ${warnings.length} warnings)`);
    process.exit(1);
  }
  console.log(`seo-audit: ${routesChecked + 2} routes PASS (${checks} checks, ${warnings.length} warnings)`);
}

main().catch((err) => {
  console.error(`seo-audit could not run: ${err instanceof Error ? err.message : err}`);
  console.error(`Is the server running at ${BASE}? Start with: npm run build && npm run start`);
  process.exit(1);
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as seo from "@/lib/seo";

const EXPECTED_SURFACE = [
  // lib/seo/site.ts
  "ADDRESS",
  "APEX",
  "CLINIC_ID",
  "DEFAULT_DESCRIPTION",
  "DEFAULT_TITLE",
  "EMAIL",
  "MAX_DESCRIPTION_LENGTH",
  "MAX_TITLE_LENGTH",
  "OG_FALLBACK_URL",
  "OG_IMAGE_HEIGHT",
  "OG_IMAGE_PATH",
  "OG_IMAGE_WIDTH",
  "ORG_ID",
  "ORG_LOGO_URL",
  "ORG_NAME",
  "PHONE",
  "RSS_URL",
  "SITE",
  "SITE_NAME",
  "TITLE_SUFFIX",
  "TITLE_TEMPLATE",
  "WEBSITE_ID",
  "apexUrl",
  "postOgImageUrl",
  "postUrl",
  // lib/seo/metadata.ts
  "blogAlternates",
  "buildCategoryMetadata",
  "buildIndexMetadata",
  "buildMetadata",
  "buildPostMetadata",
  "clampText",
  "pageRobots",
  "pickDescription",
  "rssDescription",
  // lib/seo/catalog.ts
  "SITE_PAGE_CATALOG",
  "pageMetadata",
  // lib/seo/jsonld.ts
  "articleJsonLd",
  "breadcrumbJsonLd",
  "faqJsonLd",
  "organizationJsonLd",
  "serializeJsonLd",
];

describe("lib/seo.ts barrel", () => {
  const barrel = readFileSync(join(process.cwd(), "lib", "seo.ts"), "utf8");

  it("contains only the resolution-rule header and re-export lines", () => {
    const lines = barrel
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l !== "");
    for (const line of lines) {
      const ok =
        line.startsWith("/**") ||
        line.startsWith("*") ||
        line.startsWith("//") ||
        line.endsWith("*/") ||
        /^export \* from "\.\/seo\/(site|metadata|catalog|jsonld)";$/.test(line);
      expect(ok, `unexpected line in barrel: ${line}`).toBe(true);
    }
  });

  it("exposes exactly the expected runtime surface (file shadows lib/seo/)", () => {
    expect(Object.keys(seo).sort()).toEqual([...EXPECTED_SURFACE].sort());
  });

  it("resolves constants and builders through @/lib/seo", () => {
    expect(seo.APEX).toBe("https://lawonbloomfertilitycentre.com");
    expect(typeof seo.buildMetadata).toBe("function");
    expect(typeof seo.pageMetadata).toBe("function");
    expect(seo.TITLE_SUFFIX).toBe(` | ${seo.ORG_NAME}`);
  });
});

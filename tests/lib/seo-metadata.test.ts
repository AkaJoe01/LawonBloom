import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_TITLE,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  OG_IMAGE_PATH,
  ORG_NAME,
  SITE_PAGE_CATALOG,
  TITLE_SUFFIX,
  apexUrl,
  buildMetadata,
  pageMetadata,
} from "@/lib/seo";
import type { RouteType } from "@/lib/seo";

const EXPECTED_PATHS = [
  "/about",
  "/clinical-excellence",
  "/clinical-excellence/fertility-preservation",
  "/clinical-excellence/genetic-testing",
  "/clinical-excellence/holistic-support",
  "/clinical-excellence/iui",
  "/clinical-excellence/ivf",
  "/clinical-excellence/journal",
  "/concierge",
  "/concierge/contact",
  "/faq",
  "/journey",
  "/journey/consultation",
  "/journey/stories",
  "/legal/ethics",
  "/legal/privacy",
  "/legal/terms",
  "/path",
  "/sanctuary",
  "/sanctuary/services",
  "/sanctuary/services/surrogacy",
  "/sanctuary/team",
];

const ROUTE_TYPES: RouteType[] = ["home", "service", "contact", "listing", "legal", "static"];

describe("SITE_PAGE_CATALOG", () => {
  it("matches the M8a route inventory exactly", () => {
    expect(Object.keys(SITE_PAGE_CATALOG).sort()).toEqual(EXPECTED_PATHS);
  });

  it("every entry keys to its own path with a valid routeType", () => {
    for (const [path, entry] of Object.entries(SITE_PAGE_CATALOG)) {
      expect(entry.path).toBe(path);
      expect(ROUTE_TYPES).toContain(entry.routeType);
    }
  });

  it("builds within title and description limits without doubling the suffix", () => {
    for (const [path, entry] of Object.entries(SITE_PAGE_CATALOG)) {
      expect(() => buildMetadata(entry)).not.toThrow();
      const meta = pageMetadata(path);
      expect(`${entry.title}${TITLE_SUFFIX}`.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
      expect((meta.description as string).length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
      expect(meta.alternates?.canonical).toBe(apexUrl(path));
      expect(meta.title).toBe(entry.title);
      expect(entry.title.endsWith(TITLE_SUFFIX)).toBe(false);
      expect(entry.title.includes(ORG_NAME)).toBe(false);
    }
  });
});

describe("pageMetadata", () => {
  it("returns buildMetadata output for catalog paths", () => {
    expect(pageMetadata("/about")).toEqual(buildMetadata(SITE_PAGE_CATALOG["/about"]));
  });

  it("throws for unknown paths", () => {
    expect(() => pageMetadata("/does-not-exist")).toThrow(/No SEO catalog entry/);
  });
});

describe("buildMetadata", () => {
  const base = {
    routeType: "static" as const,
    title: "About Lawon Bloom",
    description: "A short description.",
    path: "/about",
  };

  it("returns the title part for template application and the full og/twitter titles", () => {
    const meta = buildMetadata(base);
    expect(meta.title).toBe("About Lawon Bloom");
    const og = meta.openGraph as unknown as Record<string, unknown>;
    const tw = meta.twitter as unknown as Record<string, unknown>;
    expect(og.title).toBe(`About Lawon Bloom${TITLE_SUFFIX}`);
    expect(tw.title).toBe(`About Lawon Bloom${TITLE_SUFFIX}`);
    expect(og.type).toBe("website");
    expect(og.siteName).toBe(ORG_NAME);
  });

  it("uses an absolute title for the home routeType", () => {
    const meta = buildMetadata({ ...base, routeType: "home", title: DEFAULT_TITLE, path: "/" });
    expect(meta.title).toEqual({ absolute: DEFAULT_TITLE });
  });

  it("throws when the suffixed title would exceed 60 chars", () => {
    expect(() => buildMetadata({ ...base, title: "x".repeat(MAX_TITLE_LENGTH) })).toThrow(
      /exceeds 60 chars/,
    );
  });

  it("throws without a description or a leading-slash path", () => {
    expect(() => buildMetadata({ ...base, description: "   " })).toThrow(/description required/);
    expect(() => buildMetadata({ ...base, path: "about" })).toThrow(/must start with/);
  });

  it("clamps the description to 160 chars", () => {
    const meta = buildMetadata({ ...base, description: "d".repeat(400) });
    expect((meta.description as string)).toHaveLength(MAX_DESCRIPTION_LENGTH);
  });

  it("always ships the 1200x630 fallback OG image and summary_large_image card", () => {
    const meta = buildMetadata(base);
    const og = meta.openGraph as unknown as { images: { url: string; width: number; height: number }[] };
    expect(og.images).toEqual([
      { url: OG_IMAGE_PATH, width: 1200, height: 630, alt: ORG_NAME },
    ]);
    const tw = meta.twitter as unknown as Record<string, unknown>;
    expect(tw.card).toBe("summary_large_image");
  });

  it("honours a custom image and robots passthrough", () => {
    const meta = buildMetadata({
      ...base,
      image: "/custom.png",
      robots: { index: false, follow: false },
    });
    const og = meta.openGraph as unknown as { images: { url: string }[] };
    expect(og.images[0].url).toBe("/custom.png");
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});

describe("verification: guard", () => {
  it("ships no verification: metadata block in source", () => {
    const hits: string[] = [];
    const scan = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
          scan(p);
        } else if (/\.(ts|tsx)$/.test(name) && readFileSync(p, "utf8").includes("verification:")) {
          hits.push(p);
        }
      }
    };
    for (const root of ["app", "lib", "components", "scripts"]) scan(join(process.cwd(), root));
    expect(hits).toEqual([]);
  });
});

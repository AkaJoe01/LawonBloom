import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  SITE_ROUTES,
  filePathToRoute,
  findRouteDrift,
} from "../lib/routes";

function collectPageFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectPageFiles(full));
    } else if (/^page\.tsx?$/.test(entry.name)) {
      out.push(path.relative(process.cwd(), full));
    }
  }
  return out;
}

describe("filePathToRoute", () => {
  it("maps the root page to /", () => {
    expect(filePathToRoute("app/page.tsx")).toBe("/");
  });

  it("maps a nested page to its route", () => {
    expect(filePathToRoute("app/about/page.tsx")).toBe("/about");
    expect(
      filePathToRoute("app/clinical-excellence/journal/page.tsx"),
    ).toBe("/clinical-excellence/journal");
  });

  it("normalizes windows separators", () => {
    expect(filePathToRoute("app\\legal\\privacy\\page.tsx")).toBe(
      "/legal/privacy",
    );
  });

  it("skips route-group segments", () => {
    expect(filePathToRoute("app/(marketing)/blog/page.tsx")).toBe("/blog");
  });

  it("keeps dynamic segments literal", () => {
    expect(filePathToRoute("app/blog/[slug]/page.tsx")).toBe(
      "/blog/[slug]",
    );
  });
});

describe("findRouteDrift", () => {
  it("returns empty drift for matching inputs", () => {
    const drift = findRouteDrift(
      ["/", "/about"],
      ["app/page.tsx", "app/about/page.tsx"],
    );
    expect(drift).toEqual({
      declaredNotInApp: [],
      appNotDeclared: [],
    });
  });

  it("reports a declared route with no page file", () => {
    const drift = findRouteDrift(["/", "/ghost"], ["app/page.tsx"]);
    expect(drift.declaredNotInApp).toEqual(["/ghost"]);
    expect(drift.appNotDeclared).toEqual([]);
  });

  it("reports a page file missing from the declaration", () => {
    const drift = findRouteDrift(["/"], ["app/page.tsx", "app/new/page.tsx"]);
    expect(drift.appNotDeclared).toEqual(["/new"]);
    expect(drift.declaredNotInApp).toEqual([]);
  });
});

describe("routes.ts drift guard", () => {
  it("declares every app page and nothing more", () => {
    const appFiles = collectPageFiles(path.join(process.cwd(), "app"));

    expect(appFiles.length).toBeGreaterThan(0);
    const drift = findRouteDrift(SITE_ROUTES, appFiles);
    expect(drift).toEqual({
      declaredNotInApp: [],
      appNotDeclared: [],
    });
  });

  it("contains no duplicate declarations", () => {
    expect(new Set(SITE_ROUTES).size).toBe(SITE_ROUTES.length);
  });

  it("declares exactly the collected page files", () => {
    const appFiles = collectPageFiles(path.join(process.cwd(), "app"));
    expect(SITE_ROUTES.length).toBe(appFiles.length);
  });
});

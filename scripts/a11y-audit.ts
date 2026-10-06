import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "playwright";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3123";
const PATHS = (
  process.env.AUDIT_PATHS ??
  "/,/blog,/admin/login"
)
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

async function main() {
  const browser = await chromium.launch();
  let failed = false;
  for (const path of PATHS) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const resp = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
    if (!resp || resp.status() >= 400) {
      console.log(`${path}: SKIP (status ${resp?.status()})`);
      await context.close();
      failed = true;
      continue;
    }
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude("iframe")
      .analyze();
    const v = results.violations;
    console.log(`${path}: violations=${v.length}`);
    for (const violation of v) {
      failed = true;
      console.log(`  [${violation.impact}] ${violation.id}: ${violation.help}`);
      for (const node of violation.nodes.slice(0, 3)) {
        console.log(`    - ${node.target.join(" ")}`);
        if (node.failureSummary) console.log(`      ${node.failureSummary.replace(/\n/g, " ")}`);
      }
    }
    await context.close();
  }
  await browser.close();
  if (failed) {
    console.error("A11Y AUDIT FAILED");
    process.exit(1);
  }
  console.log("A11Y AUDIT OK: 0 violations");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

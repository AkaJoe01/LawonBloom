import { chromium } from "playwright";

const BASE = "http://localhost:3123";
const PATHS = ["/", "/blog", "/faq", "/journey/consultation", "/admin/login", "/blog/search"];

async function main() {
  const browser = await chromium.launch();
  const total: string[] = [];
  for (const path of PATHS) {
    const page = await browser.newPage();
    const violations: string[] = [];
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => {
        const ev = e as SecurityPolicyViolationEvent;
        violations.push(`${ev.violatedDirective} | ${ev.blockedURI} | ${ev.sourceFile ?? ""}`);
      });
    });
    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") {
        if (/Content Security Policy|Refused to/i.test(text)) violations.push(`console: ${text}`);
        if (/Uncaught|TypeError|ReferenceError/i.test(text)) violations.push(`js-error: ${text}`);
      }
    });
    page.on("pageerror", (err) => violations.push(`pageerror: ${err.message}`));
    const resp = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(600);
    const status = resp?.status();
    if (!status || status >= 400) violations.push(`http status: ${status}`);
    if (violations.length > 0) total.push(`== ${path} ==\n${violations.join("\n")}`);
    console.log(`${path}: status=${status} violations=${violations.length}`);
    await page.close();
  }
  await browser.close();
  if (total.length > 0) {
    console.error(`\nCSP/JS AUDIT FAILURES:\n${total.join("\n")}`);
    process.exit(1);
  }
  console.log("CSP AUDIT OK: zero violations across all paths");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

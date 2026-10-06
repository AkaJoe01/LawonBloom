const BASE_URL = (process.env.BASE_URL ?? "http://localhost:3123").replace(/\/$/, "");
const APEX = "https://lawonbloomfertilitycentre.com";
const POST_SLUG = process.env.SMOKE_POST_SLUG;

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

async function fetchOk(path: string): Promise<{ status: number; body: string; contentType: string }> {
  const response = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  const body = await response.text();
  return { status: response.status, body, contentType: response.headers.get("content-type") ?? "" };
}

function record(name: string, pass: boolean, detail: string): void {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

async function main(): Promise<void> {
  console.log(`smoke: ${BASE_URL}`);

  const home = await fetchOk("/");
  record("GET /", home.status === 200, `status ${home.status}`);
  record(
    "canonical apex",
    home.body.includes(`rel="canonical"`) && home.body.includes(APEX),
    home.body.includes(`rel="canonical"`) && home.body.includes(APEX)
      ? "canonical points at apex"
      : "canonical/apex link missing",
  );

  const blog = await fetchOk("/blog");
  record("GET /blog", blog.status === 200, `status ${blog.status}`);

  const rss = await fetchOk("/blog/rss.xml");
  record(
    "GET /blog/rss.xml",
    rss.status === 200 && rss.contentType.includes("xml"),
    `status ${rss.status}, content-type ${rss.contentType}`,
  );

  const health = await fetchOk("/api/health");
  let dbUp = false;
  try {
    const json = JSON.parse(health.body) as { ok?: boolean; db?: string };
    dbUp = health.status === 200 && json.ok === true && json.db === "up";
  } catch {
    dbUp = false;
  }
  record("GET /api/health db=up", dbUp, `status ${health.status}, body ${health.body.slice(0, 80)}`);

  const robots = await fetchOk("/robots.txt");
  record(
    "GET /robots.txt",
    robots.status === 200 && robots.body.includes(APEX),
    `status ${robots.status}`,
  );

  const sitemap = await fetchOk("/sitemap.xml");
  record("GET /sitemap.xml", sitemap.status === 200, `status ${sitemap.status}`);

  if (POST_SLUG) {
    const post = await fetchOk(`/blog/${POST_SLUG}`);
    record(`GET /blog/${POST_SLUG}`, post.status === 200, `status ${post.status}`);
  } else {
    console.log("SKIP  known post — set SMOKE_POST_SLUG to check one");
  }

  const failed = checks.filter((check) => !check.pass);
  if (failed.length > 0) {
    console.error(`\nsmoke FAILED: ${failed.length}/${checks.length} checks`);
    process.exit(1);
  }
  console.log(`\nsmoke OK: ${checks.length} checks`);
}

main().catch((error) => {
  console.error(`smoke: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

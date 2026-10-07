import { resolveCname as systemResolveCname, resolveTxt as systemResolveTxt } from "node:dns/promises";

const DOH_ENDPOINTS = ["https://dns.google/resolve", "https://cloudflare-dns.com/dns-query"];

function domainFromArgs(): string {
  const arg = process.argv[2] ?? process.env.LAWON_DOMAIN;
  if (arg) return arg.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const authUrl = process.env.AUTH_URL;
  if (authUrl) return new URL(authUrl).hostname;
  console.error("usage: tsx scripts/check-resend-dns.ts <domain>  (or set AUTH_URL)");
  process.exit(2);
}

function isNoData(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === "ENODATA" || code === "ENOTFOUND" || code === "NXDOMAIN";
}

interface DohAnswer {
  type?: number;
  data?: string;
}

async function dohQuery(name: string, type: "TXT" | "CNAME"): Promise<string[] | null> {
  for (const endpoint of DOH_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?name=${encodeURIComponent(name)}&type=${type}`, {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) continue;
      const json = (await response.json()) as { Status?: number; Answer?: DohAnswer[] };
      // Status 3 (NXDOMAIN) or no answers = authoritative "no records"
      if (json.Status !== 0) return [];
      if (!Array.isArray(json.Answer) || json.Answer.length === 0) return [];
      const wanted = type === "TXT" ? 16 : 5;
      const values = json.Answer.filter((a) => a.type === wanted && typeof a.data === "string").map((a) => a.data as string);
      return values;
    } catch {
      // try next resolver
    }
  }
  return null;
}

async function lookupTxt(name: string): Promise<{ records: string[]; source: string }> {
  try {
    const records = (await systemResolveTxt(name)).map((chunks) => chunks.join(""));
    return { records, source: "system DNS" };
  } catch (error) {
    if (isNoData(error)) return { records: [], source: "system DNS" };
    const records = await dohQuery(name, "TXT");
    if (records) return { records, source: "dns-over-https" };
    throw error;
  }
}

async function lookupCname(name: string): Promise<{ records: string[]; source: string }> {
  try {
    return { records: await systemResolveCname(name), source: "system DNS" };
  } catch (error) {
    if (isNoData(error)) return { records: [], source: "system DNS" };
    const records = await dohQuery(name, "CNAME");
    if (records) return { records, source: "dns-over-https" };
    throw error;
  }
}

async function main(): Promise<void> {
  const domain = domainFromArgs();
  const failures: string[] = [];
  console.log(`check-resend-dns: ${domain}\n`);

  // 1. SPF
  try {
    const { records, source } = await lookupTxt(domain);
    const spf = records.find((entry) => entry.toLowerCase().startsWith("v=spf1"));
    if (!spf) {
      failures.push("SPF: no v=spf1 TXT record on apex");
      console.log("FAIL  SPF — no v=spf1 TXT record");
    } else if (!/amazonses\.com|resend/i.test(spf)) {
      failures.push(`SPF: record does not include Resend (${spf})`);
      console.log(`FAIL  SPF — missing Resend include: ${spf}`);
    } else {
      console.log(`PASS  SPF — ${spf}  (${source})`);
    }
  } catch (error) {
    failures.push(`SPF: lookup failed (${error instanceof Error ? error.message : "unknown"})`);
    console.log(`FAIL  SPF — TXT lookup failed (${error instanceof Error ? error.message : "unknown"})`);
  }

  // 2. DKIM (resend._domainkey — TXT or CNAME depending on Resend dashboard output)
  const dkimName = `resend._domainkey.${domain}`;
  let dkimOk = false;
  try {
    const { records, source } = await lookupTxt(dkimName);
    if (records.length > 0) {
      dkimOk = true;
      console.log(`PASS  DKIM — TXT at ${dkimName}  (${source})`);
    }
  } catch {
    // fall through to CNAME
  }
  if (!dkimOk) {
    try {
      const { records, source } = await lookupCname(dkimName);
      if (records.length > 0) {
        dkimOk = true;
        console.log(`PASS  DKIM — CNAME at ${dkimName} → ${records[0]}  (${source})`);
      }
    } catch {
      // handled below
    }
  }
  if (!dkimOk) {
    failures.push(`DKIM: no TXT/CNAME at ${dkimName}`);
    console.log(`FAIL  DKIM — nothing at ${dkimName}`);
  }

  // 3. DMARC
  try {
    const { records, source } = await lookupTxt(`_dmarc.${domain}`);
    const dmarc = records.find((entry) => entry.toUpperCase().startsWith("V=DMARC1"));
    if (!dmarc) {
      failures.push("DMARC: no v=DMARC1 TXT record at _dmarc");
      console.log("FAIL  DMARC — no v=DMARC1 TXT record");
    } else {
      console.log(`PASS  DMARC — ${dmarc}  (${source})`);
    }
  } catch (error) {
    failures.push("DMARC: lookup failed");
    console.log(`FAIL  DMARC — TXT lookup failed (${error instanceof Error ? error.message : "unknown"})`);
  }

  if (failures.length > 0) {
    console.error(`\nLG-1 NOT closed: ${failures.length} problem(s)`);
    console.error("Add the exact records Resend's dashboard supplies (Vercel DNS), then re-run.");
    process.exit(1);
  }
  console.log("\nLG-1 DNS verified: SPF + DKIM + DMARC present. Mail can be enabled (MAIL_ENABLED=true).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const SECRET_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "RESEND_API_KEY",
  "MAIL_FROM",
  "MAIL_TO",
  "BLOB_READ_WRITE_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "TOTP_ENCRYPTION_KEY",
  "SENTRY_DSN",
  "SEED_ADMIN_EMAIL",
  "SEED_ADMIN_PASSWORD",
];

const BUILD_DIR = path.join(process.cwd(), ".next");
const MAX_FILE_BYTES = 20 * 1024 * 1024;

function loadEnvValues(): Map<string, string> {
  const values = new Map<string, string>();
  for (const file of [".env", ".env.local", ".env.production"]) {
    const filePath = path.join(process.cwd(), file);
    let content: string;
    try {
      content = readFileSync(filePath, "utf8");
    } catch {
      continue;
    }
    for (const line of content.split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (!match) continue;
      const [, key, raw] = match;
      if (!SECRET_KEYS.includes(key)) continue;
      const value = raw.replace(/^["']|["']$/g, "").trim();
      if (value.length >= 6) values.set(key, value);
    }
  }
  return values;
}

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      yield* walk(full);
    } else if (st.size > 0 && st.size <= MAX_FILE_BYTES) {
      yield full;
    }
  }
}

function main() {
  if (!statSync(BUILD_DIR, { throwIfNoEntry: false })) {
    console.error("secrets:check FAILED: no .next directory (run `npm run build` first)");
    process.exit(1);
  }

  const secrets = loadEnvValues();
  if (secrets.size === 0) {
    console.log("secrets:check: no configured secret keys found in env files; nothing to scan");
    process.exit(0);
  }

  const findings: string[] = [];
  let scanned = 0;
  for (const file of walk(BUILD_DIR)) {
    const buffer = readFileSync(file);
    if (buffer.subarray(0, 1024).includes(0)) continue;
    const content = buffer.toString("utf8");
    if (content.includes("\u0000")) continue;
    scanned += 1;
    for (const [key, value] of secrets) {
      if (content.includes(value)) {
        findings.push(`  ${key} leaked in ${path.relative(process.cwd(), file)}`);
      }
    }
  }

  if (findings.length > 0) {
    console.error(`secrets:check FAILED: ${findings.length} leak(s) in build output:`);
    for (const finding of findings) console.error(finding);
    process.exit(1);
  }
  console.log(
    `secrets:check OK: ${secrets.size} secret value(s) absent from ${scanned} build file(s)`,
  );
}

main();

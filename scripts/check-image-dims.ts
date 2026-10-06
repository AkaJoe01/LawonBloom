import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CAP_BYTES = 500 * 1024;
const PUBLIC_DIR = path.join(process.cwd(), "public");
const ALLOWLIST_PATH = path.join(process.cwd(), "scripts", "image-allowlist.json");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg", ".ico"]);

type AllowlistEntry = { bytes: number; width?: number; height?: number };
type Allowlist = Record<string, AllowlistEntry>;

interface ImageInfo extends AllowlistEntry {
  key: string;
}

function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function collectImages(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectImages(full));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

async function describeImage(fullPath: string, key: string): Promise<ImageInfo> {
  const bytes = statSync(fullPath).size;
  if (path.extname(fullPath).toLowerCase() === ".svg") {
    return { key, bytes };
  }
  try {
    const metadata = await sharp(fullPath).metadata();
    return { key, bytes, width: metadata.width, height: metadata.height };
  } catch {
    return { key, bytes };
  }
}

function formatImage(entry: ImageInfo): string {
  const kb = Math.round(entry.bytes / 1024);
  const dims =
    entry.width && entry.height ? `${entry.width}x${entry.height}` : "unknown dimensions";
  return `${entry.key} is ${kb} KB (${dims})`;
}

async function main(): Promise<void> {
  const update = process.argv.includes("--update");
  const images = collectImages(PUBLIC_DIR);
  const entries: ImageInfo[] = [];
  for (const full of images) {
    const key = toPosix(path.relative(process.cwd(), full));
    entries.push(await describeImage(full, key));
  }
  const oversize = entries
    .filter((entry) => entry.bytes > CAP_BYTES)
    .sort((a, b) => a.key.localeCompare(b.key));

  if (update) {
    const allowlist: Allowlist = {};
    for (const entry of oversize) {
      allowlist[entry.key] = {
        bytes: entry.bytes,
        ...(entry.width ? { width: entry.width } : {}),
        ...(entry.height ? { height: entry.height } : {}),
      };
    }
    writeFileSync(ALLOWLIST_PATH, `${JSON.stringify(allowlist, null, 2)}\n`);
    console.log(
      `image allowlist updated: ${oversize.length} oversized entries from ${entries.length} images`,
    );
    return;
  }

  const allowlist: Allowlist = existsSync(ALLOWLIST_PATH)
    ? (JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8")) as Allowlist)
    : {};
  const failures: string[] = [];
  const notices: string[] = [];

  for (const entry of oversize) {
    const allowed = allowlist[entry.key];
    if (!allowed) {
      failures.push(
        `${formatImage(entry)} — over the 500 KB cap and not allowlisted; run "npm run images:update" if intentional`,
      );
    } else if (entry.bytes > allowed.bytes) {
      failures.push(
        `${entry.key} grew from ${allowed.bytes} to ${entry.bytes} bytes; run "npm run images:update" to accept`,
      );
    }
  }

  for (const key of Object.keys(allowlist)) {
    if (!oversize.some((entry) => entry.key === key)) {
      notices.push(`${key} is allowlisted but no longer oversized (stale entry)`);
    }
  }

  for (const notice of notices) {
    console.log(`notice: ${notice}`);
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`fail: ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `image check passed: ${entries.length} images, ${oversize.length} allowlisted oversized`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

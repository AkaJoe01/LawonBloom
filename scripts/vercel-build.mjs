/**
 * Vercel build entry (vercel.json buildCommand).
 *
 * `prisma migrate deploy` requires prisma.config.ts datasource.url (DIRECT_URL).
 * Previews ship without DB env vars (no preview database yet), so:
 *   - production + missing DB env  -> hard fail (never deploy unconfigured)
 *   - preview  + missing DB env    -> skip migrate, still run next build
 *     (next build itself is env-free: verified locally with .env removed)
 *   - DB env present               -> migrate, then build (any environment)
 */
import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const isPreview = process.env.VERCEL_ENV !== "production";
const hasDb = Boolean(process.env.DIRECT_URL || process.env.DATABASE_URL);

if (hasDb) {
  run("npx", ["prisma", "migrate", "deploy"]);
} else if (!isPreview) {
  console.error(
    "[vercel-build] DATABASE_URL/DIRECT_URL missing on a production build — refusing to deploy without a database.",
  );
  process.exit(1);
} else {
  console.warn(
    "[vercel-build] preview build without DB env — skipping `prisma migrate deploy`; next build does not need the database.",
  );
}

run("npx", ["next", "build"]);

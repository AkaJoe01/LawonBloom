<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

Single-package Next.js 16 App Router app (no workspaces). Public routes in `app/(site)/`, admin in `app/admin/`, API routes in `app/api/`. Shared logic in `lib/`, UI in `components/`. Prisma 7 + Neon Postgres, NextAuth v5 beta (credentials), Tailwind v4 (CSS-first, `app/globals.css`), Vitest 5.

## Commands (npm; CI runs Node 22)

- Pre-handoff check, in CI order (`.github/workflows/ci.yml`): `npm run lint` → `npm run typecheck` → `npm run images:check` → `npm run test:coverage` → `npx prisma validate`. These are green on a clean checkout; keep them green.
- `npm ci` (postinstall = `prisma generate`). If your npm gates install scripts (it does on this machine), `@prisma/client` may be stale — run `npx prisma generate` yourself.
- Single test: `npx vitest run tests/lib/seo.test.ts`, or `-t "partial name"`.
- Tests are hermetic — node env, Prisma/sharp/`next/cache` mocked. No `.env`, no database, no server needed. (43 files / 453 tests at last check.)
- `test:coverage` enforces 80% lines/functions/branches/statements over `lib/**` + `app/api/**`; CI fails below it.
- `npm run lint` = bare `eslint`, which lints the whole repo. It fails on **errors only** — the `--max-warnings 0` budget mentioned in `ops/launch-checklist.md` is *not* wired into CI.
- `next build` needs **no** env vars (verified). Deploy entry is `scripts/vercel-build.mjs` (via `vercel.json`): runs `prisma migrate deploy` when DB env exists, hard-fails on a production build without DB env, skips migrate on previews.
- Any file in `public/` over 500 KB must be listed in `scripts/image-allowlist.json` or `images:check` fails. After adding/resizing images run `npm run images:update` and commit the allowlist diff.
- Server-dependent checks (CI `build-audit` job): the job starts a Postgres 16 service, runs `npx prisma migrate deploy` → `npm run db:seed` → `npx tsx scripts/_m6-audit-fixtures.ts`, builds, then serves via `npx next start -p 3123` for `scripts/seo-audit.ts` (`AUDIT_DB: required`, so `/blog` + `/blog/search` are hard-checked), `scripts/csp-audit.ts` and `scripts/a11y-audit.ts` (`AUDIT_PATHS` includes `/blog` and `/blog/m6-audit-fixture`), `npx lhci autorun` (perf smoke, non-blocking), and `npm run smoke` (`SMOKE_POST_SLUG=m6-audit-fixture`). These need Playwright's chromium and stay out of the unit loop.

## Adding or removing a page — three registries must move together

`tests/routes.test.ts` fails on drift between them:

- `lib/routes.ts` `SITE_ROUTES` must match `app/**/page.tsx` exactly (route groups like `(site)` are stripped, dynamic segments stay literal).
- `lib/seo/catalog.ts` `SITE_PAGE_CATALOG` needs an entry — `pageMetadata()` throws for an unknown path. `tests/lib/seo-metadata.test.ts` compares its keys to a hard-coded sorted list (`EXPECTED_PATHS`), so update that too.
- New/removed exports from `lib/seo/*` → update `EXPECTED_SURFACE` in `tests/lib/seo-barrel.test.ts`.

## Enforced conventions (lint/tests, not preferences)

- `lib/seo.ts` is a barrel that shadows the `lib/seo/` directory. It must contain only re-exports; **never create `lib/seo/index.ts`**. Import `@/lib/seo` or a subpath (`@/lib/seo/site`). See the header in `lib/seo.ts`.
- `dangerouslySetInnerHTML` is banned in every `.tsx` except `components/blog/PostBody.tsx` — blog HTML is sanitized in `lib/posts/render.ts` before it reaches that component.
- Legacy `font-display` / `font-h1-editorial` / `font-label-caps`-style classes are banned inside `components/blog/**` and `app/(site)/blog/**`; use the blog typography scale in `app/globals.css`.
- CSP (per-request nonce) and the `/admin/*` gate live in `proxy.ts` — Next 16's rename of `middleware.ts`; it exports `proxy()`, not `middleware()`. Changing directives means updating `buildCspHeader` and `tests/proxy.test.ts`.
- `lib/env.ts` zod schema is validated **only by tests**; runtime code reads `process.env` directly, so a missing var fails at first use, not at boot. There is no `.env.example` (`.env*` is gitignored) — take the key names from `lib/env.ts`, and `.github/workflows/ci.yml`'s `build-audit` env block is a working reference set.
- Gitleaks runs in CI with `.gitleaks.toml` (value/path allowlist). Literal-looking secrets in tests or workflows will fail the scan — extend the allowlist rather than weakening the scan. `npm run secrets:check` scans the built `.next` for leaked env values.

## Layout gotchas

- Routes are kebab-case (`app/(site)/clinical-excellence`), component folders are camelCase and sometimes flatten segments (`components/clinicalExcellence`, `components/conciergeContact`). `design.md`'s "mirror the exact path" wording is aspirational — copy the existing naming.
- Read `design.md` before styling: palette/typography tokens and the reusable classes (`.glass-panel`, `.bento-card`, `.grain-overlay`, …) all live in `app/globals.css`. Icons: `lucide-react` only.
- Root-level `auth.ts` (NextAuth config) and `proxy.ts` are the request entrypoints; `lib/auth/` holds the logic they call.

## Docs that change how you work

- `ops/tech-debt.md` — known failures and root causes. Notably, past Vitest timeouts were CPU contention, fixed by `testTimeout: 15_000` + `maxWorkers: 8`; do **not** raise the timeout again — a 15 s timeout means a broken test.
- `ops/launch-checklist.md` (current launch state), `ops/runbooks/` (mail, migration, Neon restore, access), `ops/monitoring.md`.
- `CLAUDE.md` just includes this file; keep them in sync by editing only here.

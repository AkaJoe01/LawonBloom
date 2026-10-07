# Tech debt / known issues

## TICKET-1 — vitest flakes under local CPU contention (RESOLVED, monitor)

- **Symptom:** two one-off failures in one session (2026-10-07):
  `tests/lib/og.test.ts` satori render (`Test timed out in 5000ms`) and
  `tests/auth/password.test.ts` argon2id round-trip (same timeout). Different
  test each run; both CPU-bound; each passed on isolated retry.
- **Root cause:** machine at 100% CPU from a concurrent workspace
  (turbo/jest/nest/ng). 39 isolate workers + 5s default timeout = no headroom.
- **CI impact:** none observed. 13 GitHub Actions runs — **zero test-step
  failures** (runs 5-9 failed at gitleaks, 10-11 at `npm audit` on `main`,
  run 4 at lint on a dependabot branch; see below).
- **Structural fix (2026-10-07):** `vitest.config.mts` → `testTimeout: 15_000`
  (hang detection retained, 3× headroom for legit slow tests) and
  `maxWorkers: 8` (caps self-contention). Retry is no longer the recovery path.
- **Monitor:** if a timeout recurs at 15s on an idle machine, the test itself
  is broken — do not raise again.

## TICKET-2 — CI red causes (fixed here / branch-scoped)

- **gitleaks (runs 5-9):** 3 findings — committed CI placeholders in
  `.github/workflows/ci.yml` (AUTH_SECRET hex, TOTP key) and the password
  alphabet in `lib/auth/password.ts`. Fixed with `.gitleaks.toml`
  (value/path allowlist, not fingerprint-based). Verified locally:
  `gitleaks detect` → 0 leaks across 85 commits.
- **`npm audit --omit=dev` (runs 10-11, `main`):** fails on `main`'s
  dependency set. On `m0-foundation` (this branch) audit = 0 vulnerabilities.
  Clears when `main` merges forward.
- **lint (run 4):** dependabot branch only; not our code.
- **Gap:** runs 5-9 died at gitleaks, so lint/typecheck/tests never executed
  on PRs since run 4. First full CI run on this branch happens at the next
  PR/open or merge to `main`.

## TICKET-3 — `main` and `m0-foundation` have diverged

- Production (custom domain) serves `main` (last: `006c8ae`, pre-M6).
- `m0-foundation` carries M0–M8a and is the launch branch. Merge to `main`
  is a launch step; production builds on `main` never run `prisma migrate
  deploy` (no `vercel.json` there) — after merge, first production build uses
  `scripts/vercel-build.mjs` and requires `DATABASE_URL`/`DIRECT_URL` in the
  Production env scope (hard-fails without them, by design).

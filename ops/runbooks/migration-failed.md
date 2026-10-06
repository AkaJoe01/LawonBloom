# Runbook — Migration failed (fail-closed deploy)

Plan ref: §14c, Q43, Q45.

## What you will see

- Vercel build fails during `prisma migrate deploy` (runs inside the build command).
- Previous deployment **keeps serving** — fail-closed by design.
- GitHub Actions (if the push ran CI) shows the build stage red; Sentry may capture the
  build error if the release step ran.

## Rules

1. **Forward-fix only.** Never write a down-migration; expand/contract guarantees the
   previous code runs against the new schema.
2. Seed is never rolled back and never runs inside `next build`.

## Procedure

1. **Pause.** Do not retry blindly; read the migration error in the Vercel build log.
2. **Diagnose** common causes:
   - SQL error → inspect the migration file in `prisma/migrations/`.
   - Lock/timeout on Neon → re-run once (transient); if it persists, check active
     connections in the Neon console.
   - Drift (manual SQL was applied) → compare `_prisma_migrations` rows with files.
3. **Write a corrective forward migration** on a branch:
   `npx prisma migrate dev --create-only`, edit SQL, `npx prisma migrate deploy` against
   a scratch branch first if the change is destructive.
4. **Push** → Vercel rebuilds → `migrate deploy` runs → deployment succeeds.
5. **Smoke:** `BASE_URL=https://lawonbloomfertilitycentre.com npx tsx scripts/smoke.ts`.
6. **Verify health:** `curl https://lawonbloomfertilitycentre.com/api/health` →
   `{"ok":true,"db":"up"}` and the expected `migrations` count.

## Rollback (only if the bad migration already deployed)

- Vercel: instant rollback to the previous deployment (previous code tolerates the new
  schema via expand/contract).
- Schema: fix forward — never `migrate down`.

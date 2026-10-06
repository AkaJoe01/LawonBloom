# Runbook — Restore Neon database (drill + real incident)

Plan ref: §15a (monthly drill), §15b #2.

## When

- **Monthly drill:** restore the latest backup to a scratch branch and prove the smoke
  suite passes. Log the result in `ops/restore-drills.md`.
- **Real incident:** data loss/corruption in production.

## Rules

- Never point production at a restore target until the restore has been validated.
- Restores create a **new branch** — production's own branch is untouched until you
  explicitly repoint.
- Seed (`scripts/seed.ts`) is idempotent and safe to run after a restore.

## Drill procedure (monthly)

1. Neon console → select the project → **Restore** → choose the latest backup → target
   a scratch branch named `scratch-restore-YYYYMMDD`.
2. Copy the scratch branch's pooled + direct URLs.
3. Locally:
   ```
   DATABASE_URL=<scratch-pooled> DIRECT_URL=<scratch-direct> \
   AUTH_SECRET=<local-secret> AUTH_URL=https://lawonbloomfertilitycentre.com \
   RESEND_API_KEY=dummy MAIL_FROM=drill@example.com MAIL_TO=drill@example.com \
   MAIL_ENABLED=false BLOB_READ_WRITE_TOKEN=dummy \
   UPSTASH_REDIS_REST_URL=https://example.upstash.io UPSTASH_REDIS_REST_TOKEN=dummy \
   TOTP_ENCRYPTION_KEY=<32+ chars> SEED_ADMIN_EMAIL=<admin> SEED_ADMIN_PASSWORD=<14+ chars> \
   npm run build
   DATABASE_URL=<scratch-pooled> DIRECT_URL=<scratch-direct> npx tsx scripts/seed.ts
   DATABASE_URL=<scratch-pooled> npx next start -p 3124 &
   BASE_URL=http://localhost:3124 npx tsx scripts/smoke.ts
   ```
   (Or run smoke against a preview deployment whose env points at the scratch branch.)
4. Confirm all smoke checks pass; record duration + any anomalies in
   `ops/restore-drills.md`.
5. Drop the scratch branch (Neon console).

## Real-incident restore

1. Follow the drill procedure to validate the candidate backup on a scratch branch.
2. Repoint **production** env (`DATABASE_URL`/`DIRECT_URL` in Vercel) at the restored
   branch → redeploy → run `scripts/smoke.ts` against production.
3. Run `npx tsx scripts/seed.ts` with production seed env (idempotent).
4. Verify `/api/health` migrations count, admin login, and the latest published post.
5. Post-incident: file the data-loss window, notify clinic staff, and add a follow-up
   migration for any schema changes newer than the backup.

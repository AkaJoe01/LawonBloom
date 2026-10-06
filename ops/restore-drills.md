# Restore drills (monthly)

Plan ref: §15a Q37/Q50 — Neon daily backup, no PITR; **monthly restore drill**:
restore the latest backup to a scratch branch, run the smoke suite, log it here.

Procedure: `ops/runbooks/restore-neon.md`.

| # | Date | Backup age | Branch | Smoke result | Duration | Operator | Notes |
|---|---|---|---|---|---|---|---|
| 1 | _pending_ | — | `scratch-restore-YYYYMMDD` | — | — | _blocked: needs Neon project access_ | First drill must run before launch (§17 DoD). |

## How to complete drill #1

1. Neon console access confirmed (owner: clinic/dev).
2. Follow `ops/runbooks/restore-neon.md` → Drill procedure.
3. Replace the `_pending_` row with the real result and sign it.

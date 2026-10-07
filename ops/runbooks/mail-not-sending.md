# Runbook — Mail not sending (LG-1 / degraded mode)

Plan ref: §0 degraded mode, C-3/LG-1, §15b #3, Q31 honest-state matrix.

## Symptoms by state

| Symptom | Meaning |
|---|---|
| Enquiry form says "we've received your enquiry" (never "you'll get an email") | **Expected degraded mode** (`MAIL_ENABLED=false`). Not a bug. |
| Form returns `mailFailed: true` / HTTP 500 on `/api/send-consultation` | Mail enabled but send failed. |
| `mail_failed` events in logs/Sentry | Same failure, structured form (`evt:"mail_failed"` with `template` + `err`). |
| Admin enquiries show records but no clinic notification | Degraded mode — visible in `/admin/enquiries`. |

## Quick checks (in order)

1. **`MAIL_ENABLED`** in Vercel env: `false` → degraded mode by design; flip to `true`
   only after LG-1 DNS is verified (below). Env changes apply on the next deployment —
   no code change required.
2. **Resend dashboard** → Logs: is the message accepted/bounced/failed? Error codes
   map to: invalid key (401), domain not verified (422), insufficient quota (402).
3. **Env completeness:** `MAIL_FROM` must be a sender on the verified Resend domain;
   `MAIL_TO` is the clinic allowlist (comma-separated).
4. **LG-1 DNS** (SPF + DKIM + DMARC) — verify from the repo:
   ```
   npx tsx scripts/check-resend-dns.ts lawonbloomfertilitycentre.com
   ```
   All three must pass. Records as supplied by the Resend dashboard win over any
   values quoted elsewhere (plan §C-3: SPF `v=spf1 include:amazonses.com ~all`,
   selector `resend._domainkey`, plus a DMARC policy).

## Degraded-mode copy rules (never change silently)

- Success copy claims **receipt only** — never promises an email will arrive.
- `enquiry_partial` is logged when the DB write succeeded but notification failed;
  the API still returns `received: true, notified: false`.
- Full Q31 semantics apply only post-LG-1: success = DB write **and** clinic
  notification dispatched.

## After fixing

1. Send a real enquiry (staging or production) → expect `notified: true`, no
   `mail_failed` event.
2. Check Resend dashboard shows a delivered message.
3. Update `ops/launch-checklist.md` LG-1 status; if mail is deliberately left off,
   record the clinic's degraded-mode sign-off instead.

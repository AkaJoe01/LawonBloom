# Monitoring — UptimeRobot + Sentry alert rules

Plan ref: §15a, §12b breach posture, Q36–Q38.

## UptimeRobot (free tier, 5-minute interval)

Create three monitors:

| # | Monitor | Target | Expect |
|---|---|---|---|
| 1 | Home | `https://lawonbloomfertilitycentre.com/` | HTTP 200 |
| 2 | Blog index | `https://lawonbloomfertilitycentre.com/blog` | HTTP 200 |
| 3 | Health | `https://lawonbloomfertilitycentre.com/api/health` | HTTP 200, body `"db":"up"` (503 when down) |

Alert contacts: clinic email + admin.

**Alert conditions:**

- Sustained 5xx: 5 consecutive failed checks (UptimeRobot alert type).
- `db=down`: health monitor 503 (its JSON says `{"ok":false,"db":"down"}`).
- Deploy/migration failure: GitHub Actions failure notification (separate channel).
- Upstash 70% daily usage: Upstash console alert (separate channel).

## Sentry alert rules (project → Alert rules)

1. **`mail_failed`** — Issues where the event payload matches `"evt":"mail_failed"`
   (or level = error with `template` tag) → notify clinic email. Catches degraded-mode
   regressions and Resend failures the moment they happen.
2. **Auth anomaly** — ≥5 `evt:"lockout"` events within 1 hour → notify + page the
   admin (plan §12b: admin notified within 1h; consider brute-force clusters a
   potential incident).
3. **Data-route 5xx spike** — error rate on `/api/admin/*` + `/api/*` routes ≥ threshold
   in 15 min → notify (§12b breach posture).

## Log correlation

App log lines are single-line JSON: `{lvl, evt, rid, ts, ...}`.

- `rid` matches the platform request id (`x-vercel-id` header on Vercel), so Vercel
  function logs and app events for the same request line up.
- Canonical events: `login_success`, `login_failed`, `lockout`, `backup_code_used`,
  `editor_created`, `publish`, `media_delete`, `enquiry_partial`, `mail_failed` (plan
  §15a) plus operational extras (`post_created`, `post_deleted`, `post_unpublished`,
  `user_deactivated`, `user_activated`, `password_reset`, `totp_enabled`,
  `enquiry_created`, `seed_*`, media failure variants).
- **No PII:** values are IDs; the logger redacts sensitive keys and email-shaped
  strings defensively (`lib/observability/log.ts`). Enquiry bodies never reach logs.

## Error monitoring (Sentry)

- Server: `instrumentation.ts` (Node runtime only, gated on `SENTRY_DSN`).
- Browser: `instrumentation-client.ts` (gated on `NEXT_PUBLIC_SENTRY_DSN`).
- Both run the Q36 scrubber (`lib/observability/sentry-scrub.ts`): strips enquiry PII,
  tokens, cookies, authorization; query strings removed from URLs.
- Source maps + release: set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` in CI
  env → `withSentryConfig` activates automatically (skipped when unset so local/CI
  builds stay green).

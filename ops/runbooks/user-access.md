# Runbook — User access (lockout, deactivation, lost TOTP)

Plan ref: §15b #4, §A4 auth flows, Q11 backup codes.

## Account lockout (5 failed attempts / 15 min, 10-minute lock)

**Automatic clearing:** the lock expires on its own after 10 minutes
(`lockedUntil`). The user simply waits.

**Manual clearing (support request):**

1. Verify identity out-of-band (clinic staff knows the editor personally).
2. Admin UI → Users → activate the user (also clears an inactive flag), or SQL:
   ```sql
   UPDATE "User" SET "lockedUntil" = NULL, "failedLogins" = 0
   WHERE email = '<email>';
   ```
3. Every third lockout sends an `account_lockout_alert` email to the clinic
   (post-LG-1 only — during degraded mode watch for `lockout` events in logs).

## Deactivation (offboarding / compromise)

- Admin UI → Users → deactivate. This sets `isActive = false` **and increments
  `sessionEpoch`**, which invalidates every live JWT session immediately (checked on
  each request) — no waiting for expiry.
- Event logged: `evt:"user_deactivated"`.

## Admin TOTP loss (lost authenticator)

**Path A — backup codes (emergency access only):**

1. On the login TOTP prompt, enter an unused 10-character backup code
   (format `A-Z2-9`, e.g. `K7M2Q9XR4B`).
2. Backup codes get the admin in, but **they do not re-roll the authenticator**:
   `/api/auth/totp/setup` returns `already_enrolled` while `totpEnabled = true`, and
   each backup code is single-use. So Path A buys time only — schedule Path B promptly
   before codes run out (event on use: `evt:"backup_code_used"`).

**Path B — dual-control DB secret reset (the actual recovery).**

Requires **two authorized people** to be present (plan §15b: dual control):

1. Person A runs, with Person B watching:
   ```sql
   UPDATE "User"
   SET "totpSecret" = NULL, "totpEnabled" = FALSE, "sessionEpoch" = "sessionEpoch" + 1
   WHERE email = '<email>';
   ```
2. The user logs in with password only; Auth.js flags `needsEnrollment` and the
   onboarding flow forces a fresh TOTP enrollment before any admin route is reachable
   (`app/admin/(authed)/layout.tsx` is the authority).
3. Both persons record the incident (who/when/why) in the clinic's access log.
4. Event trail: login without TOTP → forced enrollment → `evt:"totp_enabled"`.

## Password reset (admin-initiated)

- Admin UI → Users → reset password. Returns a **display-once** temporary password;
  it is shown exactly once and never emailed (R10 residual accepted, mitigated by CSP).
- Event: `evt:"password_reset"`.

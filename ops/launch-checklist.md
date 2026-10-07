# Launch checklist (§17 global DoD)

## Engineering (repo-verified)

- [x] M0–M8a DoDs green; CI stages 1–7 green on `m0-foundation`; coverage ≥80% on
      `lib/` + `app/api/` (current: 93.9 / 84.9 / 98.1 / 97.0).
- [x] **M8a:** site-wide metadata — title template (`%s | Lawon Bloom Fertility Centre`),
      22-page `SITE_PAGE_CATALOG` + `lib/seo/` barrel (site|metadata|catalog|jsonld),
      OG/Twitter tags on all 25 checked routes, noindex on 404/`/blog/search`/`/admin/login`,
      `robots.txt` `Host:`, sitemap static entries without `lastModified`,
      `scripts/seo-audit.ts` (parse5, 396 checks) wired into CI.
- [x] Structured logs: all §15a events wired through `lib/observability/log.ts`
      (`login_success|login_failed|lockout|backup_code_used|editor_created|publish|
      media_delete|enquiry_partial|mail_failed`), PII-redacting.
- [x] Sentry wiring: server `instrumentation.ts` + browser `instrumentation-client.ts`,
      Q36 `beforeSend`/`beforeBreadcrumb` scrubber, source maps auto-activate when
      `SENTRY_ORG/PROJECT/AUTH_TOKEN` are set.
- [x] Privacy policy §12a published as `PRIVACY.md` + `/legal/privacy` (v2);
      `CONSENT_VERSION = "v2"` persisted with each enquiry.
- [x] Runbooks: `ops/runbooks/{migration-failed,restore-neon,mail-not-sending,user-access}.md`.
- [x] Monitoring doc: `ops/monitoring.md` (UptimeRobot monitors + Sentry alert rules).
- [x] Helpers: `scripts/smoke.ts` (drill/post-deploy smoke), `scripts/check-resend-dns.ts`
      (LG-1 verification), `scripts/csp-audit.ts`, `scripts/a11y-audit.ts`.
- [ ] Rich Results Test passes (Article + FAQ sample); sitemap drift test green;
      OG cards validate in LinkedIn/X.
- [ ] Enquiry honest-state matrix verified (success / partial / failed / rate-limited /
      honeypot).
- [ ] Open relay + false-success verifiably gone, with regression test.

## Blocked on preview env + GitHub secrets (plan §14b)

- [ ] Q40 E2E journeys 1–4 green on preview; axe 0 violations (index/post/login).
- [ ] LHCI within Q41 budgets vs preview (hard gate stage 15/16).
- [ ] CI stages 8–16 (Neon CI branch, Vercel preview, E2E/axe/LHCI vs preview).
- [ ] Production post-deploy workflow: seed → smoke → Sentry release.

## Owner actions (clinic/dev)

- [ ] **LG-1:** add Resend DNS (SPF `v=spf1 include:amazonses.com ~all`, `resend._domainkey`,
      DMARC) in Vercel DNS → `npx tsx scripts/check-resend-dns.ts lawonbloomfertilitycentre.com`
      all green → set `MAIL_ENABLED=true` (env-only flip; redeploy applies it).
      *Or* launch in documented degraded mode with clinic sign-off.
- [ ] **UptimeRobot:** three monitors per `ops/monitoring.md` + alert contacts.
- [ ] **Sentry alert rules:** `mail_failed`, lockout-cluster (≥5/hr), data-route 5xx
      (see `ops/monitoring.md`); create account + set `SENTRY_DSN` /
      `NEXT_PUBLIC_SENTRY_DSN` in Vercel, `SENTRY_ORG/PROJECT/AUTH_TOKEN` in GitHub.
- [ ] **Restore drill #1** executed and logged in `ops/restore-drills.md`.
- [ ] Vercel env complete (12 required keys, `lib/env.ts`) + Blob store created.
- [ ] GitHub secrets/environments for stages 8–16 (plan §14b).
- [ ] C-1 confirmed (Vercel Hobby + Neon Free baseline) or upgraded.
- [ ] **H1:** clinic sign-off (written OK) on the M8a metadata copy — catalog titles
      and descriptions shipped as-draft (≤60/≤160 chars) per the SEO plan.
- [ ] **H1:** confirm the **7 FAQ answers** in `app/(site)/faq/faqs.ts` are clinically
      accurate before M8b ships `FAQPage` schema; unconfirmed answers stay out of
      schema (remain visible in the UI).

## Post-launch 24h

- [ ] `/api/health` `db=up`, zero `mail_failed`, zero 5xx in Vercel logs.
- [ ] UptimeRobot all green; Sentry issues triaged.
- [ ] Submit sitemap in Google Search Console; run Rich Results Test.
      Sequencing: there is no separate blog launch — one production deploy carries
      blog + M8, and GSC submission waits for that deploy (both must be live).

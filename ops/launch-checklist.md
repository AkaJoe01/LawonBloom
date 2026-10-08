# Launch checklist (§17 global DoD)

## Engineering (repo-verified)

- [x] M0–M8a DoDs green; CI stages 1–7 green on `m0-foundation`; coverage ≥80% on
      `lib/` + `app/api/` (current: 93.9 / 84.9 / 98.1 / 97.0).
- [x] **M8a:** site-wide metadata — title template (`%s | Lawon Bloom Fertility Centre`),
      22-page `SITE_PAGE_CATALOG` + `lib/seo/` barrel (site|metadata|catalog|jsonld),
      OG/Twitter tags on all 25 checked routes, noindex on 404/`/blog/search`/`/admin/login`,
      `robots.txt` `Host:`, sitemap static entries without `lastModified`,
      `scripts/seo-audit.ts` (parse5, 396 checks) wired into CI.
- [x] **Vercel preview builds:** `scripts/vercel-build.mjs` skips
      `prisma migrate deploy` when DB env is absent on previews (hard-fails
      without it on production); `next build` verified env-free locally.
      `.gitleaks.toml` returns CI's secret scan to green (0 leaks, 85 commits).
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
- [x] Sitemap drift test green (`tests/lib/sitemap.test.ts` in the 411-test
      suite; live sitemap = 30 URLs incl. all published posts) and live
      JSON-LD validated against served HTML 2026-10-08: Organization /
      WebSite / MedicalClinic parse on every audited route with unique
      `@id`s, Article parses on the published post, FAQPage correctly
      withheld (0 of 6 FAQ entries confirmed, pre-H1).
- [ ] Rich Results Test (Google UI, Article + FAQ sample) and OG card
      rendering in LinkedIn/X — manual, run against the live host.
      **M8b DoD note:** previews (and the production *.vercel.app alias) are
      behind Vercel Authentication — verified 2026-10-07, unauthenticated
      probe returns the "Protected Deployment" login wall. Google's Rich
      Results Test and social-card scrapers cannot fetch previews, so these
      checks **move to post-deploy** against the production custom domain;
      pre-launch verification is local (`seo-audit` + JSON-LD unit tests).
- [x] **M8c DoD:** lint warnings drop **5 → 0** (raw `<img>` → `next/image`
      conversions per §8-E); budget stays `--max-warnings 0` afterwards.
      Verified 2026-10-08: `npx eslint . --max-warnings 0` exits 0.
- [ ] **M8b H1 precondition:** FAQ array confirmed (see Owner actions H1);
      FAQPage schema gated on per-entry `confirmed` flags in code.
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
- [ ] **Domain config (2026-10-08):** Vercel's primary domain currently
      serves `www.lawonbloomfertilitycentre.com` — the apex answers
      `307 → www` for every path (including `robots.txt`/`sitemap.xml`),
      while every canonical, sitemap `<loc>` and robots `Host:` in code
      points at the apex (`lib/seo/site.ts` `APEX`). Set primary = apex in
      Vercel (apex serves 200; www `308` → apex), *or* approve switching
      the code's canonical host to www. Until then crawlers cross a
      temporary redirect between hosts. `seo-audit` follows redirects, so
      audits pass on either config.
- [ ] C-1 confirmed (Vercel Hobby + Neon Free baseline) or upgraded.
- [ ] **H1:** clinic sign-off (written OK) on the M8a metadata copy — catalog titles
      and descriptions shipped as-draft (≤60/≤160 chars) per the SEO plan.
- [ ] **H1:** confirm the **6 FAQ answers** in the FAQ array
      (`app/(site)/faq/` — the historical "7" was a wrong count; file is
      authoritative) are clinically accurate before M8b ships `FAQPage`
      schema; schema ships only entries flagged `confirmed` (unconfirmed
      answers stay visible in the UI, out of schema).

## Post-launch 24h

- [ ] `/api/health` `db=up`, zero `mail_failed`, zero 5xx in Vercel logs.
- [ ] UptimeRobot all green; Sentry issues triaged.
- [ ] Submit sitemap in Google Search Console; run Rich Results Test.
      Sequencing: there is no separate blog launch — one production deploy carries
      blog + M8, and GSC submission waits for that deploy (both must be live).
      Pre-reqs spot-checked 2026-10-08 (live JSON-LD parses on served pages;
      sitemap/robots serve correctly; canonicals render); full live
      `seo-audit` re-runs after the next deploy. Needs the clinic's Google account.

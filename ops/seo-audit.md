# SEO audit (`scripts/seo-audit.ts`)

Rendered-metadata gate for M8a+. Parses server-rendered HTML with **parse5**
and asserts, per route: title (= catalog title + layout template, ≤60 chars),
meta description, canonical, `og:title`/`og:url`/`og:description`/`og:image`
(+`width`/`height` 1200×630), `twitter:card`, title distinctness, noindex on
`/blog/search`, `/admin/login` and 404s, `robots.txt` Host/Sitemap/Disallow,
sitemap (24 static entries, no `<lastmod>` on static URLs, apex-only),
and that `/og-fallback.png` decodes to exactly 1200×630.

## Running

```bash
# local, strict (database required — /blog and /blog/search fully checked)
npm run build && npm run start        # server on :3123
AUDIT_DB=required BASE_URL=http://localhost:3123 npx tsx scripts/seo-audit.ts

# CI (no database): DB routes auto-skip with a WARN on 5xx
npx tsx scripts/seo-audit.ts          # BASE_URL defaults to localhost:3123
```

Exit 0 = green. Wired into `.github/workflows/ci.yml` (build-audit job, after
server start).

## Host / redirect note (2026-10-08)

The Vercel primary domain currently serves **www**; the apex
(`https://lawonbloomfertilitycentre.com`) answers `307 → www` while every
canonical, sitemap `<loc>` and robots `Host:` in code points at the apex
(`lib/seo/site.ts` `APEX`). The audit therefore fetches with
`redirect: "follow"` — it validates the HTML actually served, whichever host
answers. Reconciling apex vs www is Vercel domain config, tracked as an
owner action in `ops/launch-checklist.md`.

## Known inheritance contract

- **`/blog/search` defines its own full `openGraph`** (fixed 2026-10-08): the
  page used to ship only title/robots/canonical and inherited
  `og:url = APEX` from `app/(site)/layout.tsx`. It now sets
  `og:url = apexUrl("/blog/search")` plus title/description/image so the
  route's social tags point at itself (still `noindex`). Next shallow-merges
  top-level metadata keys — a *partial* `openGraph` would replace the
  layout's entirely, hence the complete block.
- Catalog pages return title **parts**; `layout.tsx` `title.template`
  (`%s | Lawon Bloom Fertility Centre`) appends the suffix at render time.
  `buildMetadata()` puts the full suffixed title only into `og:title`/`twitter.title`.

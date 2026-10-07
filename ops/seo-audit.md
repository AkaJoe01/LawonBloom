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

## Known inheritance contract

- **`/blog/search` `og:url` = apex, not the page URL.** The page's metadata
  (§9-owned, not modified in M8a) sets only title/robots/canonical, so its
  whole `openGraph` block is inherited from `app/(site)/layout.tsx`
  (`url: APEX`). The audit asserts this inheritance explicitly
  (`ogUrl: APEX` in `scripts/seo-audit.ts`). Fixing it means giving the page
  a full `openGraph` object (Next shallow-merges top-level metadata keys — a
  partial og replaces the layout's entirely). Low value: the route is
  `noindex`.
- Catalog pages return title **parts**; `layout.tsx` `title.template`
  (`%s | Lawon Bloom Fertility Centre`) appends the suffix at render time.
  `buildMetadata()` puts the full suffixed title only into `og:title`/`twitter.title`.

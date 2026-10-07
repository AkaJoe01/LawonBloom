/**
 * SEO barrel — RESOLUTION RULE (read before editing):
 *
 * This file SHADOWS the sibling `lib/seo/` directory for `@/lib/seo`
 * imports: TypeScript resolves `lib/seo.ts` (file) before
 * `lib/seo/index.ts` (directory index). Consequences:
 *
 *   1. This file must contain ONLY re-exports — no logic, no constants.
 *   2. New SEO code goes in `lib/seo/{site,metadata,catalog,jsonld}.ts`
 *      and is reached via this barrel or a subpath (`@/lib/seo/site`).
 *   3. Never create `lib/seo/index.ts` — it would be unreachable dead code.
 *
 * Enforced by: eslint `no-restricted-imports` (bans `.../seo/index*`)
 * and `tests/lib/seo-barrel.test.ts` (barrel purity + symbol surface).
 */
export * from "./seo/site";
export * from "./seo/metadata";
export * from "./seo/catalog";
export * from "./seo/jsonld";

---
name: nuxtjs-seo-skilld
description: "ALWAYS use when writing code importing \"@nuxtjs/seo\". Consult for debugging, best practices, or modifying @nuxtjs/seo, nuxtjs/seo, nuxtjs seo, nuxt-seo, nuxt seo."
metadata:
  version: 5.3.2
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# harlan-zw/nuxt-seo `@nuxtjs/seo@5.3.2`
**Tags:** latest: 5.3.2

**References:** [package.json](./.skilld/pkg/package.json) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `pnpm exec skilld search "query" -p @nuxtjs/seo` instead of grepping `.skilld/` directories. Run `pnpm exec skilld search --guide -p @nuxtjs/seo` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes across major releases — focus on recent v5 changes and the v4→v5 migration.

### Site Config (v3→v4)

- BREAKING: `useSiteConfig()` — server-side API replaced with `getSiteConfig(event)` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L64)
- BREAKING: `getSiteIndexable()` — replaced with `getSiteConfig(event).indexable` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L65)
- BREAKING: `SiteConfig` type — renamed to `SiteConfigResolved` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L66)
- BREAKING: Legacy runtime config keys — `siteUrl`, `siteName`, `siteDescription` no longer supported, migrate to `site` object [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L43:60)
- BREAKING: `site.name` must be set explicitly — no longer inferred from `package.json` or directory name [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L31:41)

### Content Collections (Nuxt Content v3)

- DEPRECATED: `asSeoCollection()` — use individual schema functions instead [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L73:114)
- BREAKING: `asRobotsCollection()` → `defineRobotsSchema()` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L137:148)
- BREAKING: `asSitemapCollection()` → `defineSitemapSchema()` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L137:148)
- BREAKING: `asOgImageCollection()` → `defineOgImageSchema()` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L137:148)
- BREAKING: `asSchemaOrgCollection()` → `defineSchemaOrgSchema()` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/5.v4-to-v5.md:L137:148)

### SEO Utils (v7→v8)

- NEW: `useShareLinks()` composable — generates social share URLs (Twitter, LinkedIn, Facebook, etc.) with UTM tracking [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L56:78)
- NEW: Favicon generation CLI — `nuxt-seo-utils icons` command generates favicon variants from a single source image [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L80:88)
- NEW: Inline minification — automatically minifies inline scripts and styles injected via `useHead()` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L90:127)

### Sitemap (v7→v8)

- NEW: `definePageMeta` sitemap config — configure sitemap options directly in pages using `definePageMeta({ sitemap: { changefreq, priority } })` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L129:142)
- NEW: Auto-expansion per locale — custom sitemaps with `includeAppSources: true` automatically expanded per i18n locale [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L144:159)
- BREAKING: `inferStaticPagesAsRoutes: false` — replaced with `excludeAppSources: ['pages', 'route-rules', 'prerender']` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L51:62)
- BREAKING: `dynamicUrlsApiEndpoint` — replaced with `sources` array for multiple API endpoints [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L63:75)
- BREAKING: `cacheTtl` — renamed to `cacheMaxAgeSeconds` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L76:88)
- BREAKING: `index` route rule — replaced with `robots` key in route rules [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L90:102)

### Robots (v5→v6)

- BREAKING: `rules` config — replaced with `groups` config [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L110:121)
- DEPRECATED: `defineRobotMeta()` composable — replaced with `useRobotsRule()` [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L123:130)
- REMOVED: `RobotMeta` component — use `useRobotsRule()` instead [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L132:135)
- BREAKING: `index` and `indexable` config keys — replaced with `robots` key [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L136:150)
- NEW: `blockAiBots` config option — block AI crawlers (GPTBot, Claude-Web, PerplexityBot, etc.) [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/6.migration-guide/0.rc-to-stable.md:L152:168)

### Link Checker (v4→v5)

- NEW: ESLint integration — `link-checker/valid-route` rule validates relative URLs match known routes with "did you mean?" suggestions [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L32:54)
- NEW: ESLint rule `link-checker/valid-sitemap-link` — warns when URLs don't exist in sitemap [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L35:37)

### DevTools

- NEW: Unified DevTools layer — all modules now share `nuxtseo-layer-devtools` with consistent layout, setup checklist, and troubleshooting [source](./.skilld/references/@nuxtjs/seo@5.3.2/docs/content/7.releases/1.v5.md:L18:30)

**Also changed:** Module dependency versions — `nuxt-site-config` v3→v4 · `nuxt-seo-utils` v7→v8 · `@nuxtjs/sitemap` v7→v8 · `@nuxtjs/robots` v5→v6 · `nuxt-schema-org` v5→v6 · `nuxt-link-checker` v4→v5 · `nuxt-og-image` v6 (no major change)
<!-- /skilld:api-changes -->

Related: nuxt-og-image-skilld

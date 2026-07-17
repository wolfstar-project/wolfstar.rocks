---
name: sentry-nuxt-skilld
description: "ALWAYS use when writing code importing \"@sentry/nuxt\". Consult for debugging, best practices, or modifying @sentry/nuxt, sentry/nuxt, sentry nuxt, sentry-javascript, sentry javascript."
metadata:
  version: 10.63.0
  generated_by: Anthropic · Haiku 4.5
  generated_at: 2026-07-16
---

# getsentry/sentry-javascript `@sentry/nuxt@10.63.0`
**Tags:** v9: 9.47.1, next: 10.50.0-alpha.0, v8: 8.55.2

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p @sentry/nuxt` instead of grepping `.skilld/` directories. Run `skilld search --guide -p @sentry/nuxt` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes for @sentry/nuxt — prioritize recent major/minor releases.

- BREAKING: `vite:extendConfig` hook — v10.42.0 replaced with `addVitePlugin()` for Vite plugin registration; the old hook is deprecated and no longer works. Update your Nuxt module config files to use the new approach. [source](./.skilld/releases/v10.42.0.md:L14)

- BREAKING: `options.srcDir` — v10.40.0 changed to `options.rootDir` for Sentry module config in `nuxt.config.ts`; the old property is no longer recognized. Use `rootDir` when configuring Sentry's build-time behavior. [source](./.skilld/releases/v10.40.0.md:L87)

- REMOVED: `defineNitroPlugin` wrapper — v10.40.0 removed automatic wrapping; the module no longer exports this helper. If you were using it for server-side Sentry integration, remove the wrapper and use Sentry's plugins directly. [source](./.skilld/releases/v10.40.0.md:L94)

- NEW: Client source maps upload — v10.44.0 adds automatic upload of client-side source maps to Sentry; configure `sourceMapsUploadOptions` in your Sentry module config to control upload behavior and include/exclude paths. [source](./.skilld/releases/v10.44.0.md:L147)

- NEW: `sentry.config.server.ts` auto-inclusion — v10.37.0 automatically includes server config file in Nuxt app types; if you have this config file, it will now be type-checked as part of your Nuxt build. [source](./.skilld/releases/v10.37.0.md:L58)

- NEW: Source maps conditional execution — v10.37.0 skips source map processing during Nuxt "prepare" stage; source maps are now only processed during actual build/dev commands, reducing build overhead. [source](./.skilld/releases/v10.37.0.md:L51)

**Also changed:** Database instrumentation via `instrumentDatabase()` available for custom spans · Server cache API instrumentation for `useStorage()` and related APIs · Storage API instrumentation for persistent data access tracking · Server middleware instrumentation automatically wraps all middleware handlers · Environment variable respect in Sentry config · Debug logging controlled by `debug` flag · Legacy plugins renamed (database/storage/route-detector now have non-legacy versions)
<!-- /skilld:api-changes -->

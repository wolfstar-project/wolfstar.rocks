# Core Requirements

- The end goal is stability, speed, great user experience, and accessibility.
- WolfStar.rocks is a Nuxt 4 full-stack dashboard for **WolfStar** (Discord moderation bot) and **Staryl** (social notifications bot). Built with Vue 3, TypeScript, Prisma, and PostgreSQL, featuring Discord OAuth2 authentication and guild management.
- Always reference these instructions first and fall back to search or documentation queries only when you encounter unexpected information.

## Read First

- [`VISION.md`](VISION.md) — the product filter: mission, money posture, seven principles, anti-scope. Read before any product, scope, or design decision. When it conflicts with the code, VISION wins.
- [`GLOSSARY.md`](GLOSSARY.md) — every product term and the words it replaces. Read before a user-visible string, a route segment, or a doc heading.
- [`COPY.md`](COPY.md) — canonical strings, claims policy, and banned language. Read before writing or changing any user-visible text.
- [`.claude/DESIGN.md`](.claude/DESIGN.md) — the visual system: tokens, components, motion. Read before UI work.
- [`docs/arch/`](docs/arch/README.md) — architecture notes for each area: auth, i18n, storage, audit, transitions, tokens. The Traps list below says which one to open.

## Code Quality Requirements

- Follow standard TypeScript conventions and best practices with strict mode
- Use the Composition API with `<script setup lang="ts">` when creating Vue components
- Lean on Nuxt auto-imports instead of manual Vue/Nuxt imports
- Use clear, descriptive variable and function names
- Accessibility should always be a first-class consideration and should be part of the initial planning and design
- Add comments only to explain complex logic or non-obvious implementations
- Write unit tests for core functionality using `vitest`
- Write end-to-end tests using Playwright and `@nuxt/test-utils`
- Consolidate component accessibility (axe) assertions into `test/nuxt/a11y.spec.ts` instead of scattering `runAxe()` checks across individual component spec files; keep hydration/behavior tests in the component's own spec file
- Keep functions focused and manageable (generally under 50 lines)
- Use error handling patterns consistently
- Ensure you write strictly type-safe code, for example by ensuring you always check when accessing an array value by index
- Type-aware Oxlint rules (tsgolint-backed, e.g. `@typescript-eslint/no-floating-promises`) run only via the opt-in `pnpm vp run lint:type-aware` task — they are not part of `pnpm lint:fix` or the CI `lint` gate yet
- Never cast things to `any`

## Naming Conventions

| Type             | Convention       | Example                 |
| ---------------- | ---------------- | ----------------------- |
| Directories      | kebab-case       | `guild-settings/`       |
| TypeScript files | kebab-case       | `auth-utils.ts`         |
| Vue Components   | PascalCase       | `GuildSettings.vue`     |
| API Routes       | kebab-case       | `guild-settings.get.ts` |
| Variables        | camelCase        | `guildId`, `isLoading`  |
| Constants        | UPPER_SNAKE_CASE | `API_BASE_URL`          |
| Types/Interfaces | PascalCase       | `GuildSettings`         |

## Architecture Notes

The long-form notes for each area live in [`docs/arch/`](docs/arch/README.md). Read the matching file before changing that area. The traps below are the rules that fail silently when forgotten.

| Area                                                  | Read                                                                   |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `nuxt.config.ts`, Nuxt 5 flags, import extensions     | [`docs/arch/nuxt-5.md`](docs/arch/nuxt-5.md)                           |
| `server/api/**` handlers, rate limiting, skew guard   | [`docs/arch/server-api.md`](docs/arch/server-api.md)                   |
| Vue components, Discord embed, link cards, error page | [`docs/arch/vue-components.md`](docs/arch/vue-components.md)           |
| Sign-in, sessions, tokens, feedback                   | [`docs/arch/auth.md`](docs/arch/auth.md)                               |
| Appearance, language, and motion preferences          | [`docs/arch/settings.md`](docs/arch/settings.md)                       |
| Locale files, Tolgee, Nuxt I18n Micro                 | [`docs/arch/i18n.md`](docs/arch/i18n.md)                               |
| Netlify Blobs driver, rate-limit storage              | [`docs/arch/storage-and-caching.md`](docs/arch/storage-and-caching.md) |
| Audit events and the hash chain                       | [`docs/arch/audit-logging.md`](docs/arch/audit-logging.md)             |
| Router View Transitions                               | [`docs/arch/view-transitions.md`](docs/arch/view-transitions.md)       |
| Color tokens, theme selectors                         | [`docs/arch/design-tokens.md`](docs/arch/design-tokens.md)             |

## Traps

Each line is a rule that has failed in production or fails silently. The linked note carries the reason.

- **Nuxt 5 flags.** Never repeat `typedPages`, `payloadExtraction`, `routeTypedFetch` and the other `compatibilityVersion: 5` defaults in `experimental`. `nitroAutoImports: true` stays until `server/` uses explicit imports. Relative imports in `nuxt.config.ts`, `modules/`, `config/` and `test/e2e/` carry an explicit `.ts` extension. New entry points are real pages or `definePageMeta` aliases, not middleware redirects. ([nuxt-5](docs/arch/nuxt-5.md))
- **Handlers.** Wrap every `server/api` handler with `defineWrappedResponseHandler` or `defineWrappedCachedResponseHandler`. Per-request permission checks such as `canManage()` go in the `authorize` option, never in the handler body, so they run on cache hits. Validate queries with shared Valibot schemas. ([server-api](docs/arch/server-api.md))
- **Skew protection.** Do not remove `app/plugins/skew-protection.client.ts` while `skewProtection.updateStrategy` is `"polling"`. Without it every `/api/**` call from a prerendered entry page returns 409. ([server-api](docs/arch/server-api.md))
- **Auth config.** Never set `secret` or `baseURL` in `defineServerAuth()`. The Discord redirect URI comes from `runtimeConfig.public.siteUrl` via `resolveDiscordRedirectURI()`, and `NUXT_OAUTH_DISCORD_REDIRECT_URL` must not return. `prompt: "consent"` stays set. Do not reintroduce a custom OAuth state endpoint. ([auth](docs/arch/auth.md))
- **Sessions.** The OAuth callback loads the session with `fetchSessionWithRetry()` and a plain `fetchSession()`, never `fetchSession({ force: true })`. `#nuxt-better-auth` is importable for types only. The local server helper is `resolveHandlerSession`, not `getUserSession`. The session user id is not the Discord snowflake. ([auth](docs/arch/auth.md))
- **Translations.** Untranslated keys are empty strings, never English copies. Components call `ts()`, never `t()`. Read the locale through `useAppLocale()`. In-page anchors pass `:locale="false"`. Locale sources use plain interpolation. Never prune the `nuxtSiteConfig` keys in `common.json`. ([i18n](docs/arch/i18n.md))
- **Storage.** Netlify Blobs access goes through the resilient driver, which fails open. The app's rate limiter mounts to Cloudflare KV directly and does not get that fail-open behavior. ([storage-and-caching](docs/arch/storage-and-caching.md))
- **Audit trail.** A dashboard write path emits its audit event, and a denied attempt emits its own. `userLogin`, `userLogout`, `sessionRefresh` and `oauthStateInvalid` are defined but not emitted today. Treat that as a known gap. Audit `changes` stay JSON-serializable. ([audit-logging](docs/arch/audit-logging.md))
- **View Transitions.** OAuth pages and any page that redirects on mount set `definePageMeta({ viewTransition: false })`. Do not add a `view-transition-name` to a shared element without a per-page uniqueness audit. ([view-transitions](docs/arch/view-transitions.md))
- **Color.** No hardcoded color literals in components, pages, or layouts. Theme-conditional CSS uses the `theme-light` and `theme-dark` variants, never a bare `[data-theme]` selector. Only one DaisyUI theme declares `default: true`. ([design-tokens](docs/arch/design-tokens.md))
- **Components.** No reactive state at module scope. Assign guild settings changes with `setGuildDataChange()`, never an `as any` cast. ([vue-components](docs/arch/vue-components.md))

A forbidden-pattern test enforces the greppable subset of these traps in `test/unit/guardrails/forbidden-patterns.test.ts`. Add a rule there when a new trap can be matched by text.

## Development Commands

```bash
pnpm dev                         # Development server (http://localhost:3000)
pnpm dev:pwa                     # Development server with local PWA behavior enabled
pnpm build                       # Production build
pnpm build:test                  # Test-mode production build through vite-plus
pnpm generate                    # Static generation
pnpm preview                     # Preview production build locally
pnpm lint:fix                    # Run linter and auto-fix issues (oxlint + oxfmt)
pnpm typecheck                   # TypeScript type checking
pnpm vp run knip                 # Report unused files, exports, and dependencies
pnpm vp run i18n:check           # Audit locale feature files against en/*
pnpm i18n:check:fix              # Sync locale keys (empty placeholders for missing)
pnpm vp run i18n:report          # Fail on missing/unused/dynamic i18n keys in app/**
pnpm i18n:report:fix             # Remove unused keys from all locale feature files
pnpm vp run i18n:schema          # Regenerate i18n/schemas/*.schema.json from en/*
pnpm vp run build:lunaria        # Build Lunaria status.json
pnpm tolgee:push                 # Push extracted strings to Tolgee (project 33768)
pnpm tolgee:pull                 # Pull translations from Tolgee and remap into i18n/locales/
pnpm tolgee:ensure-languages     # Create any Tolgee project languages missing from .tolgeerc.cjs
pnpm test                        # Run all Vitest projects
pnpm test:unit                   # Run unit tests
pnpm test:nuxt                   # Nuxt component/API tests
pnpm test:browser                # Playwright E2E tests against a prebuilt app
pnpm test:browser:prebuilt       # Playwright E2E tests against an existing prebuilt app
pnpm test:a11y                   # Lighthouse accessibility checks in dark and light modes
pnpm test:a11y:prebuilt          # Lighthouse accessibility checks against an existing prebuilt app
pnpm test:perf                   # Lighthouse performance checks
pnpm test:perf:prebuilt          # Lighthouse performance checks against an existing prebuilt app
pnpm test:bench                  # Vitest benchmark suite
pnpm start:playwright:webserver  # Preview a test build on port 5678 for Playwright
pnpm audit:verify                # Replay and verify the AuditEvent hash chain
pnpm design:lint                 # Lint .claude/DESIGN.md with designmd
pnpm skills:install              # Install/refresh skill packages via skilld (--direct --agent codex)
pnpm skills:list                 # List skill packages skilld currently tracks
pnpm storybook                   # Start Storybook dev server (http://localhost:6006)
pnpm build-storybook             # Build static Storybook output
pnpm vp run zizmor               # Lint GitHub Actions workflows for security issues (zizmor)
pnpm vp run zizmor:fix           # Auto-fix zizmor findings
pnpm vp run lint:type-aware      # Opt-in Oxlint type-aware linting (tsgolint); not part of the default lint/CI gate
pnpm prisma:push                 # Push schema changes (development)
pnpm prisma:migrate:dev          # Create and apply migration
pnpm prisma:migrate:diff         # Check migration drift against the Prisma schema
pnpm prisma:migrate:deploy       # Apply migrations in deployment environments
pnpm prisma:generate             # Regenerate Prisma client
pnpm prisma:seed                 # Seed the database
pnpm prisma:studio               # Visual database editor (http://localhost:5555)
```

Rarely-used tasks are no longer wrapped in `package.json`; run the underlying
binary through `pnpm exec` instead:

```bash
pnpm exec prisma migrate dev --create-only  # Create a migration without applying it
pnpm exec prisma migrate status             # Inspect migration status
pnpm exec prisma migrate resolve            # Resolve migration history state
pnpm exec prisma migrate reset              # Reset the local database
pnpm exec prisma generate --watch           # Regenerate Prisma client in watch mode
pnpm exec knip --fix                        # Auto-fix unused files, exports, and dependencies
pnpm exec taze                              # Interactive dependency updates
pnpm exec tolgee extract print              # Print strings the Tolgee CLI would extract (dry run)
pnpm exec pwa-assets-generator              # Regenerate PWA icon assets
pnpm test:browser:prebuilt --ui             # Playwright UI mode against a prebuilt app
pnpm test:browser:prebuilt --update-snapshots  # Update Playwright snapshots
```

## Prisma and Database Conventions

- Prisma schema lives in `server/database/schema.prisma`; migrations live in `server/database/migrations/`
- Treat migrations as append-only once merged
- Use raw SQL migrations for database features Prisma cannot express, such as partial indexes on nullable columns
- Do not add Prisma `@@index` entries for the manually-managed partial indexes on `Moderation.createdAt`; see migration `20260515000000_command_log_and_moderation_indexes`
- `AuditEvent` is hash-chained and tamper-evident; `CommandLog` is not hash-chained and is written directly by the bot/shared PostgreSQL producer

## Guild Logs and Activity Patterns

- Guild log routes live under `server/api/guilds/[guild]/logs/`
- Use `defineWrappedCachedResponseHandler` with `auth: true`, explicit `maxAge`, `swr: false`, `onError`, and route-specific rate limits for log endpoints
- Validate log route filters with `DashboardActivityQuerySchema`, `CommandLogQuerySchema`, or `ModerationLogQuerySchema` from `shared/schemas/log-queries.ts`
- Use `resolveGuildMembers()` and `fallbackMember()` from `server/utils/audit/resolve-members.ts` when log rows need Discord member metadata
- Guild permission checks (`canManage()`) belong in the `authorize` option, not the handler body, so they still run when the response is served from cache
- Client-side log data access lives in focused composables (`useAuditLog`, `useCommandLog`, `useModerationLog`) that accept `MaybeRefOrGetter` inputs and expose computed `entries` and `total`

## Pre-commit Checklist

Before committing changes, always run:

1. `pnpm build` - Must build successfully
2. `pnpm lint:fix` - Fix any errors, warnings are acceptable
3. `pnpm typecheck` - Must pass without errors
4. `pnpm test` - All tests must pass

Commit messages must follow Conventional Commits: `<type>(<scope>): <subject>`

## Troubleshooting

- **Build issues:** Clear `.nuxt`, `.output`, and `node_modules/.cache`, then rebuild
- **Prisma types stale:** Run `pnpm prisma:generate` after schema changes
- **OAuth redirect fails:** Ensure the Discord Developer Portal lists `<NUXT_PUBLIC_SITE_URL>/oauth/callback` verbatim, and that `NUXT_PUBLIC_SITE_URL` is set on the deployed environment — the redirect URI is derived from it
- **Hot reload broken:** Check file watcher limits on Linux, restart dev server
- **Type errors after updates:** Run `pnpm nuxt prepare && pnpm prisma:generate`
- **Duplicate/incompatible `vue`, `discord-api-types`, or `@unhead/vue`/`unhead` types after a dependency update:** Check the `overrides` in `pnpm-workspace.yaml` still pin a single version of each — two copies make structurally identical (nominally-branded) types incompatible during typecheck
- **SSR crash reading a `discord-api-types` enum member (e.g. `Cannot read properties of undefined (reading 'VerifiedBot')`):** Vite SSR prebundling can produce a broken CJS interop stub of `discord-api-types/v10` where named enum exports are `undefined`. `vite.ssr.external: ["discord-api-types"]` in `nuxt.config.ts` keeps it external for Node/SSR; the client optimizer still prebundles `discord-api-types/v10` via `vite.optimizeDeps.include` (excluding it there breaks browser-mode Vitest). Module-scope code that reads enum members (e.g. marketing fixtures in `app/utils/constants.ts`) should inline the numeric values instead of importing the enum, so it's safe under either bundling path
- **`pnpm typecheck` reports unfamiliar diagnostics or behaves differently from stock `tsc`:** `pnpm-workspace.yaml` overrides `typescript` to `typescript-native-bridge` (the `tsgo` native-compiler bridge) — this is an intentional adoption for faster typechecking, not a stray pin, but diagnostic wording/coverage can differ subtly from stock `tsc`

**When in doubt:** Copy existing patterns from similar files (e.g., `server/api/guilds/**`, `app/components/discord/**`) before inventing new ones.

## Sentry and Source Maps

- Client source maps are hidden via `sourcemap.client: "hidden"` and uploaded to Sentry through `@sentry/nuxt`.
- Keep `sentry.sourcemaps.filesToDeleteAfterUpload` in `nuxt.config.ts` whenever changing source-map or build-output behavior so uploaded `.map` files are removed from `.output/**/public` and hidden deploy output directories.
- Sentry runtime configuration lives in `sentry.client.config.ts`, `sentry.server.config.ts`, and `server/utils/runtimeConfig.ts`; keep DSNs and sampling in runtime config, not hardcoded values.
- `sentry.server.config.ts`'s `Sentry.init` `beforeSend` drops events for expected `createError()` HTTP statuses (400/401/403/404/409/429). It distinguishes deliberate application errors from h3-normalized upstream failures (e.g. an ofetch `FetchError` from the bot API) via h3's `unhandled` flag on the `__h3_error__`-marked exception — only `unhandled: false` (deliberate) errors are filtered, so unexpected upstream failures still reach Sentry.

<!-- nuxt-skill-hub:start -->

Use the `nuxt` skill as the Nuxt router/entrypoint for tasks in this repository.

<!-- nuxt-skill-hub:end -->

<!-- skilld -->

Before modifying code, check .agents/skills/ for relevant skills.
Read the SKILL.md for any matching package before proceeding.

<!-- /skilld -->

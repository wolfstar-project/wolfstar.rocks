# Core Requirements

- The end goal is stability, speed, great user experience, and accessibility.
- WolfStar.rocks is a Nuxt 4 full-stack dashboard for **WolfStar** (Discord moderation bot) and **Staryl** (social notifications bot). Built with Vue 3, TypeScript, Prisma, and PostgreSQL, featuring Discord OAuth2 authentication and guild management.
- Always reference these instructions first and fall back to search or documentation queries only when you encounter unexpected information.

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

## Server API Patterns

- Routes go under `server/api/` with HTTP suffix (`.get.ts`, `.post.ts`)
- Always wrap handlers with `defineWrappedResponseHandler` for auth + rate limiting
- Use `defineWrappedCachedResponseHandler` for cached responses
- Rate limiting (`server/utils/wrappedEventHandler.ts`) reserves a fixed- or sliding-window quota in storage before the handler runs and rolls the reservation back if the handler throws; it fails open (lets the request through) if the rate-limit storage read/write itself errors
- Use the `authorize` option (not an inline check in the handler body) for per-request permission checks — e.g. `canManage()` — that must run on every request, including warm cache hits on `defineWrappedCachedResponseHandler` routes
- Use `createError` for error responses with proper status codes
- Use the `onError` callback for error logging
- Validate query strings with shared Valibot schemas from `shared/schemas/` via `getValidatedQuery(event, (body) => parse(Schema, body))`
- For paginated guild log routes, use stable cache keys that include the guild id, route segment, and `url.search`
- `defineWrappedResponseHandler`/`defineWrappedCachedResponseHandler` reject outdated browser sessions before auth, rate limiting, or cache resolution: `isClientOutdated()` from `nuxt-skew-protection/server` throws a 409 (with an `x-client-outdated` response header) so stale clients never consume quota or read data shaped for a newer server build

## Vue Component Patterns

- Block order: template -> script -> script setup -> styles
- Never create reactive state at module scope; use composables in `app/composables/`
- Place feature-specific components in grouped directories once a feature has multiple pieces, e.g. feedback UI in `app/components/feedback/`, OAuth status UI in `app/components/oauth/` (`StatusPanel.vue`, shared by all `app/pages/oauth/*.vue` for loading/success/error states)
- In guild-settings `mapToGuildData()`/`calculateChanges()` functions, assign values onto `Partial<GuildData>` with `setGuildDataChange()` from `#shared/utils/guild-settings-map` instead of an `as any`/`as never` cast — it skips `undefined` so untouched keys stay out of PATCH payloads while keeping key/value types checked
- Fatal errors render through `app/error.vue` → `app/components/ErrorPage.vue` (built on Nuxt UI's `UError`), with copy sourced from a dedicated `errors` i18n feature file (not `common`/`components`). Because `error.vue` replaces the app root on fatal errors, it must `await loadLocaleMessages(locale.value)` itself before translating — the normal per-route locale preloading doesn't run

## Auth and Feedback

- Authentication runs on `better-auth` + `@onmax/nuxt-better-auth` — `nuxt-auth-utils` was fully removed in #297. Server config lives in `server/auth.config.ts`, built with `defineServerAuth()` from `@onmax/nuxt-better-auth/config`; it registers the Discord social provider, rate limiting through `secondaryStorage`, and a `jwe`-strategy session cookie cache
- The Discord social-provider options come from `createDiscordProviderOptions()` in `server/utils/discord/provider.ts` (unit-tested in `test/unit/server/utils/discord-provider.spec.ts`; `server/auth.config.ts` itself reads Nitro auto-imports at module scope and can't be imported outside a Nitro runtime). Two invariants live there: `prompt: "consent"` must stay set — Better Auth's Discord provider otherwise sends `prompt=none`, which Discord only honours when the user already approved exactly the requested scopes, so every sign-in fails once the scope set changes — and `scope` lists only the extras (`guilds` for GET /users/@me/guilds, `guilds.members.read` for per-guild member lookups) on top of Better Auth's own `identify`/`email` defaults. `mapProfileToUser()` must not return `id`: since better-auth 1.7 the provider account id comes from `accountSubject` and `OAuthMappedUser` types `id` as `never`, so the session user id is a generated id, not the Discord snowflake (read the snowflake from `/api/users`, never from `session.user.id`)
- `server/auth.config.ts` builds its `secondaryStorage` via `createAuthSecondaryStorage()` from `server/utils/auth-rate-limit-storage.ts`, which adapts a Nitro/unstorage mount to better-auth's `SecondaryStorage` shape and adds an `increment()` with an in-process keyed mutex (mirroring `server/utils/wrappedEventHandler.ts`) so better-auth's fixed-window rate limiter gets a single-step atomic-ish counter instead of its non-atomic get-then-set fallback. The same keyed mutex backs `getAndDelete()`, which better-auth 1.7 requires on `SecondaryStorage` to consume single-use verification values in one step. Neither is atomic across instances — the production driver (Cloudflare KV over HTTP) has no such primitive — which is an accepted limitation of the storage backend
- Mock authentication in Nuxt component tests with `mockAuth()` from `test/nuxt/utils/auth.ts` (wraps `mockNuxtImport("useUserSession", ...)` plus an `$authorization` provide fallback) instead of hand-rolling `useUserSession`/`$authorization` mocks per spec
- There is no `server/api/auth/discord.get.ts` or `server/utils/oauth-state.ts` anymore. Better-auth's own `/api/auth/sign-in/social` and `/api/auth/callback/discord` routes own the OAuth flow and its CSRF state — do not reintroduce a custom `oauth-state`/`verify-state` endpoint
- `server/middleware/oauth-callback.ts` + `server/utils/oauth-callback.ts` (`resolveOAuthProviderCallbackRedirect()`) redirect Discord's response at `/oauth/callback` to the better-auth callback path when a `state` query param is present; plain browser navigations to `/oauth/callback` (no `state`) fall through to the Vue callback page at `app/pages/oauth/callback.vue`
- `server/api/auth/refresh.get.ts` refreshes the Discord access token via `refreshSessionTokens()` in `server/utils/oauth-tokens.ts`, which wraps better-auth's `auth.api.getAccessToken()` / `auth.api.refreshToken()`. Both take `body: { useAccountCookie: true }`: better-auth 1.7 replaced the `providerId` selector with a union of `{ accountId }` (a database row id) and `{ useAccountCookie: true }`, and this deployment runs database-less — `account.storeAccountCookie` keeps the Discord account in a signed cookie, so the cookie is the only account source
- Server code reads the current user/tokens through `event.context.$authorization` (`resolveServerUser()`, `resolveServerTokens()`), wired up in `server/plugins/authorization-resolver.ts`. The `AuthUser` type comes from `#nuxt-better-auth` (declared in `shared/types/auth.d.ts`) — there is no more `#auth-utils` `User` type. Since `@onmax/nuxt-better-auth` 0.1.x, `#nuxt-better-auth` is an ambient `declare module` rather than a real alias, so it is importable for types only — never `import` a value from it
- Client code still uses the `useUserSession()` composable (`user`, `loggedIn`, `ready`, `fetchSession()`, `signOut()`) — `@onmax/nuxt-better-auth` ships a compatible API, so existing call sites didn't need to change shape
- `useSessionRefresh()` (`app/composables/useSessionRefresh.ts`) calls `/api/auth/refresh` then `fetchSession()` on mount and whenever the tab regains visibility
- Feedback UI uses the custom Sentry feedback flow under `app/components/feedback/`
- Keep feedback validation in `shared/schemas/feedback.ts` so forms and submit handlers share the same Valibot schema

## Settings and Preferences

- Browser-local appearance/locale/motion preferences are consolidated behind `useSettings()` (`app/composables/useSettings.ts`), backed by a single `wolfstar-settings` localStorage key (`AppSettings`: `colorMode`, `reduceMotion`, `selectedLocale`). Its `useLocalStorage` ref is created once in a detached `effectScope`, not in the first caller's own setup scope, so persistence survives that caller unmounting
- Prefer `useAppColorMode()`, `usePreferredLocale()`, and `useReduceMotion()` — thin wrappers around `useSettings()` — over reading/writing `wolfstar-settings` directly. `useAppColorMode()` also keeps `useColorMode().preference` in sync; `colorMode` supports `"system" | "light" | "dark" | "midnight"` (`midnight` is an experimental DaisyUI theme)
- Legacy keys (`wolfstar-theme`, `user-prefers-locale`, `user-prefers-reduced-motion`) migrate into `wolfstar-settings` once, only when `wolfstar-settings` has never been persisted — that check must run before the storage ref is created, since `useLocalStorage` writes defaults synchronously on first read
- `/profile` (aliased at `/account`) is not auth-gated: guests get a Settings tab (Appearance, Language, Accessibility) and a Discord sign-in CTA in place of the Servers tab, and guild data fetches skip `/api/users` when the user is anonymous
- Theme and language controls live on `/profile`, not the footer

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
pnpm vp run build:lunaria        # Build Lunaria dashboard + status.json
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

## Localization (i18n)

- `i18n/locales/en/*.json` is the source of truth; every other locale carries the same key set
- **Untranslated keys are empty strings, never a copy of the English text** — an English copy is indistinguishable from a real translation for Tolgee, Lunaria and translators, and it hides regional variants (`es-419` merges `es/*` then `es-419/*`)
- `config/i18n-empty-placeholders.ts` provides the Vite plugin (registered in `nuxt.config.ts` under `vite.plugins`) that drops empty leaves from `i18n/locales/**/*.json` at build time, so vue-i18n falls back to `en-US` instead of rendering `""`. Locale _types_ are still generated from the on-disk files, so stripped keys stay valid in `$t()` call sites
- `pnpm i18n:check:fix` (`scripts/compare-translations.ts`) adds missing keys as `""` and removes extra keys
- `.tolgeerc.cjs` pulls `states: ["TRANSLATED", "REVIEWED", "UNTRANSLATED"]`; without `UNTRANSLATED`, `scripts/tolgee-pull-remap.ts` would wipe untranslated keys from disk on every sync (see wolfstar-project/wolfstar#240)

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

## View Transitions

Router-driven View Transitions are enabled via a **manual plugin** (not `experimental.viewTransition`).

| File                                               | Purpose                                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `app/plugins/view-transition.client.ts`            | `router.beforeResolve` + `document.startViewTransition` — the entry point    |
| `app/middleware/disable-vue-transitions.global.ts` | Disables Vue `pageTransition`/`layoutTransition` to prevent double-animation |
| `app/assets/css/view-transitions.css`              | All VT CSS rules (imported via `main.css`)                                   |
| `app/utils/view-transition-classifier.ts`          | Pure classifier; unit-testable without mounting Nuxt                         |

### Type vocabulary

| Type              | When added                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `nav-forward`     | Client-side push navigation                                                               |
| `nav-back`        | Popstate (browser back/forward) without UA visual transition                              |
| `route-marketing` | Destination is `/`, `/wolfstar`, `/staryl`, `/privacy`, `/terms`, `/commands`, `/profile` |
| `route-dashboard` | Destination starts with `/guilds/`                                                        |

### Rules

- **OAuth pages** and any page that redirects on mount **must** have `definePageMeta({ viewTransition: false })`. Transitions freeze DOM updates mid-flight.
- **Do not add `view-transition-name`** to elements shared across pages without a per-page uniqueness audit. Duplicate names cause silent VT skip.
- Reduced-motion is honored at two layers: system (`prefers-reduced-motion: reduce` checked in plugin, CSS `@media` kill-switch) and user override (`wolfstar-settings.reduceMotion` via `useReduceMotion()`; legacy `user-prefers-reduced-motion` is migrated on first load).

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
- **OAuth redirect fails:** Ensure `.env` `NUXT_OAUTH_DISCORD_REDIRECT_URL` matches Discord Developer Portal exactly
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

## Audit Logging

All security-relevant actions are captured via `evlog`'s `log.audit()` pipeline, persisted to `AuditEvent` in PostgreSQL with a tamper-evident SHA-256 hash chain.

### Action Registry

Defined in `shared/audit/actions.ts`:

| Action Creator              | Action Name                    | Emitted When                                  |
| --------------------------- | ------------------------------ | --------------------------------------------- |
| `guildSettingsUpdate`       | `guild.settings.update`        | PATCH guild settings succeeds                 |
| `guildSettingsAccessDenied` | `guild.settings.access-denied` | `canManage()` throws                          |
| `userLogin`                 | `user.login`                   | Not currently invoked anywhere in server code |
| `userLogout`                | `user.logout`                  | Not currently invoked anywhere in server code |
| `sessionRefresh`            | `session.refresh`              | Not currently invoked anywhere in server code |
| `oauthStateInvalid`         | `oauth.state.invalid`          | Not currently invoked anywhere in server code |

Only exported action creators are listed above. `command.executed` is currently an internal action-name constant; command history is read from `CommandLog`, not emitted through the audit hash chain. `userLogin`, `userLogout`, `sessionRefresh`, and `oauthStateInvalid` were wired to the pre-migration `nuxt-auth-utils` OAuth flow (`server/api/auth/discord.get.ts`, `server/utils/oauth-state.ts`); both files were deleted by the better-auth migration (#297) and nothing currently calls these action creators outside their own unit test. `server/middleware/evlog-auth-identify.ts` only identifies the request actor for enrichment — it does not emit audit events. Treat these four as a known gap (dead code or a missing re-wire) rather than assuming login/logout/refresh/CSRF-failure events are being recorded.

### Instrumentation Pattern

```ts
import { withAuditMethods, useLogger } from "evlog";
import { myAction } from "#shared/audit/actions";

const log = withAuditMethods(useLogger(event));

// Success path
log.audit(
	myAction({
		actor: { type: "user", id: userId, displayName: username },
		target: { type: "guild", id: guildId },
		outcome: "success",
		changes: auditDiff(before, after),
	}),
);

// Denial path (inside try/catch or before throw)
log.audit(
	myAction({
		actor: { type: "system", id: "oauth-flow" },
		outcome: "denied",
		reason: result.reason,
	}),
);
```

### Key Files

- `shared/audit/actions.ts` — typed action creators
- `shared/audit/envelope.ts` — canonical hash/envelope helpers
- `shared/utils/audit-field-metadata.ts` — field labels and render metadata for dashboard-managed guild settings
- `server/middleware/evlog-auth-identify.ts` — auto-identifies the request actor from the better-auth session via evlog's `createAuthMiddleware()` (`evlog/better-auth`, excludes `/api/auth/**`) so audit enrichers can resolve the actor without each handler calling `log.set({ user })` manually
- `server/utils/audit/postgres-drain.ts` — Postgres sink with hash-chain (P2002 swallowed, P2034 retried 5x)
- `server/utils/audit/actor-bridge.ts` — resolves actor from request context
- `server/utils/audit/patch-to-changes.ts` — converts `auditDiff()` JSON patches into dashboard-friendly change groups
- `server/utils/audit/resolve-members.ts` — resolves Discord guild members for log display with fallback placeholders
- `server/plugins/evlog-drain.ts` — routes audit events to the drain
- `server/plugins/evlog-enrich.ts` — enriches events with UA, trace, and audit context
- `shared/audit/persisted.ts` — reconstructs chain order from `prevHash` linkage (timestamps are not assumed unique) and reports topology problems (forks, cycles, multiple/no roots, unreachable rows, head mismatch) plus hash/link failures
- `scripts/audit-verify.ts` — offline hash-chain verifier run with `pnpm audit:verify`; loads all `AuditEvent` rows and the `AuditChainHead` row, then delegates to `verifyPersistedAuditChain()` in `shared/audit/persisted.ts`

### Dashboard Activity Feed

- `DASHBOARD_AUDIT_ACTIONS` controls which audit actions appear in the dashboard activity feed
- Add new dashboard-visible actions to both the exported action creators and `DASHBOARD_AUDIT_ACTIONS`
- Keep audit `changes` payloads JSON-serializable; `AuditEnvelope` rejects `BigInt`, `Date`, `Map`, `Set`, circular references, and `undefined` array entries before hashing

## Design Token Discipline

All styling must use semantic tokens or CSS custom properties — no hardcoded color literals.

### Guardrail

`test/unit/design-tokens/no-hardcoded-colors.test.ts` enforces this on every `app/components/**/*.vue`, `app/pages/**/*.vue`, and `app/layouts/**/*.vue` file.

It checks:

1. **Raw Tailwind palette classes** in `<template>` — e.g. `text-red-500`, `bg-blue-700`. Use semantic Nuxt UI classes (`text-primary`, `text-muted`, `bg-success`) or DaisyUI tokens instead.
2. **Hex literals** in `<style>` — e.g. `#5865f2`. Move to a scoped CSS custom property declaration.
3. **Color functions with literal arguments** in `<style>` — e.g. `hsla(235, 85.6%, 64.7%, 0.5)`. Move to a scoped CSS custom property. Allowed patterns:
    - `oklch(from var(--token) l c h / alpha)` — relative-color syntax
    - `oklch(var(--token) / alpha)` — CSS variable inside the call
    - `oklch(20% 0 H / alpha)` — zero-chroma neutrals (achromatic grays)

### Allow-list

Files added to `ALLOW_LIST` in the test are permanently exempt. Current exemptions:

- `app/components/OgImage/Page.takumi.vue` — Satori does not support `var()` references
- `app/components/discord/*.vue` (message, embed, mention, role, reaction, scrollbar, the `chat-input-command/` autocomplete family, and the `app-launcher/` family) — Discord brand fidelity requires Discord brand colors; see `ALLOW_LIST` in the test for the exact, growing file list

### Theme Selectors

`@nuxtjs/color-mode` applies `data-theme` (and the matching class) from an inline script, so with JavaScript disabled the html element carries no theme at all. Theme-conditional CSS must therefore go through the `theme-light`/`theme-dark` custom variants declared in `app/assets/css/main.css` — `@variant theme-dark { … }`, never a bare `[data-theme="dark"] & { … }` — because those variants also resolve the attribute-less state from `prefers-color-scheme`. Tailwind's own `dark:` variant is redefined alongside them and must stay identical to `theme-dark`.

Only one DaisyUI theme may declare `default: true` (`light`): two defaults both emit `:where(:root)`, so the last one silently wins wherever no `data-theme` is set. `dark` stays reachable through `prefersdark: true`. `test/unit/design-tokens/theme-fallback.test.ts` enforces all of the above.

### Token Reference

Prefer these semantic classes before reaching for palette colors:

| Purpose              | Class                                                  |
| -------------------- | ------------------------------------------------------ |
| Primary brand        | `text-primary`, `bg-primary`, `border-primary`         |
| Muted / subdued text | `text-muted`                                           |
| Success indicator    | `bg-success`, `text-success`                           |
| Error state          | `text-error`, `border-error`                           |
| Gradient hero text   | `gradient-text-hero`, `gradient-text-cool`             |
| Card surfaces        | `card-glass`, `card-glass-soft`, `card-glass-bordered` |

<!-- nuxt-skill-hub:start -->

Use the `nuxt-dashboard` skill as the Nuxt router/entrypoint for tasks in this repository.

<!-- nuxt-skill-hub:end -->

<!-- skilld -->

Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.

<!-- /skilld -->

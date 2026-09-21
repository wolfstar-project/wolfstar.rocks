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
- `defineWrappedResponseHandler`/`defineWrappedCachedResponseHandler` reject outdated browser sessions before auth, rate limiting, or cache resolution: `isClientOutdated()` from `nuxt-skew-protection/server` throws a 409 (with an `x-client-outdated` response header) so stale clients never consume quota or read data shaped for a newer server build (header name: `CLIENT_OUTDATED_HEADER` in `shared/utils/skew-protection.ts`, shared with the client)
- `app/plugins/skew-protection.client.ts` is what makes that 409 truthful and actionable, and must not be removed while `skewProtection.updateStrategy` is `"polling"`. `isClientOutdated()` compares the `__nkpv` cookie against the server build id, but that cookie is only written by the module's Nitro middleware on document responses and by `createSkewConnection()` — a plugin that only ships with the `sse`/`ws`/adapter strategies. Marketing routes are prerendered and served statically, so a visitor entering through one keeps whatever build id last rendered an SSR document for them and every `/api/**` call 409s even though the browser runs the current build, unfixable by reloading. The plugin pins the cookie to the running build (via `resolveSkewCookie()`, whose attributes must keep matching the middleware's or the browser stores a second cookie), registers the `app:manifest:update` hook that populates `useSkewProtection().manifest` — otherwise `isAppOutdated` stays false until the lazy, `DeferredMount`-gated prompt mounts — and wraps `globalThis.fetch` to re-check the manifest on a real 409. That wrapper is the only global seam: Nuxt's auto-imported `$fetch` is a const captured from `#build/fetch` before any plugin runs, so replacing `globalThis.$fetch` would miss every existing call site, while `ofetch` resolves `globalThis.fetch` per request

## Vue Component Patterns

- Block order: template -> script -> script setup -> styles
- Never create reactive state at module scope; use composables in `app/composables/`
- Place feature-specific components in grouped directories once a feature has multiple pieces, e.g. feedback UI in `app/components/feedback/`, OAuth status UI in `app/components/oauth/` (`StatusPanel.vue`, shared by all `app/pages/oauth/*.vue` for loading/success/error states)
- In guild-settings `mapToGuildData()`/`calculateChanges()` functions, assign values onto `Partial<GuildData>` with `setGuildDataChange()` from `#shared/utils/guild-settings-map` instead of an `as any`/`as never` cast — it skips `undefined` so untouched keys stay out of PATCH payloads while keeping key/value types checked
- Fatal errors render through `app/error.vue` → `app/components/ErrorPage.vue` (built on Nuxt UI's `UError`), with copy sourced from a dedicated `errors` i18n feature file (not `common`/`components`). Because `error.vue` replaces the app root on fatal errors, it must `await loadLocaleMessages(locale.value)` itself before translating — the normal per-route locale preloading doesn't run
- `DiscordEmbed`'s `theme` prop (`app/components/discord/embed.vue`) wins over the ambient app-wide `data-theme` selector: `.discord-embed--light` applies whenever `theme === "light"`, and `:global([data-theme="light"] .discord-embed):not(.discord-embed--dark)` applies the same light colors when `theme` is omitted and the ambient theme is light — both selectors share one light color-variable declaration block so there's a single place to update Discord light-theme colors. Omitting `theme` follows the ambient theme instead of defaulting to dark.

## Auth and Feedback

- Authentication is **clientOnly** against the WolfStar bot Better Auth server (`auth.clientOnly: true`), on `better-auth` + `@nuxtjs/better-auth` (renamed from the deprecated `@onmax/nuxt-better-auth`). There is no local `server/auth.config.ts`, no Nuxt `/api/auth/**`, and no `serverAuth()` / `requireUserSession()` — see https://better-auth.nuxt.dev/guides/external-auth-backend
- `app/auth.config.ts` uses `defineClientAuth()` with `baseURL` = `runtimeConfig.public.apiBaseUrl` (bot origin). Keep `NUXT_PUBLIC_SITE_URL` as the frontend origin. Under `import.meta.test` it returns an empty `baseURL` so Better Auth falls back to `window.location.origin`: `build:test` sets `NUXT_PUBLIC_SITE_URL=https://wolfstar.rocks` for correct SEO/OG output but serves the prebuilt app on `http://localhost:5678`, where a configured production base URL would be blocked by CORS
- Redirect targets live in `nuxt.config.ts` under `auth.redirects` (`login`, `guest`, `authenticated`, `logout`) alongside `redirectQueryKey: "next"`, which must stay `"next"` because that is the query key `/oauth/login` and `/oauth/callback` read
- Route protection lives in `definePageMeta({ auth })`, not in `routeRules`: the route-rule `auth` keys are untyped in clientOnly mode. `/oauth/login` carries `auth: { only: "guest", redirectTo: "/profile" }` (its `/login` alias shares the route record, so it is covered too) and the guild pages carry `auth: "user"`
- `/oauth/login` (aliased at `/login`) starts sign-in with `useSignIn("social")` in `onMounted`, not the raw `useAuthClient()?.signIn.social`: the action handle never throws, so a failed hand-off renders a retry panel instead of an endless spinner. Its `callbackURL` / `errorCallbackURL` must be **absolute** frontend URLs (built from `window.location.origin`), or Better Auth resolves them against the bot API origin and the redirect lands on the bot
- `app/pages/oauth/callback.vue` loads the fresh session through `fetchFreshSession()`, which wraps `fetchSessionWithRetry()` (`app/utils/oauth-session-retry.ts`) around a plain `fetchSession()` — never `fetchSession({ force: true })`. `force: true` bypasses the jwe cookie cache the callback just wrote and races the eventually-consistent secondary storage behind it, surfacing a false "session not found" right after a successful sign-in; the retry backoff (`attemptDelays()`, a generator over `DEFAULT_RETRY_DELAYS`) covers the storage-read fallback while the write propagates
- The same page also runs the sapphire hop (`completeBotOauthCallback()` / `buildBotOauthAuthorizeUrl()` from `shared/utils/bot-oauth.ts`) to obtain the bot's `SAPPHIRE_AUTH` cookie, and retries a `prompt=none` silent-auth failure with `prompt=consent` when a post-login redirect is pending
- Mock authentication in Nuxt component tests with `mockAuth()` from `test/nuxt/utils/auth.ts` (wraps `mockNuxtImport("useUserSession", ...)` plus an `$authorization` provide fallback) instead of hand-rolling `useUserSession`/`$authorization` mocks per spec
- `server/plugins/authorization-resolver.ts` always resolves `null` user/tokens (no SSR session hydration). Authenticated bot data is fetched from the browser via `$api` with `credentials: "include"`
- Client code uses `useUserSession()` (`user`, `loggedIn`, `ready`, `fetchSession()`, `signOut()`) for session state, and the action-handle composables (`useSignIn()`, `useSignUp()`, `useAuthClientAction()`) for auth actions that need loading/error state
- `useSessionRefresh()` only calls `fetchSession()` (no Nuxt `/api/auth/refresh`)
- Feedback UI uses the custom Sentry feedback flow under `app/components/feedback/`
- `useAuthErrorMessage()` (`app/composables/useAuthErrorMessage.ts`) takes the whole failure — an `AuthActionError` from `useSignIn()`, a raw `?error=` query value, or a repeated query array — and tries `auth.errors.<CODE>` before `auth.errors.<MESSAGE>`, falling back to the message text. Better Auth's `code` is the stable translation key; `message` is only a fallback for failures that carry no code. When a provider's code has no matching i18n key (e.g. Better Auth's `INVALID_CODE`, which localizes as `INVALID_CALLBACK_REQUEST`), add the mapping to `AUTH_ERROR_CODE_MISMATCHES` in the same file instead of adding a duplicate i18n key
- The local session helper in `server/utils/wrappedEventHandler.ts` is called `resolveHandlerSession`, not `getUserSession`: the module auto-imports a server util of the latter name into every `server/` file, and a local declaration silently shadows it module-wide
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

## Localization (i18n)

- `i18n/locales/en/*.json` is the source of truth; every other locale carries the same key set
- **Untranslated keys are empty strings, never a copy of the English text** — an English copy is indistinguishable from a real translation for Tolgee, Lunaria and translators, and it hides regional variants (`es-419` merges `es/*` then `es-419/*`)
- `i18n.langDir` points at `i18n/.locales-build/` (gitignored), not at `i18n/locales/`: `modules/i18n-strip-empty-messages.ts` regenerates that directory on every Nuxt startup as a placeholder-free mirror of the sources, and refreshes single files through `builder:watch` in dev. @nuxtjs/i18n v10's `experimental.optimizeMessageBundling` reads plain-JSON locale files straight from disk — bypassing every bundler plugin — and serves them as Nitro server assets from the `/_i18n/**` messages route, which is where the browser gets its messages in production, so stripping empty leaves has to happen before the module reads them. `config/i18n-empty-placeholders.ts` still supplies the Vite-side transform (registered from the `vite:extendConfig` hook in `nuxt.config.ts`) plus `prioritizeVueI18nResourceTransform()`, which keeps the vue-i18n resource compiler ahead of Vite+'s JSON transform. Locale _types_ are generated from the mirror, whose `en-US` copy carries the full key set, so stripped keys stay valid in `$t()` call sites
- `pnpm i18n:check:fix` (`scripts/compare-translations.ts`) adds missing keys as `""` and removes extra keys
- `.tolgeerc.cjs` pulls `states: ["TRANSLATED", "REVIEWED", "UNTRANSLATED"]`; without `UNTRANSLATED`, `scripts/tolgee-pull-remap.ts` would wipe untranslated keys from disk on every sync (see wolfstar-project/wolfstar#240)
- The `$schema` pointer in each locale file is editor tooling metadata and never migrates through Tolgee in either direction. `pnpm tolgee:push` runs `scripts/tolgee-push-prepare.ts` first, which mirrors `i18n/locales/**` into the gitignored `i18n/.tolgee-push/` with `$schema` stripped — `.tolgeerc.cjs` points `push.files[*].path` at that mirror, never at `i18n/locales/`, so the pointer cannot become a platform key translators see and edit. On the way back, `scripts/tolgee-pull-remap.ts` discards whatever `$schema` the export carries and re-inserts `localeSchemaPointer(namespace)` (`../../schemas/{namespace}.schema.json`) as the first key, so a stale key left on the platform from an earlier push can never overwrite the local pointer
- `.tolgeerc.cjs`'s `NAMESPACES` is derived from `i18n/locale-features.json` (`.json` suffix stripped), not hardcoded, so the Tolgee namespace list and the app's feature-file list can't drift — a new feature file (e.g. `errors.json`, `marketing.json`) is picked up automatically. All eight namespaces put the project at ~907 string keys, past the Tolgee free plan's 500-key cap (per-project, not per-language, so `--languages` scoping doesn't help); confirm the plan has been upgraded, or scope `push.files` (not `patterns`, which only drives extraction and doesn't limit what `push.files` uploads) to a subset of namespaces, before running `pnpm tolgee:push` for real

## Prisma and Database Conventions

- Prisma schema lives in `server/database/schema.prisma`; migrations live in `server/database/migrations/`
- Treat migrations as append-only once merged
- Use raw SQL migrations for database features Prisma cannot express, such as partial indexes on nullable columns
- Do not add Prisma `@@index` entries for the manually-managed partial indexes on `Moderation.createdAt`; see migration `20260515000000_command_log_and_moderation_indexes`
- `AuditEvent` is hash-chained and tamper-evident; `CommandLog` is not hash-chained and is written directly by the bot/shared PostgreSQL producer

## Storage and Caching

- Netlify's Nitro storage (`cache`, `fetch-cache`, `skew-protection`) mounts a resilient unstorage driver at `shared/utils/storage/netlify-blobs-resilient.ts` (registered from `modules/cache.ts`, which activates on any non-test build where `std-env`'s `provider === "netlify"` — production and deploy previews alike, not just production) instead of the stock `unstorage/drivers/netlify-blobs`. It fails open on transient failures instead of surfacing a 500 or an unhandled Sentry error: `getKeys`/`getItem` swallow both mid-body TCP resets (`isTransientNetworkError()`) and Netlify's short-lived edge token expiring mid-request (`isTransientBlobsTokenError()`, a `BlobsInternalError: Token expired` that self-heals on the next call) — see `shared/utils/storage/transient-network-error.ts`. `setItem`/`removeItem` get a couple of short retries first via `withFailOpenRetry()` (mirroring `resilient-fetch.ts`'s 3-attempt/short-backoff shape), since a dropped mutation leaves stale data behind rather than just missing a read
- `createResilientNetlifyBlobsFetch()` (`shared/utils/storage/resilient-fetch.ts`) wraps `fetch` for that driver: it fully buffers each response body before returning, because `@netlify/blobs` only retries when `fetch()` itself throws, and a 200 with a truncated body would otherwise fail later inside `res.json()`/`res.arrayBuffer()`, past that retry loop. It skips buffering for null-body statuses (101/103/204/205/304) — constructing a `Response` with a non-null body for those throws a `TypeError` under Node 24's undici
- The app's own rate limiter (`wolfstar:ratelimiter`, `wolfstar:auth-ratelimiter` in `modules/cache.ts`) mounts straight to `cloudflareKVHttp`, not the resilient Blobs driver — the fail-open behavior above only covers Netlify Blobs-backed storage (`defineCachedFunction`, the i18n handler cache, SWR fetch caching, and — on Netlify builds only, production or preview — `nuxt-skew-protection`'s `version-manifest.json` + rollback asset storage; `nuxt.config.ts`'s `skewProtection.storage` falls back to a plain `fs-lite` mount at `./.cache/skew-protection` everywhere else (local dev, CI, non-Netlify deploys), which has no transient-network failures to fail open on). None of this covers the `__nkpv` cookie itself, which is written on document responses and pinned client-side by `app/plugins/skew-protection.client.ts`, unrelated to this storage driver

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
- **OAuth redirect fails:** Discord callback must hit the bot Better Auth URL (e.g. `http://localhost:8282/api/auth/callback/discord`); the bot must list this frontend origin in `trustedOrigins` / CORS with credentials
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

1. **Raw Tailwind palette classes** in `<template>` — e.g. `text-red-500`, `bg-blue-700`. Use semantic Nuxt UI classes (`text-primary`, `text-muted`, `bg-success`) instead.
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

Use the `nuxt` skill as the Nuxt router/entrypoint for tasks in this repository.

<!-- nuxt-skill-hub:end -->

<!-- skilld -->

Before modifying code, check .agents/skills/ for relevant skills.
Read the SKILL.md for any matching package before proceeding.

<!-- /skilld -->

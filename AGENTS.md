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

## Vue Component Patterns

- Block order: template -> script -> script setup -> styles
- Never create reactive state at module scope; use composables in `app/composables/`
- Place feature-specific components in grouped directories once a feature has multiple pieces, e.g. feedback UI in `app/components/feedback/`

## Auth and Feedback

- `server/api/auth/discord.get.ts` requests the `guilds.members.read` and `email` scopes and handles both legs of the OAuth flow: with no `code` query param it initiates (sets HMAC-signed nonce/redirect cookies via `createOAuthState()`); with a `code` present it is the callback, which verifies and consumes the CSRF state via `verifyOAuthState()` in `server/utils/oauth-state.ts` **before** any code exchange, then returns `{ redirectUrl }`. There is no separate `verify-state` endpoint — do not reintroduce one
- The `#auth-utils` `User` type includes `email: string | null`; always handle existing sessions where `user.email` is still `null`
- Feedback UI uses the custom Sentry feedback flow under `app/components/feedback/`
- Keep feedback validation in `shared/schemas/feedback.ts` so forms and submit handlers share the same Valibot schema

## Development Commands

```bash
pnpm dev                         # Development server (http://localhost:3000)
pnpm dev:pwa                     # Development server with local PWA behavior enabled
pnpm build                       # Production build
pnpm build:test                  # Test-mode production build through vite-plus
pnpm generate                    # Static generation
pnpm generate-pwa-icons          # Regenerate PWA icon assets
pnpm knip:fix                    # Auto-fix unused files, exports, and dependencies
pnpm preview                     # Preview production build locally
pnpm lint:fix                    # Run linter and auto-fix issues (oxlint + oxfmt)
pnpm typecheck                   # TypeScript type checking
pnpm test                        # Run all Vitest projects
pnpm test:unit                   # Run unit tests
pnpm test:nuxt                   # Nuxt component/API tests
pnpm test:browser                # Playwright E2E tests against a prebuilt app
pnpm test:browser:prebuilt       # Playwright E2E tests against an existing prebuilt app
pnpm test:browser:ui             # Playwright UI mode against a prebuilt app
pnpm test:browser:update         # Update Playwright snapshots
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
pnpm chromatic                   # Publish Storybook to Chromatic for visual review
pnpm vp run zizmor               # Lint GitHub Actions workflows for security issues (zizmor)
pnpm vp run zizmor:fix           # Auto-fix zizmor findings
pnpm prisma:push                 # Push schema changes (development)
pnpm prisma:migrate:dev          # Create and apply migration
pnpm prisma:migrate:dev:create   # Create a migration without applying it
pnpm prisma:migrate:diff         # Check migration drift against the Prisma schema
pnpm prisma:migrate:deploy       # Apply migrations in deployment environments
pnpm prisma:migrate:status       # Inspect migration status
pnpm prisma:migrate:resolve      # Resolve migration history state
pnpm prisma:migrate:reset        # Reset the local database
pnpm prisma:generate             # Regenerate Prisma client
pnpm prisma:generate:watch       # Regenerate Prisma client in watch mode
pnpm prisma:seed                 # Seed the database
pnpm prisma:studio               # Visual database editor (http://localhost:5555)
pnpm update:interactive          # Interactive dependency updates with taze
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
- Reduced-motion is honored at two layers: system (`prefers-reduced-motion: reduce` checked in plugin, CSS `@media` kill-switch) and user-override (`localStorage` key `user-prefers-reduced-motion` via `useReduceMotion()`).

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
- **Duplicate/incompatible `vue` or `discord-api-types` types after a dependency update:** Check the `overrides` in `pnpm-workspace.yaml` still pin a single version of each — two copies make structurally identical (nominally-branded) types incompatible during typecheck

**When in doubt:** Copy existing patterns from similar files (e.g., `server/api/guilds/**`, `app/components/discord/**`) before inventing new ones.

## Sentry and Source Maps

- Client source maps are hidden via `sourcemap.client: "hidden"` and uploaded to Sentry through `@sentry/nuxt`.
- Keep `sentry.sourcemaps.filesToDeleteAfterUpload` in `nuxt.config.ts` whenever changing source-map or build-output behavior so uploaded `.map` files are removed from `.output/**/public` and hidden deploy output directories.
- Sentry runtime configuration lives in `sentry.client.config.ts`, `sentry.server.config.ts`, and `server/utils/runtimeConfig.ts`; keep DSNs and sampling in runtime config, not hardcoded values.

## Audit Logging

All security-relevant actions are captured via `evlog`'s `log.audit()` pipeline, persisted to `AuditEvent` in PostgreSQL with a tamper-evident SHA-256 hash chain.

### Action Registry

Defined in `shared/audit/actions.ts`:

| Action Creator              | Action Name                    | Emitted When                                  |
| --------------------------- | ------------------------------ | --------------------------------------------- |
| `guildSettingsUpdate`       | `guild.settings.update`        | PATCH guild settings succeeds                 |
| `guildSettingsAccessDenied` | `guild.settings.access-denied` | `canManage()` throws                          |
| `userLogin`                 | `user.login`                   | Discord OAuth `onSuccess`                     |
| `userLogout`                | `user.logout`                  | Session cleared due to missing/invalid tokens |
| `sessionRefresh`            | `session.refresh`              | Token refresh succeeds or fails               |
| `oauthStateInvalid`         | `oauth.state.invalid`          | CSRF state verification fails                 |

Only exported action creators are listed above. `command.executed` is currently an internal action-name constant; command history is read from `CommandLog`, not emitted through the audit hash chain.

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
- `server/middleware/evlog-session-bridge.ts` — propagates `nuxt-auth-utils` session users into evlog context
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
- `app/components/discord/*.vue` (message, embed, mention, reaction) — Discord brand fidelity requires Discord brand colors

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

<!-- skilld -->

Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.

<!-- /skilld -->

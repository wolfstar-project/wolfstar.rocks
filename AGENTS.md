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
- Use `createError` for error responses with proper status codes
- Use the `onError` callback for error logging

## Vue Component Patterns

- Block order: template -> script -> script setup -> styles
- Never create reactive state at module scope; use composables in `app/composables/`

## Development Commands

```bash
pnpm dev              # Development server (http://localhost:3000)
pnpm build            # Production build
pnpm preview          # Preview production build locally
pnpm lint:fix         # Run linter and auto-fix issues (oxlint + oxfmt)
pnpm typecheck        # TypeScript type checking
pnpm test             # Run all Vitest tests
pnpm test:nuxt        # Nuxt component tests
pnpm test:browser     # Playwright E2E tests
pnpm prisma:push      # Push schema changes (development)
pnpm prisma:migrate:dev   # Create and apply migration
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:studio    # Visual database editor (http://localhost:5555)
```

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
- **OAuth redirect fails:** Ensure `.env` `NUXT_OAUTH_DISCORD_REDIRECT_URI` matches Discord Developer Portal exactly
- **Hot reload broken:** Check file watcher limits on Linux, restart dev server
- **Type errors after updates:** Run `pnpm nuxt prepare && pnpm prisma:generate`

**When in doubt:** Copy existing patterns from similar files (e.g., `server/api/guilds/**`, `app/components/discord/**`) before inventing new ones.

## Auth E2E Testing

Auth E2E tests live in `test/e2e-createpage/` and use `@nuxt/test-utils/e2e` (`createPage` + `setup`) to spin up a real Nuxt server and drive a headless Chromium browser.

### Project Config

Vitest project name: `auth-e2e`. Configured in `vite.config.ts` with:

- `environment: "node"`, `pool: "forks"`, `poolOptions.forks.singleFork: true` (prevents multiple Nuxt servers running in parallel)
- `testTimeout: 60_000` (Nuxt startup + OAuth round-trips can be slow)
- `env.NODE_ENV: "test"` and `env.NUXT_SESSION_PASSWORD` set so the test server can seal/unseal sessions

Run with:

```bash
pnpm test:auth-e2e
```

### Test Structure

Each spec file wraps tests in `describe('...', async () => { await setup(...); ... })`. `setup()` starts the Nuxt server once per describe block.

```ts
import { createPage, setup } from "@nuxt/test-utils/e2e";
import { ROOT_DIR, TEST_NUXT_CONFIG } from "./setup";

describe("my feature", async () => {
	await setup({
		rootDir: ROOT_DIR,
		browser: true,
		browserOptions: { type: "chromium", launch: { headless: true } },
		nuxtConfig: TEST_NUXT_CONFIG,
	});

	test("...", async () => {
		const page = await createPage("/some-path");
		// ... assertions
		await page.close();
	});
});
```

### Session Seeding

To test authenticated flows, use `seedSession` from `test/e2e-createpage/helpers/seed-session.ts`. This POST to the test-only endpoint `server/api/__test__/seed-session.post.ts` (returns 404 unless `NODE_ENV === 'test'`), which seals a real session cookie into the browser context.

```ts
import { seedSession } from "./helpers/seed-session";
import { FIXTURE_DISCORD_USER } from "../fixtures/discord-user";

const page = await createPage("/");
await seedSession(page, FIXTURE_DISCORD_USER);
// All subsequent page.goto() calls will include the session cookie
```

### OAuth Mocking

Use helpers from `test/e2e-createpage/helpers/mock-discord-oauth.ts` to stub Discord OAuth endpoints without leaving the test domain:

- `mockDiscordExchangeSuccess(page, user)` — stubs `/api/auth/discord` + `/api/_auth/session`
- `mockDiscordExchangeFail(page)` — stubs `/api/auth/discord` to return 500
- `mockVerifyStateSuccess(page, redirectUrl?)` — stubs `/api/auth/verify-state`
- `mockVerifyStateFail(page)` — stubs `/api/auth/verify-state` to return 400
- `stubDiscordAuthorize(page)` — stubs `https://discord.com/oauth2/authorize` so navigation does not escape the test

### Key Files

| File                                                | Purpose                                                        |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `test/e2e-createpage/setup.ts`                      | Shared `ROOT_DIR`, `TEST_SESSION_PASSWORD`, `TEST_NUXT_CONFIG` |
| `test/fixtures/discord-user.ts`                     | `FIXTURE_DISCORD_USER` constant and `SessionUser` type         |
| `test/e2e-createpage/helpers/seed-session.ts`       | `seedSession(page, user)` helper                               |
| `test/e2e-createpage/helpers/mock-discord-oauth.ts` | Page-level OAuth mocks                                         |
| `server/api/__test__/seed-session.post.ts`          | Test-only session seeding endpoint                             |

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
- `server/utils/audit/postgres-drain.ts` — Postgres sink with hash-chain (P2002 swallowed, P2034 retried 5x)
- `server/utils/audit/actor-bridge.ts` — resolves actor from request context
- `server/plugins/evlog-drain.ts` — routes audit events to the drain
- `server/plugins/evlog-enrich.ts` — enriches events with UA, trace, and audit context

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

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

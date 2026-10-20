# Audit logging

Read before adding an audit event or touching the hash chain.

All security-relevant actions are captured via `evlog`'s `log.audit()` pipeline, persisted to `AuditEvent` in PostgreSQL with a tamper-evident SHA-256 hash chain.

## Action Registry

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

## Instrumentation Pattern

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

## Key Files

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

## Dashboard Activity Feed

- `DASHBOARD_AUDIT_ACTIONS` controls which audit actions appear in the dashboard activity feed
- Add new dashboard-visible actions to both the exported action creators and `DASHBOARD_AUDIT_ACTIONS`
- Keep audit `changes` payloads JSON-serializable; `AuditEnvelope` rejects `BigInt`, `Date`, `Map`, `Set`, circular references, and `undefined` array entries before hashing

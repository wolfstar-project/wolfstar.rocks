# Plan 003: Validate OAuth state before exchanging a code or creating a session

> **Executor instructions**: Treat this as a security fix. Preserve safe redirect,
> audit, rate-limit, and existing-session behavior. Do not publish exploit instructions.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- app/pages/oauth/callback.vue server/api/auth/discord.get.ts server/api/auth/verify-state.get.ts server/utils/oauth-state.ts test`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/002-real-security-boundary-tests.md`
- **Category**: security
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

The callback sends `code` to the exchange endpoint, refreshes the new session, and only
then validates `state`. A failed state therefore changes authentication state before
the CSRF check. The exchange request must atomically validate state and consume its
cookies before `setUserSession` can run.

## Current state

- `app/pages/oauth/callback.vue:64-70` sends only `code` to `/api/auth/discord`.
- `app/pages/oauth/callback.vue:78-100` exchanges, refreshes, then calls `/api/auth/verify-state`.
- `server/api/auth/discord.get.ts:20-47` creates state cookies only during initiation.
- `server/api/auth/discord.get.ts:65-88` sets the user session on successful exchange.
- `server/api/auth/verify-state.get.ts:18-58` separately consumes and validates state.
- Audit denials use `oauthStateInvalid` and safe paths use `isSafeRedirectPath`; preserve both.

## Commands you will need

| Purpose     | Command                                                        | Expected |
| ----------- | -------------------------------------------------------------- | -------- |
| OAuth tests | `pnpm test:unit -- oauth-state discord-handler oauth-callback` | all pass |
| Typecheck   | `pnpm typecheck`                                               | exit 0   |
| Full gates  | Commands in `plans/README.md`                                  | all pass |

## Suggested executor toolkit

Use `nuxt`, `vue`, and `vitest` skills if available.

## Scope

**In scope**: `app/pages/oauth/callback.vue`, `server/api/auth/discord.get.ts`,
`server/api/auth/verify-state.get.ts`, `server/utils/oauth-state.ts`, and focused tests.

**Out of scope**: OAuth scopes, Discord token storage format, session lifetime/cookie
policy, guild-install callback, and unrelated redirects.

## Git workflow

- Branch: `codex/003-oauth-state-order`
- Commit: `fix(auth): verify oauth state before session creation`

## Steps

### Step 1: Choose one atomic callback boundary

Make `/api/auth/discord` receive both `code` and `state` during callback. Before invoking
the code-exchange path, read and consume nonce/redirect cookies and call
`verifyOAuthState`. On any missing, expired, mismatched, or malformed input, emit the
existing denial audit and throw 400 without invoking Discord or `setUserSession`.
Return the safe redirect URL with the successful exchange response.

**Verify**: unit test asserts invalid state causes zero exchange and zero session writes.

### Step 2: Simplify the client callback sequence

Pass `state` with `code`; use the redirect returned by the atomic endpoint. Remove the
post-session `/api/auth/verify-state` call. Refresh the client session only after the
atomic request succeeds. Keep `viewTransition: false` and full-page navigation.

**Verify**: callback test asserts validation/exchange completes before session refresh and navigation.

### Step 3: Remove or constrain the obsolete endpoint

If `/api/auth/verify-state` has no caller, remove it and update tests. If an external
caller exists, stop and report rather than keeping two state-consumption paths.

**Verify**: `rg -n "verify-state" app server test` → no obsolete runtime caller.

## Test plan

Cover valid state; missing state; wrong nonce; mismatched redirect cookie; expired state;
single-use cookies; Discord exchange failure; safe redirect fallback; and proof that
invalid state never creates or refreshes a session. Model utility cases on
`test/unit/server/utils/oauth-state.test.ts`.

## Done criteria

- [ ] No token exchange or session mutation occurs before state validation.
- [ ] State cookies are consumed exactly once on success and failure.
- [ ] Denial audit behavior remains.
- [ ] Targeted and shared final gates pass.

## STOP conditions

- `defineOAuthDiscordEventHandler` cannot be invoked after custom validation without
  losing required framework behavior.
- Another runtime caller depends on `/api/auth/verify-state`.
- Fix requires changing session encryption or OAuth scopes.

## Maintenance notes

Future OAuth providers must keep state validation and session creation in one server
request. Reviewer should inspect failure ordering, not only the happy redirect.

# Plan 004: Authorize every cached guild-log request

> **Executor instructions**: Cache hits must never bypass session or guild permission
> checks. Preserve response shapes, filter validation, and 30-second caching.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- server/utils/wrappedEventHandler.ts server/api/guilds/[guild]/logs test`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/002-real-security-boundary-tests.md`
- **Category**: security
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

`cachedEventHandler` currently wraps authentication and authorization. Once an
authorized request warms a guild-and-query cache key, a hit may return without running
`requireUserSession` or `canManage`. The cache must contain data only; request-specific
security checks must execute before every lookup.

## Current state

- `server/utils/wrappedEventHandler.ts:342-355` calls `applyWrappedHandlerLogic`
  inside `cachedEventHandler`.
- `server/api/guilds/[guild]/logs/index.get.ts:74-80` uses a key containing guild ID and search only.
- Command and moderation routes repeat the same pattern at lines 82-88 and 90-96.
- Route convention requires `defineWrappedCachedResponseHandler`, `auth: true`, explicit
  max age, `swr: false`, `onError`, and route-specific limits.

## Commands you will need

| Purpose       | Command                                   | Expected |
| ------------- | ----------------------------------------- | -------- |
| Wrapper tests | `pnpm test:unit -- wrapped-event-handler` | all pass |
| Log tests     | `pnpm test:nuxt -- guilds/logs`           | all pass |
| Full gates    | Commands in `plans/README.md`             | all pass |

## Scope

**In scope**: `server/utils/wrappedEventHandler.ts`, three guild-log routes only if
needed, and focused tests from plan 002.

**Out of scope**: changing log response schemas, disabling caching, changing database
queries, or embedding session IDs in shared data keys as a substitute for authorization.

## Git workflow

- Branch: `codex/004-authenticated-cache`
- Commit: `fix(security): authorize cached guild log requests`

## Steps

### Step 1: Split request guards from cacheable resolution

Refactor the wrapper so session authentication and rate limiting execute on every
request before cached resolution. Do not duplicate error handling. Preserve generic
types and the uncached wrapper behavior.

**Verify**: wrapper tests prove `requireUserSession` executes on cold and warm requests.

### Step 2: Preserve guild-level authorization

Because `canManage()` currently lives inside each cached route resolver, introduce a
clear wrapper hook or route composition that runs guild authorization before cache
access. Do not rely solely on an authenticated session: users can lose guild permissions.
Keep cache keys user-independent only after permission checks are guaranteed per request.

**Verify**: warm cache as manager, then request as non-manager → 403 and no cached body.

### Step 3: Verify all three routes

Apply the invariant to activity, command, and moderation logs. Assert filters still
produce distinct stable keys and successful users share the data cache safely.

**Verify**: targeted log tests pass, including warm-hit authorization cases.

## Test plan

Required cases: unauthenticated cold/warm request; authenticated non-manager cold/warm;
manager cold/warm; permission revoked between calls; two managers share a cached result;
query strings remain isolated; onError still fires on resolver failures.

## Done criteria

- [ ] Session and `canManage` checks run before every cache hit.
- [ ] Cache retains the intended 30-second, `swr: false` behavior.
- [ ] All three log endpoints have regression coverage.
- [ ] Shared final gates pass.

## STOP conditions

- Nitro caching cannot be composed beneath request guards with the installed API.
- Authorization requires caching member permissions longer than the request.
- A proposed fix changes public response or filter contracts.

## Maintenance notes

Any future authenticated cached endpoint must use the same guard-before-cache composition.
Reviewers should explicitly test a cache warmed by a different identity.

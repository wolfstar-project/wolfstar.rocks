# Plan 002: Exercise real OAuth, cache, and rate-limit boundaries in tests

> **Executor instructions**: Follow the plan without implementing the fixes in
> plans 003–005. Characterization tests may demonstrate current vulnerable behavior;
> mark such tests with `it.fails` or an equivalent explicit regression mechanism.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- server/utils/wrappedEventHandler.ts server/api/auth test/unit test/nuxt/api/guilds/logs`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: `plans/001-enforce-ci-typecheck.md`
- **Category**: tests
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

Existing endpoint tests register replacement handlers, so their 401 assertions do
not execute production authentication, caching, or rate limiting. OAuth tests cover
redirect-string validation but not the callback sequence. Real boundary tests are
needed before security-sensitive control flow changes.

## Current state

- `test/nuxt/api/guilds/logs/index.spec.ts:9-15` registers a mock handler that calls
  `requireTestSession`; it never imports the production route.
- `test/unit/server/api/auth/discord-handler.test.ts:4-30` tests only `isSafeRedirectPath`.
- `server/utils/wrappedEventHandler.ts:343-355` places `applyWrappedHandlerLogic`
  inside `cachedEventHandler`.
- Unit-test mocking exemplar: `test/unit/server/api/guilds-index-get-cached-channels.spec.ts`.
- Nuxt endpoint test exemplar using real routes and fixtures:
  `test/nuxt/api/guilds/settings.spec.ts`; do not copy its replacement-handler shortcut.

## Commands you will need

| Purpose             | Command                                                  | Expected                      |
| ------------------- | -------------------------------------------------------- | ----------------------------- |
| Targeted unit tests | `pnpm test:unit -- wrapped-event-handler oauth-callback` | all non-regression tests pass |
| Nuxt tests          | `pnpm test:nuxt -- guilds/logs`                          | exit 0                        |
| Full gates          | Commands in `plans/README.md`                            | all pass                      |

## Suggested executor toolkit

Use the `vitest`, `nuxt`, and `vue` skills if available. Keep network and Discord fully mocked.

## Scope

**In scope**: new focused tests under `test/unit/server/utils/`,
`test/unit/server/api/auth/`, and minimal test-only helpers.

**Out of scope**: production code, schema/database changes, rewriting every API test,
or making known regression tests pass by weakening assertions.

## Git workflow

- Branch: `codex/002-security-boundary-tests`
- Commit: `test(security): cover auth cache and rate-limit boundaries`

## Steps

### Step 1: Test cached-handler ordering with production wrapper code

Mock Nitro globals before importing `wrappedEventHandler.ts`. Build a deterministic
fake `cachedEventHandler` capable of returning a warmed response without invoking
its resolver. Assert that warming as an authorized user and requesting the same key
as an unauthorized user exposes whether auth executes on the hit. Also assert that
route `getKey` values do not accidentally vary by session.

**Verify**: targeted test runs and explicitly records the current regression.

### Step 2: Test OAuth callback sequencing

Extract no production logic yet. Mount or import the callback with mocked `useFetch`,
`refreshSession`, `$fetch`, and navigation. Record call order and assert the desired
security invariant: state verification must precede token exchange/session refresh.
Because current code violates it, use an explicit expected-failure test that plan 003
will convert to a normal passing test.

**Verify**: targeted OAuth test exits 0 while visibly containing the regression assertion.

### Step 3: Test concurrent rate-limit reservations

Drive the real wrapper with a controllable storage mock that pauses two `getItem`
calls before allowing writes. Record that both requests currently reserve from the
same state. Add cases for fixed and sliding windows and for rollback after a handler error.

**Verify**: targeted wrapper tests exit 0 and deterministically reproduce the race.

## Test plan

Required cases: authorized cold cache; unauthorized warm cache; two-user warm cache;
OAuth valid/invalid/missing state ordering; concurrent fixed and sliding reservations;
rollback without removing another request's token. Avoid real timers and network.

## Done criteria

- [ ] Tests import production wrappers or route modules, not replacement endpoints.
- [ ] Findings 1, 2, and 4 each have a deterministic regression test.
- [ ] No production file changed.
- [ ] Shared final gates pass.

## STOP conditions

- Production modules cannot be imported without a Nuxt runtime after reasonable hoisted mocks.
- A test requires real Discord, PostgreSQL, or registry access.
- Passing tests would require implementing plans 003–005.

## Maintenance notes

Plans 003–005 must convert their corresponding regression assertion into a normal
passing test. Keep these tests at the wrapper boundary; mocked endpoint response-shape
tests remain useful but are not authorization tests.

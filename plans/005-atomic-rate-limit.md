# Plan 005: Make rate-limit reservations atomic and rollback-safe

> **Executor instructions**: Preserve fixed/sliding semantics and response headers.
> Do not claim distributed safety unless the selected storage primitive guarantees it.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- server/utils/wrappedEventHandler.ts shared/schemas/rate-limit.ts modules/cache.ts test`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/002-real-security-boundary-tests.md`
- **Category**: security
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

Rate limiting performs separate `getItem` and `setItem` operations. Concurrent requests
can reserve from identical state and overwrite one another; rollback can also remove a
different request's token. This weakens abuse controls exactly during bursts.

## Current state

- `server/utils/wrappedEventHandler.ts:126-130` reads state once.
- Fixed reservations increment and write at `198-200`; sliding reservations append and
  write at `273-275`.
- Failure rollback mutates the latest shared state at `217-225` and `291-300` without
  identifying the reservation.
- `modules/cache.ts` defines Nitro storage mounts; inspect the deployed driver's atomic
  capabilities before choosing an implementation.

## Commands you will need

| Purpose       | Command                                   | Expected |
| ------------- | ----------------------------------------- | -------- |
| Wrapper tests | `pnpm test:unit -- wrapped-event-handler` | all pass |
| Typecheck     | `pnpm typecheck`                          | exit 0   |
| Full gates    | Commands in `plans/README.md`             | all pass |

## Scope

**In scope**: `server/utils/wrappedEventHandler.ts`, one focused rate-limit utility if
extraction improves testability, storage configuration only when required, and tests.

**Out of scope**: changing route limits/windows, third-party hosted services, CAPTCHA,
IP trust policy, or swallowing storage failures silently.

## Git workflow

- Branch: `codex/005-atomic-rate-limit`
- Commit: `fix(api): make rate-limit reservations atomic`

## Steps

### Step 1: Document the actual storage consistency boundary

Identify production Nitro storage driver(s) in `modules/cache.ts`/deployment config and
whether they support CAS, atomic increment, transactions, or locks. Prefer a storage-native
atomic operation. If none exists, design an in-process keyed mutex and clearly document
that it protects only one process; stop if the deployment requires cross-instance guarantees.

**Verify**: tests or types demonstrate the selected primitive is available.

### Step 2: Reserve inside one critical section

For each identifier/scope key, prune/reset, check limit, reserve, and persist without an
interleaving read. Return a reservation ID/token so rollback can remove only that request.
Keep functions under roughly 50 lines by extracting focused typed helpers.

**Verify**: orchestrated concurrent tests allow exactly `limit` requests.

### Step 3: Make failure handling explicit

Do not silently turn storage failure into unlimited access without an intentional policy.
Implement and test the chosen fail-open/fail-closed behavior and structured logging.
Preserve all `x-ratelimit-*`, `retry-after`, Sentry metric, and hash-privacy behavior.

**Verify**: storage-error and rollback tests pass for fixed and sliding modes.

## Test plan

Cover simultaneous requests at, below, and above the limit; window expiry; unique rollback;
storage failures; route/global scopes; whitelists; authenticated and IP identifiers; and
fixed/sliding headers. Use fake timers and controlled promises, never sleeps.

## Done criteria

- [ ] Concurrent reservations cannot overwrite each other within the documented boundary.
- [ ] Rollback removes only its own reservation.
- [ ] Existing route limits and headers remain unchanged.
- [ ] Shared final gates pass.

## STOP conditions

- Production uses multiple instances but available storage has no atomic primitive.
- Correctness would require a new paid/external service.
- Storage driver behavior cannot be verified from code or authoritative types/docs.

## Maintenance notes

Review deployed storage whenever Nitro/Netlify adapters change. A local mutex is not a
distributed lock; keep that limitation visible if it is the accepted deployment trade-off.

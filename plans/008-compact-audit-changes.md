# Plan 008: Persist compact guild-settings audit changes

> **Executor instructions**: Maintain compatibility with existing audit rows. Do not migrate
> or rewrite the hash chain. Changes must remain JSON-serializable under `AuditEnvelope` rules.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- server/api/guilds/[guild]/settings.patch.ts server/utils/audit/patch-to-changes.ts shared/audit shared/types/audit-log.ts test`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/006-repair-audit-verifier.md`
- **Category**: perf
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

Every settings update currently stores complete before-and-after objects covering the full
guild settings model. Readers then recompute a small diff. Persisting the actual changed
fields reduces database, hashing, cache, and response work while preserving useful history.

## Current state

- `server/api/guilds/[guild]/settings.patch.ts:92-108` serializes full snapshots into
  `{ before, after }` and passes them to `guildSettingsUpdate`.
- `server/utils/audit/patch-to-changes.ts:35-78` calls `auditDiff(before, after)` at read time.
- `shared/audit/envelope.ts:23-38` rejects BigInt, Date, Map, Set, cycles, and undefined array entries.
- Dashboard output expects `added`, `removed`, and `changed` groups; preserve that contract.

## Commands you will need

| Purpose        | Command                                    | Expected |
| -------------- | ------------------------------------------ | -------- |
| Audit tests    | `pnpm test:unit -- audit patch-to-changes` | all pass |
| Settings tests | `pnpm test:nuxt -- guilds/settings`        | all pass |
| Full gates     | Commands in `plans/README.md`              | all pass |

## Scope

**In scope**: settings PATCH route, `patch-to-changes.ts`, audit-change types/tests, and
field metadata only if required.

**Out of scope**: database migrations, changing audit hashes/actions, deleting old events,
changing settings response shape, or exposing values absent from existing history.

## Git workflow

- Branch: `codex/008-compact-audit-changes`
- Commit: `perf(audit): persist compact settings changes`

## Steps

### Step 1: Define a version-tolerant payload

Choose a compact JSON shape produced by `auditDiff` at write time. Include a small version or
shape discriminator if needed. Keep `patchToChanges` able to read both legacy `{before,after}`
rows and new compact rows without ambiguity.

**Verify**: tests convert equivalent legacy/new fixtures into identical dashboard changes.

### Step 2: Compute changes after the successful transaction

Continue capturing the pre-write state and only emit success audit after `submit()`. Compute
the compact change set, drop unchanged fields, and ensure BigInt values pass through existing
serialization before hashing.

**Verify**: one-field update audit contains that field only; failed writes emit no success audit.

### Step 3: Bound payload behavior

Add a representative many-setting fixture and assert the compact serialized payload is smaller
than the legacy snapshots. Avoid brittle exact-byte thresholds.

**Verify**: audit and settings tests pass.

## Test plan

Cover changed scalar; added/removed nullable field; arrays; BigInt-backed duration; no-op update;
multiple fields; legacy row; new row; and malformed/unknown version behavior.

## Done criteria

- [ ] New events store only changed settings values.
- [ ] Existing rows render identically.
- [ ] No audit schema migration or historical rehash occurs.
- [ ] Shared final gates pass.

## STOP conditions

- `evlog`'s compact diff contains unsupported values or unstable ordering.
- Legacy and new payloads cannot be distinguished safely.
- Fix requires rewriting existing AuditEvent rows.

## Maintenance notes

Keep the legacy reader until retention guarantees no old rows remain. Any future payload version
needs explicit fixtures in both the dashboard transformer and verifier tests.

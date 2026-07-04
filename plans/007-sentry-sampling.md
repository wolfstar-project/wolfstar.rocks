# Plan 007: Honor and validate the configured Sentry trace sample rate

> **Executor instructions**: Keep Sentry configuration in runtime config. Do not hardcode
> DSNs or secret values and do not expose server-only credentials publicly.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- server/utils/runtimeConfig.ts sentry.client.config.ts sentry.server.config.ts .env.example test/unit/config`

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-enforce-ci-typecheck.md`
- **Category**: bug
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

Runtime configuration checks `SENTRY_TRACES_SAMPLE_RATE` but reads
`NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`. Setting either variable alone can be ignored or
produce `NaN`, leading to unintended telemetry cost or missing traces.

## Current state

```ts
// server/utils/runtimeConfig.ts:23-27
sentry: {
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
    ? Number(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
    : 0.2,
}
```

`.env.example:55-68` documents Sentry credentials/DSN but no sampling variable.
Configuration test exemplar: `test/unit/config/env.spec.ts`.

## Commands you will need

| Purpose      | Command                       | Expected |
| ------------ | ----------------------------- | -------- |
| Config tests | `pnpm test:unit -- config`    | all pass |
| Typecheck    | `pnpm typecheck`              | exit 0   |
| Full gates   | Commands in `plans/README.md` | all pass |

## Scope

**In scope**: `server/utils/runtimeConfig.ts`, `.env.example`, focused config tests, and
Sentry config files only if needed to align consumption.

**Out of scope**: DSNs, auth tokens, Sentry project/org, event filtering, or changing the
default rate without an explicit existing product decision.

## Git workflow

- Branch: `codex/007-sentry-sampling`
- Commit: `fix(sentry): honor trace sample rate configuration`

## Steps

### Step 1: Define one variable and parser

Choose the existing intended public runtime variable after checking all consumers. Parse it
once, require a finite number in `[0, 1]`, and use the existing `0.2` default only when absent.
Invalid values should fail configuration clearly or fall back with a structured warning,
matching existing configuration policy.

**Verify**: unit tests cover absent, 0, 1, fractional, nonnumeric, negative, and >1 values.

### Step 2: Document the exact variable

Add the variable and allowed range to `.env.example` without a secret value. Ensure client
and server Sentry initialization receive the same validated rate where intended.

**Verify**: `rg -n "TRACES_SAMPLE_RATE" .env.example server sentry.*.config.ts` → one consistent name.

## Test plan

Extend config unit tests; restore `process.env` after each case. Explicitly test zero, because
truthiness checks commonly break it.

## Done criteria

- [ ] One environment variable is checked and read consistently.
- [ ] Values are finite and bounded from 0 through 1.
- [ ] `.env.example` documents it.
- [ ] Shared final gates pass.

## STOP conditions

- Client and server intentionally require separate sampling variables.
- Runtime config types prohibit the chosen validation policy.

## Maintenance notes

Sampling configuration directly affects observability spend. Review zero handling and avoid
truthiness-based parsing in future changes.

# Plan 001: Enforce strict TypeScript checking in CI

> **Executor instructions**: Follow every step and verification gate. Update the
> status row in `plans/README.md` when done. Do not push or open a PR unless told.
>
> **Drift check (run first)**: `git diff --stat d9a206c6..HEAD -- .github/workflows/ci.yml package.json`
> If either file changed, compare the excerpts below with live code. Stop on a semantic mismatch.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

The repository documents `pnpm typecheck` as mandatory, but CI never runs it.
Nuxt builds do not substitute for an explicit strict typecheck. Enforcing the
existing command prevents invalid server utilities, generated-client drift, and
unsafe Vue changes from merging.

## Current state

- `.github/workflows/ci.yml:23-265` defines lint, unit, component, browser,
  benchmark, accessibility, performance, and knip jobs; no job runs typecheck.
- `package.json:58` defines `"typecheck": "stale-dep && nuxt typecheck"`.
- `.github/CONTRIBUTING.md:416` tells contributors that CI checks typechecking.
- Existing CI setup exemplar: `.github/workflows/ci.yml:44-81` uses pinned
  `actions/checkout`, `voidzero-dev/setup-vp`, Blacksmith ARM runners, and pnpm caching.

## Commands you will need

| Purpose           | Command                       | Expected          |
| ----------------- | ----------------------------- | ----------------- |
| Validate workflow | `pnpm exec vp run zizmor`     | exit 0            |
| Typecheck         | `pnpm typecheck`              | exit 0, no errors |
| Full gates        | Commands in `plans/README.md` | all pass          |

## Scope

**In scope**: `.github/workflows/ci.yml`; only add another file if a focused CI test fixture is essential.

**Out of scope**: changing TypeScript strictness, suppressing existing errors,
changing dependencies, or weakening the `typecheck` script.

## Git workflow

- Suggested branch: `codex/001-ci-typecheck`
- Commit: `ci: enforce typechecking`

## Steps

### Step 1: Establish the local baseline

Run `pnpm typecheck`. If it fails on existing code, preserve the output and stop;
do not add CI that is known to fail and do not fix unrelated type errors in this plan.

**Verify**: `pnpm typecheck` → exit 0.

### Step 2: Add a dedicated CI job

Add a `typecheck` job near `lint`, following the unit job's pinned checkout and
`setup-vp` pattern. Use the repository's ARM Blacksmith runner, enable dependency
caching, and run `vp run typecheck`. Keep job permissions at inherited `contents: read`.

**Verify**: `rg -n "typecheck|vp run typecheck" .github/workflows/ci.yml` → shows the job and command once.

### Step 3: Validate workflow security and project gates

Run the workflow checker and shared final gates. Review `git diff` after
`lint:fix`; formatting must not touch unrelated source files.

**Verify**: `pnpm exec vp run zizmor` and all commands in `plans/README.md` → exit 0.

## Test plan

No application test is needed. CI syntax/security validation plus a successful
local `pnpm typecheck` is the regression test.

## Done criteria

- [ ] CI contains a dedicated typecheck job using the existing setup pattern.
- [ ] `pnpm typecheck` and `pnpm exec vp run zizmor` exit 0.
- [ ] Shared final verification passes.
- [ ] Only in-scope files and `plans/README.md` changed.

## STOP conditions

- Baseline `pnpm typecheck` fails.
- `setup-vp` cannot expose the `typecheck` package script in CI.
- The workflow must gain write permissions or unpinned actions.

## Maintenance notes

Keep this job independent so failures are visible without waiting for browser builds.
Reviewers should reject future attempts to replace typechecking with `nuxt build`.

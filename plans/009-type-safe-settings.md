# Plan 009: Remove production `any` from guild-settings forms

> **Executor instructions**: Refactor incrementally by feature group. Preserve forms, validation,
> payload keys, accessibility, and loading/reset behavior. Never replace `any` with unsafe double casts.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- app/components/guild/settings app/components/guild/SettingsSection.vue app/utils/index.ts shared/schemas server/database/settings test/nuxt/components/guild/settings`

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/001-enforce-ci-typecheck.md`
- **Category**: tech-debt
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

Dynamic form keys use `Record<string, any>`, `as any`, and untyped form APIs where validated
state becomes `Partial<GuildData>`. This violates repository rules and prevents TypeScript from
detecting mismatched settings keys or value types before database updates.

## Current state

- `app/components/guild/settings/Form.vue:14` declares `T extends Record<string, any>` and uses
  `any` for indexed changes and exposed form methods at lines 60-76 and 149-150.
- `Channels.vue:74-103` constructs a typed schema but casts indexed assignments to `any`.
- `Roles.vue:152-196` builds default/original values through `Record<string, any>`.
- `shared/schemas/settings.ts` and feature schemas are the runtime source of truth.
- Component test pattern: `test/nuxt/components/guild/settings/Form.spec.ts` plus each feature spec.
- Vue convention: Composition API, `<script setup lang="ts">`, Nuxt auto-imports, no module-scope state.

## Commands you will need

| Purpose        | Command                                       | Expected                                                                        |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Settings tests | `pnpm test:nuxt -- components/guild/settings` | all pass                                                                        |
| Search         | `rg -n "\bany\b                               | as any" app/components/guild/settings app/components/guild/SettingsSection.vue` | no production matches except documented third-party boundary if explicitly justified |
| Full gates     | Commands in `plans/README.md`                 | all pass                                                                        |

## Suggested executor toolkit

Use `vue`, `nuxt-ui`, `nuxt`, and `vitest` skills if available.

## Scope

**In scope**: settings form components, a focused shared typed helper/composable if needed,
associated schemas/types, and their tests.

**Out of scope**: visual redesign, new settings, API/database schema changes, renaming persisted keys,
changing validation rules, or broad cleanup of unrelated `app/utils/index.ts` helpers.

## Git workflow

- Branch: `codex/009-type-safe-settings`
- Prefer logical commits per group, e.g. `refactor(settings): type generic form mapping`.

## Steps

### Step 1: Model key/value relationships

Derive feature state types from Valibot output and define helpers where `K extends keyof GuildData`
preserves `GuildData[K]`. Replace unconstrained records with `unknown` only at genuine framework
boundaries, then narrow. Do not cast to `never` merely to silence assignments.

**Verify**: `pnpm typecheck` passes after generic Form changes.

### Step 2: Refactor the generic form boundary

Type `mapToGuildData`, submit/error events, exposed methods, and indexed comparison without `any`.
Keep focused functions under about 50 lines. Add compile-time negative tests where the repository's
test tooling supports `@ts-expect-error` for deliberately invalid keys/values.

**Verify**: Form component tests and typecheck pass.

### Step 3: Migrate feature components in small groups

Migrate Channels and Roles first, then remaining settings components returned by the search.
After each group run its specs. Preserve field labels, `aria` behavior, first-error scrolling,
toasts, state synchronization, reset, and empty/null semantics.

**Verify**: targeted settings tests pass after every group.

### Step 4: Close the escape-hatch search

Run the scoped `rg`. For an unavoidable third-party boundary, use `unknown`, a typed adapter, and
a short non-obvious-logic comment. Do not suppress with global lint rules.

**Verify**: scoped search and shared final gates pass.

## Test plan

Retain all current feature tests. Add cases proving nullable single values, empty arrays, booleans,
duration conversions, invalid schema values, changed-only payloads, and reset behavior. Add at least
one compile-time assertion that a key cannot receive another key's value type.

## Done criteria

- [ ] No production `any` remains in the scoped settings components.
- [ ] No `as never` or double-cast replacement was introduced.
- [ ] Settings payload keys and values remain unchanged at runtime.
- [ ] Accessibility and all shared gates pass.

## STOP conditions

- Generated Prisma `GuildData` cannot express a form's existing null/array contract.
- A schema and database field disagree on a persisted value type.
- Scope expands outside settings forms and their direct type helpers.

## Maintenance notes

Future settings should add schema, form-state type, typed mapper, and tests together. Reviewer should
look for disguised escape hatches (`unknown as`, `never`, broad index signatures), not just `any`.

# Plan 010: Reconcile contributor documentation with actual commands and capabilities

> **Executor instructions**: Document only behavior verified from repository configuration.
> Do not turn aspirational features into current claims.
>
> **Drift check**: `git diff --stat d9a206c6..HEAD -- README.md .github/CONTRIBUTING.md AGENTS.md package.json .env.example .github/workflows/ci.yml`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/001-enforce-ci-typecheck.md`
- **Category**: docs
- **Planned at**: commit `d9a206c6`, 2026-07-04

## Why this matters

The README advertises a nonexistent `pnpm lint` script, contributor docs claim CI checks that it
currently does not, and several feature bullets blur shipped and planned behavior. Incorrect setup
documentation costs contributors time and makes security/quality promises harder to trust.

## Current state

- `README.md:152-179` lists `pnpm lint`; `package.json` defines only `lint:fix` while CI invokes
  `vp run lint` directly.
- `.github/CONTRIBUTING.md:416` says CI checks lint, typecheck, build, and tests. Re-check after plan 001.
- `README.md:74-83` presents real-time updates and dashboard analytics as current while localization
  alone says “coming soon”; repository evidence for live/analytics delivery is incomplete.
- `.env.example:15-16` and `AGENTS.md:156` disagree on the redirect variable suffix (`URL` vs `URI`).
  Determine the framework-consumed name from code/generated Nuxt configuration before editing.
- Markdown style uses active voice, wrapped prose, and exact fenced commands.

## Commands you will need

| Purpose        | Command                                                                                              | Expected                              |
| -------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Manifest check | `node -e "const p=require('./package.json'); console.log(Object.keys(p.scripts).sort().join('\n'))"` | authoritative script list             |
| Format/lint    | `pnpm lint:fix`                                                                                      | exit 0; only docs formatting expected |
| Full gates     | Commands in `plans/README.md`                                                                        | all pass                              |

## Suggested executor toolkit

Use the `document-writer` skill if available. Use `nuxt` only to verify configuration naming.

## Scope

**In scope**: `README.md`, `.github/CONTRIBUTING.md`, `.env.example`, and `AGENTS.md` only for
verified command/environment corrections. `package.json` only if the maintainer chooses to add a
read-only `lint` alias rather than remove the documented command.

**Out of scope**: implementing advertised features, changing secrets, rewriting legal pages,
reorganizing the whole README, or editing generated/skill instruction copies.

## Git workflow

- Branch: `codex/010-docs-accuracy`
- Commit: `docs: align setup and verification commands`

## Steps

### Step 1: Build an authoritative command/capability checklist

Compare package scripts, CI jobs after plan 001, runtime configuration, route/page inventory, and
README claims. Mark each claim shipped, planned, or unsupported. Prefer correcting docs over adding
scripts, unless a read-only `lint` alias is clearly part of the intended contributor workflow.

**Verify**: every documented `pnpm <script>` appears in `package.json`.

### Step 2: Correct setup and verification prose

Align README and CONTRIBUTING command lists with package scripts and CI. Correct the OAuth redirect
variable only after verifying the actual Nuxt/Auth Utils mapping. Keep examples free of real secrets.

**Verify**: `rg -n "pnpm lint\b|REDIRECT_(URL|URI)|typecheck" README.md .github/CONTRIBUTING.md AGENTS.md .env.example` → consistent results.

### Step 3: Separate shipped features from roadmap ideas

Reword unsupported real-time, analytics, and localization claims as roadmap statements or remove them.
Do not invent dates. Preserve the verified guild management, OAuth, accessibility, and audit features.

**Verify**: a repository search supports every remaining present-tense feature claim.

### Step 4: Run formatting and shared gates

Run `pnpm lint:fix`, inspect the diff for unrelated formatting, then complete shared gates.

## Test plan

No new application test. Machine-check command references against `package.json`; run markdown/design
lint already included by repository tooling. Links and localhost ports must match current config.

## Done criteria

- [ ] Every documented package command exists.
- [ ] CI documentation matches jobs after plan 001.
- [ ] OAuth environment variable naming is consistent and verified.
- [ ] Shipped and planned features are clearly separated.
- [ ] Shared final gates pass.

## STOP conditions

- The redirect variable is consumed only through undocumented framework magic and cannot be verified.
- Maintainers must decide whether a feature is already shipped.
- Correcting docs would require changing runtime behavior.

## Maintenance notes

Update command tables and feature status in the same PR as manifest/workflow changes. Reviewer should
run commands rather than trusting names copied from older docs.

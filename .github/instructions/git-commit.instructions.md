---
applyTo: '**'
---

## Quick Instruction: Commit Convention + commitlint ✅

Purpose: provide a clear and verifiable rule-set for commit messages (Conventional Commits) and how to validate them using `commitlint`.

### Essential Rules 🔧

- Required format: `type(scope): subject`
- Allowed types: **feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, types**
- `scope` must be **lowercase**; `subject` must be **lowercase**, imperative, **no trailing period**, **no !**
- First line (subject) ≤ 100 characters; optional body for details and breaking changes.

Valid examples:

- `feat(auth): implement Discord login`
- `fix(api): handle 500 error when guild missing`

Invalid examples:

- `Add feature` (missing type)
- `feat: Add feature` (subject not lowercase)
- `feat!: breaking change` (exclamation mark not allowed)

---

### Branch Naming (recommended) 🌿

- `feat/<scope>/<short-desc>`
- `fix/<scope>/<short-desc>`

Example: `fix/api/fix-guild-list-pagination`

---

### Local Checks (how to use `commitlint`) ⚙️

- Validate the last commit:
  - `pnpm commitlint --from HEAD~1 --to HEAD --verbose`
- Validate a message before committing:
  - `echo "feat(api): add endpoint X" | pnpm commitlint`

> Note: do not use `--no-verify` except in emergencies (it bypasses CI/hooks).

---

### Recommended PR template (paste into the PR body) 📋

Use this compact template for behavior or documentation changes.

**Commit / PR (suggested) 🔖**

- Branch: `fix/<scope>/<short-desc>` (e.g. `fix/docs/update-examples`)
- Commit (Conventional): `docs: update commitlint instructions`
- PR title: `docs: update commitlint instructions`

**What I changed — short (3–6 bullets) 🔧**

- Updated `\.github/instructions/git-commit.instructions.md` with the commit convention
- Added valid/invalid examples and verification commands
- Added a recommended PR template for consistent descriptions

**How to verify — quick steps 🔎**

1. Automated checks:
   - `pnpm lint` → no errors
   - `pnpm typecheck` → no errors
   - `echo "feat(example): test" | pnpm commitlint --verbose` → pass
2. Manual:
   - Open `\.github/instructions/git-commit.instructions.md` and verify examples/commands

**Impact**: `documentation-only`

**PR checklist ✅**

- [ ] Commits follow Conventional Commits
- [ ] Documentation updated (`.github/instructions/...`)
- [ ] Run: `pnpm lint`, `pnpm typecheck`, `pnpm build`

---

If you want, I can: 1) create a suggested local branch (won't commit/push), 2) prepare PR text ready to paste into GitHub, or 3) open a draft PR if you authorize me to proceed (I'll explain the commands).

---

## Quick guide: commit convention + commitlint ✅

Purpose: a minimal, actionable rule-set for commit messages (Conventional Commits) and how to validate them with `commitlint`. Paste this into `.github/instructions/git-commit.instructions.md` or link it from CONTRIBUTING.

### Essential rules 🔧

- Required format: `type(scope): subject`
- Allowed types: **feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, types**
- `scope` must be **lowercase**; `subject` must be **lowercase**, imperative, **no trailing period**, **no !**
- Short summary (first line) ≤ 100 characters; optional body for details and breaking changes.

Valid examples:

- `feat(auth): implement Discord login`
- `fix(api): handle 500 error when guild missing`

Invalid examples:

- `Add feature` (missing type)
- `feat: Add feature` (subject not lowercase)
- `feat!: breaking change` (exclamation mark not allowed)

---

### Branch naming (recommended) 🌿

- `feat/<scope>/<short-desc>`
- `fix/<scope>/<short-desc>`

Example: `fix/api/fix-guild-list-pagination`

---

### Local checks (how to use `commitlint`) ⚙️

- Validate the last commit:
  - `pnpm commitlint --from HEAD~1 --to HEAD --verbose`
- Validate a message before committing:
  - `echo "feat(api): add endpoint X" | pnpm commitlint`

> Note: do not use `--no-verify` except in emergencies (it bypasses CI/hooks).

---

### Recommended PR template (paste into PR body) 📋

Use this compact template for behavior or docs changes.

**Commit / PR (suggested) 🔖**

- Branch: `fix/<scope>/<short-desc>` (e.g. `fix/docs/update-examples`)
- Commit (Conventional): `docs: update commitlint instructions`
- PR title: `docs: update commitlint instructions`

**What I changed — short (3–6 bullets) 🔧**

- Updated `\.github/instructions/git-commit.instructions.md` with commit conventions
- Added valid/invalid examples and verification commands
- Added a recommended PR template for consistent descriptions

**How to verify — quick steps 🔎**

1. Automated checks:
   - `pnpm lint` → no errors
   - `pnpm typecheck` → no errors
   - `echo "feat(example): test" | pnpm commitlint --verbose` → pass
2. Manual:
   - Open `\.github/instructions/git-commit.instructions.md` and verify examples/commands

**Impact**: `documentation-only`

**PR checklist ✅**

- [ ] Commits follow Conventional Commits
- [ ] Documentation updated (`.github/instructions/...`)
- [ ] Run: `pnpm lint`, `pnpm typecheck`, `pnpm build`

---

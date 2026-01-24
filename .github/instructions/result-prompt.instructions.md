---
applyTo: '**'
---

## Result template to include in PRs / change responses 📣

Use this template whenever you report an important code or documentation change. Copy-paste it into the PR body or store it under `\.github\/instructions` as a project rule.

---

### 1) Commit / PR (suggested) 🔖

- Branch: `fix/<scope>/<short-desc>` (e.g. `fix/docs/update-examples`)
- Commit (Conventional): `docs: update examples for clarity`
- PR title: `docs: update examples for clarity`
- PR description (short):
  - **What**: short, clear summary of the change (one line).
  - **Why**: why this change was necessary (one line).
  - **Impact**: `documentation-only` OR `code change` (state clearly).
  - **Verification**: short checklist or link to verification steps below.

---

### 2) What I changed 🔧

- Short, itemized list (3–6 bullets). Example placeholders:
  - Updated `README.md` examples for the authentication flow.
  - Added `docs/examples/auth-quickstart.md` with runnable snippets.
  - Small copy edits for clarity in `CONTRIBUTING.md`.
  - No runtime code changes (documentation-only).

---

### 3) How to verify (quick steps) 🔎

- Content checks (quick):
  - `git grep -n "examples/auth-quickstart.md" || true` — expected: file present
  - `git grep -n "Login with Discord" README.md || true` — expected: updated snippet
- Lint / build / typecheck:
  - `pnpm lint:fix && pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`
  - Expected: no blocking errors; CI remains green
- Manual verification:
  - Open `docs/examples/auth-quickstart.md` and run the provided curl/command — output should match documented response
- Final gate before merge:
  - MCP ESLint reports **zero errors** (if applicable)
  - All CI checks pass

---

### PR checklist (include in the PR description) ✅

- [ ] Commits follow Conventional Commits
- [ ] Related documentation updated
- [ ] Run: `pnpm lint`, `pnpm typecheck`, `pnpm build`
- [ ] No breaking changes
- [ ] Suggested reviewers: `docs` + `dev-ops`

---

## Guideline — how to write the result message (brief & required) 🧭

This section defines **how** the result message that accompanies any relevant change (PR, fix, doc update) must be written. Follow these rules for consistency, fast review, and easy verification.

### Required structure (use exactly this order)

1. **Commit / PR** — branch + commit (Conventional), short PR title. ✅
2. **What changed** — 3–6 concrete bullet points, reference files using `backticks`. 🔧
3. **How to verify** — commands + quick steps with expected outcome (1–2 lines per step). 🔎

### Style rules (must)

- Language: English, impersonal tone, concise (2–4 sentences per section).
- Format: use headings and bullet lists; wrap `files`, `commands`, and `symbols` in backticks.
- Length: final response ≈ 80–200 words; for very small changes ≤ 3 sentences.
- Mandatory verifications to include: `pnpm lint`, `pnpm typecheck`, `pnpm build`, and MCP ESLint status (if applicable).
- Always state whether the change is **documentation-only** or a **code change**.

### What to avoid

- Vague responses without verification steps.
- Large inline code blocks (attach files or link to PR files instead).
- Promotional or non-technical language.

### Minimal example (copy & adapt)

- Commit/PR: `docs: prefer BrowserMCP as primary` — branch `fix/docs/prefer-browsermcp`
- What I changed: updated examples in `\.github/agents/wolfstar-dev-agent.md` to use `mcp_browsermcp_*`.
- How to verify: `git grep -n "mcp_browsermcp_"` → expected results; `pnpm lint && pnpm build` → no errors.

### Invalid example (avoid)

- "I updated the docs, should be fine." — lacks commit, files, and verification steps.

---

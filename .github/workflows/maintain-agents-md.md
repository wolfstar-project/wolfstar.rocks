---
# Run weekly to keep AGENTS.md accurate and current
on:
    schedule: weekly on monday
    workflow_dispatch:

# Read access to repo content and pull requests; writes go through safe-outputs
permissions:
    contents: read
    pull-requests: read
    issues: read

# AI engine
engine: claude

# GitHub API toolsets needed for reading PRs and repo content
tools:
    github:
        toolsets: [default, pull_requests, repos]

# Network access
network: defaults

# Open a PR with updated AGENTS.md content
safe-outputs:
    create-pull-request:
        allowed-files:
            - AGENTS.md
---

# Maintain AGENTS.md

Keep the `AGENTS.md` file accurate and current by reviewing recent merged pull requests and changed source files, then opening a pull request with any necessary updates.

## Context

`AGENTS.md` is the primary instruction file for AI coding agents working in this repository. It describes the tech stack, code quality requirements, naming conventions, API patterns, component patterns, development commands, and other guidelines that agents must follow.

The repository is a **Nuxt 4 full-stack dashboard** for the WolfStar Discord moderation bot and Staryl social notifications bot, built with Vue 3, TypeScript, Prisma, and PostgreSQL.

## Task

1. **Determine the review window**: Use the last-run date from cache memory (or 7 days ago if this is the first run) to define the period to review.

2. **Collect merged pull requests**: List all pull requests merged into `main` since the review window opened. For each PR, note the title, description, and which files were changed.

3. **Identify relevant changes**: Focus on PRs and file changes that affect:
    - Project architecture or technology choices
    - New or removed npm packages / major dependency upgrades
    - New API route patterns, composables, or utilities introduced as reusable patterns
    - Changes to the Prisma schema or database migration conventions
    - Changes to the audit logging system (`shared/audit/`, `server/utils/audit/`)
    - Changes to the auth module (`modules/auth/`)
    - New test utilities or testing conventions
    - Updates to build or lint configuration
    - New Vue component patterns or design token conventions
    - Changes to the view-transition system
    - Additions or removals from the design-token allow-list
    - New development commands added to `package.json`

4. **Compare against AGENTS.md**: Read the current `AGENTS.md` and check whether each relevant change is already reflected. Look for:
    - Outdated instructions that contradict recent code patterns
    - Missing patterns that are now established in the codebase
    - Stale file references (e.g., files that were moved or renamed)
    - Missing or incorrect development commands
    - Action creators in `shared/audit/actions.ts` that aren't listed in the Audit Logging table

5. **Update AGENTS.md**: If there are gaps or inaccuracies, produce an updated `AGENTS.md` that:
    - Keeps all existing accurate content intact
    - Adds new sections or table rows for newly established patterns
    - Corrects or removes outdated instructions
    - Follows the same formatting style (markdown tables, code blocks, etc.)

6. **Open a pull request**: If any changes are needed, create a pull request targeting `main` with:
    - Title: `chore(docs): update AGENTS.md to reflect recent changes`
    - Body summarising what changed and why, referencing the relevant merged PRs by number

7. **Noop if nothing changed**: If `AGENTS.md` is already accurate and current, emit a `noop` with a brief explanation.

## Safe Outputs

- Use `create-pull-request` to open a PR when AGENTS.md needs updating.
- Use `noop` with a short explanation when no changes are needed.

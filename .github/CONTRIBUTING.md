# Contributing to WolfStar.rocks

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

> **Important**
> Please be respectful and constructive in all interactions. We aim to maintain a welcoming environment for all contributors.
> [Read our Code of Conduct](./CODE_OF_CONDUCT.md)

## Goals

The goal of [WolfStar.rocks](https://wolfstar.rocks) is to build a fast, modern, and open-source dashboard for **WolfStar** (Discord moderation bot) and **Staryl** (social notifications bot), prioritizing speed, usability, and a community-driven developer experience.

### Core values

- Speed and performance
- Type safety and code quality
- Accessibility and inclusive design

### Target audience

WolfStar.rocks is built for Discord server administrators and bot users who need a clean, efficient interface to manage their guilds and bot settings.

## Table of Contents

- [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
- [Development workflow](#development-workflow)
    - [Available commands](#available-commands)
    - [GitHub Actions security analysis](#github-actions-security-analysis)
    - [Clearing caches during development](#clearing-caches-during-development)
    - [Project structure](#project-structure)
- [Code style](#code-style)
    - [TypeScript](#typescript)
    - [Server API patterns](#server-api-patterns)
    - [Import order](#import-order)
    - [Naming conventions](#naming-conventions)
    - [Vue components](#vue-components)
    - [Database changes](#database-changes)
- [Testing](#testing)
    - [Unit tests](#unit-tests)
    - [Nuxt component tests](#nuxt-component-tests)
    - [Lighthouse accessibility tests](#lighthouse-accessibility-tests)
    - [Lighthouse performance tests](#lighthouse-performance-tests)
    - [End-to-end tests](#end-to-end-tests)
- [Storybook](#storybook)
- [Submitting changes](#submitting-changes)
    - [Before submitting](#before-submitting)
    - [Pull request process](#pull-request-process)
    - [Commit messages and PR titles](#commit-messages-and-pr-titles)
    - [PR descriptions](#pr-descriptions)
- [Pre-commit hooks](#pre-commit-hooks)
- [Using AI](#using-ai)
- [Questions](#questions)
- [License](#license)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 24+ (LTS)
- [pnpm](https://pnpm.io/) 10+ (required - not npm or yarn)
- [PostgreSQL](https://www.postgresql.org/) 14+
- [Discord Application](https://discord.com/developers/applications/) (for OAuth)

### Setup

1. Fork and clone the repository

    ```bash
    git clone https://github.com/wolfstar-project/wolfstar.rocks.git
    cd wolfstar.rocks
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Set up environment variables

    Copy `.env.example` to `.env` and configure:

    ```bash
    cp .env.example .env
    ```

    Required variables:
    - `DATABASE_URL` - PostgreSQL connection string
    - `NUXT_OAUTH_DISCORD_CLIENT_ID` - Discord OAuth client ID
    - `NUXT_OAUTH_DISCORD_CLIENT_SECRET` - Discord OAuth client secret
    - `NUXT_BETTER_AUTH_SECRET` - Random 32+ character string

4. Set up the database:

    ```bash
    pnpm prisma:push          # Sync schema to database
    pnpm prisma:seed          # Seed with test data (optional)
    ```

5. Start the development server:

    ```bash
    pnpm dev                  # Runs on http://localhost:3000
    ```

## Development workflow

### Available commands

```bash
# Development
pnpm dev              # Start development server
pnpm dev:pwa          # Development server with local PWA behavior
pnpm build            # Production build
pnpm preview          # Preview production build (requires build first)

# Code Quality
pnpm lint:fix         # Run linter and auto-fix issues (oxlint + oxfmt)
pnpm typecheck        # TypeScript type checking
pnpm vp run zizmor    # GitHub Actions security analysis (see below)
pnpm vp run zizmor:fix  # Auto-fix zizmor audit findings

# Storybook
pnpm storybook        # Start Storybook dev server (http://localhost:6006)
pnpm build-storybook  # Build static Storybook output
pnpm chromatic        # Publish Storybook to Chromatic for visual review

# Testing
pnpm test             # Run all Vitest tests
pnpm test:unit        # Unit tests only
pnpm test:nuxt        # Nuxt component tests
pnpm test:browser     # Playwright E2E tests (builds test app first)
pnpm test:browser:ui  # E2E tests with Playwright UI
pnpm test:a11y        # Build test app, then run Lighthouse a11y in dark + light
pnpm test:a11y:prebuilt  # Lighthouse accessibility audits (requires prebuilt app)
pnpm test:perf        # Build test app, then run Lighthouse performance audits
pnpm test:perf:prebuilt  # Lighthouse performance audits (requires prebuilt app)

# Database
pnpm prisma:push      # Push schema changes (development)
pnpm prisma:migrate:dev   # Create and apply migration
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:studio    # Visual database editor (http://localhost:5555)
```

### GitHub Actions security analysis

CI runs [zizmor](https://docs.zizmor.sh/) against the repository's GitHub Actions workflows. The shared policy lives in `.github/zizmor.yml`, and the `zizmor` task uses the same pedantic persona as CI.

You may run it locally by [installing `zizmor`](https://docs.zizmor.sh/installation/) and running:

```bash
pnpm vp run zizmor
```

Some audits resolve action refs and vulnerability metadata through GitHub. To run those online checks locally, authenticate with the GitHub CLI and pass its token:

```bash
GH_TOKEN="$(gh auth token)" pnpm vp run zizmor
```

To fix audit findings automatically, run:

```bash
GH_TOKEN="$(gh auth token)" pnpm vp run zizmor:fix
```

### Clearing caches during development

Nitro persists `defineWrappedCachedResponseHandler` results to disk at `.nuxt/cache/nitro/`. This cache **survives dev server restarts**. If you're iterating on a cached API route and want fresh results, delete the relevant cache directory:

```bash
# Clear all Nitro handler caches
rm -rf .nuxt/cache/nitro/handlers/

# Clear a specific handler cache (example: guild activity log)
rm -rf .nuxt/cache/nitro/handlers/guilds-activity/
```

Alternatively, you can bypass the cache entirely in development by adding `shouldBypassCache: () => import.meta.dev` to your cached handler options:

```typescript
export default defineWrappedCachedResponseHandler(
	async (event) => {
		// ...
	},
	{
		maxAge: 60 * 5,
		shouldBypassCache: () => import.meta.dev,
	},
);
```

### Project structure

```text
app/                            # Nuxt 4 app directory
├── components/                 # Vue components (PascalCase.vue)
├── composables/                # Vue composables (useFeature.ts)
├── layouts/                    # Page layouts (default, dashboard)
├── pages/                      # File-based routing
├── plugins/                    # Nuxt plugins
├── themes/                     # UI theme configurations
├── utils/                      # Frontend utilities
├── app.vue                     # Root component
└── error.vue                   # Error page

server/                         # Nitro server
├── api/                        # API routes (auto-registered)
│   ├── auth/                   # Auth endpoints
│   ├── guilds/                 # Guild endpoints
│   └── users/                  # User endpoints
├── database/                   # Prisma schema, migrations, client
├── plugins/                    # Server plugins
└── utils/                      # Server utilities

shared/                         # Shared between app and server
├── schemas/                    # Validation schemas
├── types/                      # TypeScript type definitions
└── utils/                      # Shared utilities (logger, abilities)

modules/                        # Custom Nuxt modules
.storybook/                     # Storybook configuration
test/                           # Tests
├── unit/                       # Vitest unit tests (*.spec.ts)
├── nuxt/                       # Nuxt component tests
├── e2e/                        # Playwright E2E tests
├── fixtures/                   # Test fixture data
└── mocks/                      # Test mocks
```

> **Tip**
> For more about Nuxt directory conventions, check the [Nuxt directory structure docs](https://nuxt.com/docs/4.x/directory-structure).

## Code style

When committing changes, try to keep an eye out for unintended formatting updates. These can make a pull request look noisier than it really is and slow down the review process.

The project uses `oxfmt` to handle formatting via a pre-commit hook. The hook will automatically reformat files when needed. If you want to get ahead of any formatting issues, run `pnpm lint:fix` before committing.

### TypeScript

- We care about good types -- never cast things to `any`
- Use strict mode and validate rather than just assert
- Type all props, emits, and function signatures

### Server API patterns

Always use `defineWrappedResponseHandler` (or `defineWrappedCachedResponseHandler` for cached responses). This provides auth, rate limiting, and consistent error handling:

```typescript
export default defineWrappedResponseHandler(
	async (event) => {
		// handler logic...
	},
	{
		auth: true,
		rateLimit: {
			enabled: true,
			window: 10000,
			limit: 5,
		},
	},
);
```

Validate query strings and request bodies with shared Valibot schemas from `shared/schemas/` via `getValidatedQuery(event, (body) => parse(Schema, body))`.

Use `createError` for error responses with proper status codes. Use the `onError` callback for error logging.

### Import order

`oxfmt` (`experimentalSortImports` in `vite.config.ts`) sorts imports into the following groups, with no blank lines between them:

1. External type imports (`import type { ... } from "h3"`)
2. Internal type imports (`import type { ... } from "#shared/..."`)
3. Node.js built-ins (`node:crypto`, `node:path`)
4. External packages
5. Internal aliases (`#shared/`, `#server/`, `@/`, `~/`)
6. Relative imports (`./`, `../`)

```typescript
import type { H3Event } from "h3";
import type { GuildSettings } from "#shared/types";
import { createHash } from "node:crypto";
import { parse } from "valibot";
import { GuildSettingsSchema } from "#shared/schemas/guild-settings";
import { resolveMember } from "./resolve-members";
```

### Naming conventions

| Type             | Convention             | Example                    |
| ---------------- | ---------------------- | -------------------------- |
| Vue components   | PascalCase             | `GuildSettings.vue`        |
| Pages            | kebab-case             | `commands.vue`             |
| Composables      | camelCase + use prefix | `useGuildSettings.ts`      |
| Server routes    | kebab-case + method    | `guild-settings.get.ts`    |
| Functions        | camelCase              | `fetchGuild`, `formatDate` |
| Constants        | SCREAMING_SNAKE_CASE   | `API_BASE_URL`             |
| Types/Interfaces | PascalCase             | `GuildSettings`            |
| Directories      | kebab-case             | `guild-settings/`          |

### Vue components

- Use Composition API with `<script setup lang="ts">`
- Define props with TypeScript: `defineProps<{ text: string }>()`
- Keep functions under 50 lines
- Lean on Nuxt auto-imports instead of manual Vue/Nuxt imports
- Accessibility is a first-class consideration — prefer semantic HTML and native elements first; add ARIA only when needed, and always ensure correct accessible name/role/value and full keyboard support

Block order (enforced by oxlint & oxfmt):

1. `<template>`
2. `<script>` (if needed)
3. `<script setup lang="ts">`
4. `<style>`
5. `<style scoped>`

### Database changes

**For prototyping** (development only), use `pnpm prisma:push` to push schema changes without creating a migration.

**For production-ready changes**, use `pnpm prisma:migrate:dev` to create and apply a migration, then `pnpm prisma:generate` to regenerate the Prisma client after schema edits.

Always commit migration files with descriptive names. See [Available commands](#available-commands) for the full Prisma script list.

## Testing

### Unit tests

Write unit tests for core functionality using Vitest:

```typescript
import { describe, it, expect } from "vitest";

describe("featureName", () => {
	it("should handle expected case", () => {
		expect(result).toBe(expected);
	});
});
```

> **Tip**
> If you need access to the Nuxt context in your test, place your test in the `test/nuxt/` directory and run with `pnpm test:nuxt`.

### Nuxt component tests

Component tests that require Nuxt context (composables, auto-imports, plugins) live in `test/nuxt/`. These run with `@nuxt/test-utils` and have access to the full Nuxt environment.

### Lighthouse accessibility tests

Accessibility audits run against a test build using Lighthouse. The suite runs in both dark and light color modes:

```bash
pnpm test:a11y              # Build test app, then audit dark + light themes
pnpm test:a11y:prebuilt     # Run audits only (app must already be built)
```

Use `test:a11y:prebuilt` when iterating on audit fixes and you already have a current test build.

### Lighthouse performance tests

Performance audits (including CLS checks) run against a test build:

```bash
pnpm test:perf              # Build test app, then run performance audits
pnpm test:perf:prebuilt     # Run audits only (app must already be built)
```

Use `test:perf:prebuilt` for faster iteration when the test build is already up to date.

### End-to-end tests

Write end-to-end tests using Playwright:

```bash
pnpm test:browser        # Run tests
pnpm test:browser:ui     # Run with Playwright UI
```

Make sure to read about [Playwright best practices](https://playwright.dev/docs/best-practices) and prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`) over selectors based on classes or IDs.

## Storybook

Stories are co-located with pages as `*.stories.ts` files under `app/pages/`. Storybook configuration lives in `.storybook/`.

```bash
pnpm storybook          # Dev server at http://localhost:6006 (sets STORYBOOK=true)
pnpm build-storybook    # Static Storybook build
pnpm chromatic          # Visual review via Chromatic
```

The hosted Storybook is published at [storybook.wolfstar.rocks](https://storybook.wolfstar.rocks). Storybook runs with `STORYBOOK=true` so Nuxt loads a Storybook-specific config without the full app shell.

When adding or changing user-facing pages, include or update stories so reviewers can exercise states and variants without running the full dashboard.

## Submitting changes

### Before submitting

1. Ensure your code follows the style guidelines
2. Run linting: `pnpm lint:fix`
3. Run type checking: `pnpm typecheck`
4. Run tests: `pnpm test`
5. Validate the build: `pnpm build`
6. Write or update tests for your changes

### Pull request process

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Push your branch and open a pull request
4. Ensure CI checks pass (lint, typecheck, build, and tests)
5. Request review from maintainers

### Commit messages and PR titles

Write clear, concise PR titles that explain the "why" behind changes.

We use [Conventional Commits](https://www.conventionalcommits.org/). Since we squash on merge, the PR title becomes the commit message in `main`, so it is important to get it right.

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `types`

Scopes (optional): `auth`, `api`, `guild`, `ui`, `db`, `deps`

Examples:

- `feat(auth): implement Discord OAuth2 flow`
- `fix(api): resolve guild data fetching issue`
- `docs: update installation instructions`
- `chore(deps): update nuxt to v4`

Where frontend changes are made, please include before and after screenshots in your pull request description.

> **Note**
> Use lowercase letters in your pull request title. Individual commit messages within your PR don't need to follow this format since they'll be squashed.

### PR descriptions

If your pull request directly addresses an open issue, use the following inside your PR description:

```text
Fixes #123
```

or

```text
Closes https://github.com/wolfstar-project/wolfstar.rocks/issues/123
```

This links the pull request to the issue and automatically closes it when the PR is merged.

## Pre-commit hooks

Git hooks are managed via the `.vite-hooks/` directory. The `pre-commit` hook runs `pnpm vp staged` to automatically lint and format staged files before a commit. Commit messages are validated against the Conventional Commits format by the configured Git hooks.

## Using AI

You're welcome to use AI tools to help you contribute. But there are two important ground rules:

### 1. Never let an LLM speak for you

When you write a comment, issue, or PR description, use your own words. Grammar and spelling don't matter -- real connection does. AI-generated summaries tend to be long-winded, dense, and often inaccurate. The goal is not to sound impressive, but to communicate clearly.

### 2. Never let an LLM think for you

Feel free to use AI to write code, tests, or point you in the right direction. But always understand what it has written before contributing it. Take personal responsibility for your contributions. Don't say "ChatGPT says..." -- tell us what you think.

For more context, see [Using AI in open source](https://roe.dev/blog/using-ai-in-open-source).

## Questions?

If you have questions or need help, feel free to [open an issue](https://github.com/wolfstar-project/wolfstar.rocks/issues) for discussion.

## License

By contributing to WolfStar.rocks, you agree that your contributions will be licensed under the [Apache License 2.0](../LICENSE.md).

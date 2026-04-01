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
    - [Project structure](#project-structure)
- [Code style](#code-style)
    - [TypeScript](#typescript)
    - [Server API patterns](#server-api-patterns)
    - [Naming conventions](#naming-conventions)
    - [Vue components](#vue-components)
    - [Database changes](#database-changes)
- [Testing](#testing)
    - [Unit tests](#unit-tests)
    - [Nuxt component tests](#nuxt-component-tests)
    - [End-to-end tests](#end-to-end-tests)
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
    - `NUXT_SESSION_PASSWORD` - Random 32+ character string

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
pnpm build            # Production build
pnpm preview          # Preview production build (requires build first)

# Code Quality
pnpm vp lint          # Run linter (oxlint + oxfmt)
pnpm lint:fix         # Auto-fix lint issues
pnpm typecheck        # TypeScript type checking
pnpm vp fmt           # Format all files with oxfmt

# Testing
pnpm test             # Run all Vitest tests
pnpm test:unit        # Unit tests only
pnpm test:nuxt        # Nuxt component tests
pnpm test:browser     # Playwright E2E tests
pnpm test:browser:ui  # E2E tests with Playwright UI
pnpm test:a11y        # Lighthouse accessibility audits
pnpm test:perf        # Lighthouse performance audits

# Database
pnpm prisma:push      # Push schema changes (development)
pnpm prisma:migrate:dev   # Create and apply migration
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:studio    # Visual database editor (http://localhost:5555)
pnpm prisma validate  # Validate schema
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
// server/api/guilds/[guild]/settings.get.ts
export default defineWrappedResponseHandler(
	async (event) => {
		const guildId = getRouterParam(event, "guild");

		const settings = await prisma.guild.findUnique({
			where: { id: guildId },
		});

		return settings;
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

Use `createError` for error responses with proper status codes. Use the `onError` callback for error logging.

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

**For prototyping** (development only):

```bash
pnpm prisma:push          # Push schema changes without migration
```

**For production-ready changes**:

```bash
pnpm prisma:migrate:dev   # Create and apply migration
pnpm prisma:generate      # Regenerate Prisma client after schema edits
```

Always commit migration files with descriptive names.

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

### End-to-end tests

Write end-to-end tests using Playwright:

```bash
pnpm test:browser        # Run tests
pnpm test:browser:ui     # Run with Playwright UI
```

Make sure to read about [Playwright best practices](https://playwright.dev/docs/best-practices) and prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`) over selectors based on classes or IDs.

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
4. Ensure CI checks pass (lint, typecheck, build, tests)
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

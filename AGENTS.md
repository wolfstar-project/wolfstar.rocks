# WolfStar.rocks Project Rules & Conventions

> **Comprehensive guide for AI-assisted development on the WolfStar.rocks dashboard project**

This document outlines the established project norms, conventions, and best practices for the WolfStar.rocks dashboard project. It serves as the authoritative reference for all development activities.

WolfStar.rocks is a modern Nuxt 4 full-stack web application serving as the official dashboard for **WolfStar** (Discord moderation bot) and **Staryl** (social notifications bot). Built with Vue 3, TypeScript, Prisma, and PostgreSQL, featuring Discord OAuth2 authentication and comprehensive guild management.

**⚠️ ALWAYS reference these instructions first and fallback to search or documentation queries only when you encounter unexpected information that does not match the info here.**

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Project Overview](#project-overview)
- [AI Development Tools](#ai-development-tools)
- [Development Commands](#development-commands)
- [Quality Assurance & Pre-commit Checklist](#quality-assurance--pre-commit-checklist)
- [Development Workflows](#development-workflows)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Development Patterns](#core-development-patterns)
- [Code Style & Formatting](#code-style--formatting)
- [Vue.js Conventions](#vuejs-conventions)
- [TypeScript Guidelines](#typescript-guidelines)
- [API Development](#api-development)
- [Database Conventions](#database-conventions)
- [Styling Guidelines](#styling-guidelines)
- [Security Practices](#security-practices)
- [Performance Standards](#performance-standards)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Common Gotchas](#common-gotchas)
- [Troubleshooting](#troubleshooting)
- [DevOps & Deployment](#devops--deployment)
- [Documentation Standards](#documentation-standards)

---

## Quick Reference

### Most Used Commands

```bash
# Daily development
pnpm dev                        # Start dev server
pnpm lint:fix                   # Fix linting issues
pnpm typecheck                  # Check types

# Database work
pnpm prisma:studio              # Visual database editor
pnpm prisma:push                # Quick schema sync
pnpm prisma:migrate:dev         # Create migration

# Before committing
pnpm build                      # Validate build
pnpm lint                       # Check for errors
pnpm commitlint --from HEAD~1 --to HEAD --verbose  # Validate commit
```

### Important Paths

| Path                            | Description              |
| ------------------------------- | ------------------------ |
| `app/pages/`                    | File-based routing pages |
| `app/components/`               | Vue components           |
| `server/api/`                   | API endpoints            |
| `server/database/schema.prisma` | Database schema          |
| `server/utils/`                 | Server utilities         |
| `.github/workflows/`            | CI/CD pipelines          |

### Key Files

| File                      | Purpose                       |
| ------------------------- | ----------------------------- |
| `nuxt.config.ts`          | Nuxt configuration            |
| `tailwind.config.ts`      | TailwindCSS configuration     |
| `tsconfig.json`           | TypeScript configuration      |
| `.commitlintrc.json`      | Commit message rules          |
| `eslint.config.js`        | Linting rules                 |
| `sentry.client.config.ts` | Sentry client configuration   |
| `sentry.server.config.ts` | Sentry server configuration   |
| `package.json`            | Dependencies and scripts      |
| `.env`                    | Environment variables (local) |

---

## Project Overview

**Project Name**: WolfStar.rocks Dashboard
**Version**: 2.0.0
**License**: Apache-2.0
**Description**: Official web dashboard for WolfStar, a powerful multi-purpose Discord bot

### Core Applications

- **WolfStar**: Primary Discord bot for moderation and logging
- **Staryl**: Social notifications bot for Twitch, Instagram, etc.

### Prerequisites

- **Node.js**: 22+ (LTS)
- **Package Manager**: pnpm (required, not npm or yarn)
- **Database**: PostgreSQL

### First Command

```bash
pnpm dev
# Development server starts on http://localhost:3000
# Cold start: ~30-60 seconds (normal behavior)
```

---

## AI Development Tools

### Recommended Tools for AI-Assisted Development

This project is optimized for AI-assisted development. The following tools are recommended for the best development experience:

#### Context7

**Purpose**: Access up-to-date documentation for libraries and frameworks

- **What it is**: Context7 provides real-time documentation access for all project dependencies
- **When to use**: When you need current API references, usage examples, or best practices
- **Benefits**:
  - Always up-to-date library documentation
  - Framework-specific patterns and conventions
  - API reference for dependencies

**Example libraries to query**:

- Nuxt 4 documentation
- Vue 3 Composition API
- Prisma ORM
- TailwindCSS and DaisyUI
- Discord API

#### MCP ESLint

**Purpose**: Real-time linting and code quality checks

- **What it is**: Model Context Protocol (MCP) server for ESLint integration
- **When to use**: Before committing code, during development, when fixing linting issues
- **Benefits**:
  - Real-time linting feedback
  - Automatic fix suggestions
  - Consistent code quality
  - Integration with project's ESLint configuration

**Usage**:

```bash
# The project uses @antfu/eslint-config
# MCP ESLint automatically uses the project's eslint.config.js
```

**Best Practices**:

1. ✅ Use Context7 when unsure about API usage or library patterns
2. ✅ Use MCP ESLint to validate code before committing
3. ✅ Reference AGENTS.md first, then use Context7 for library-specific details
4. ✅ Run `pnpm lint:fix` after MCP ESLint suggests fixes

---

## Development Commands

### Core Development

```bash
# Development server (hot reload enabled)
pnpm dev                        # Runs on http://localhost:3000
                                # Cold start: ~30-60 seconds
                                # Subsequent starts: ~5-10 seconds

# Production build (for deployment validation)
pnpm build                      # TIMEOUT: 120+ seconds
                                # First build: ~90-120 seconds
                                # Cached builds: ~45-60 seconds

# Production server (requires build first)
pnpm start                      # Runs on http://localhost:3000
                                # Must run 'pnpm build' before this command
```

**⚠️ CRITICAL - Build Timeouts:**

- Avoid canceling commands prematurely; cold starts can be slower
- Builds take ~45-60s normally; they may take longer on first run or when caches are cold
- For CI, prefer pragmatic timeouts (e.g., 20-30 minutes by default) and extend to ~60 minutes for cold/first-run builds
- Consider retries/backoff for transient failures

### Quality Assurance

```bash
# Linting (comprehensive check)
pnpm lint                       # Takes ~30 seconds
                                # Warnings expected, no errors allowed

# Linting with auto-fix
pnpm lint:fix                   # Automatically fixes fixable issues

# Type checking
pnpm typecheck                  # Takes ~22 seconds
                                # Must pass without errors

# Code formatting
pnpm format                     # Formats all files with Prettier

# Prisma validation
pnpm prisma:validate            # Takes ~1.5 seconds
                                # Validates schema consistency

# Commit message validation
pnpm commitlint --from HEAD~1 --to HEAD --verbose
                                # Validates last commit message
                                # Use before pushing commits
```

### Database Management

```bash
# Database visual editor (Prisma Studio)
pnpm prisma:studio              # Runs on http://localhost:5555
                                # Visual database browser

# Schema synchronization (development only)
pnpm prisma:push                # Push schema changes without migration
                                # Use for rapid prototyping

# Migration management
pnpm prisma:migrate:dev         # Create and apply migration
pnpm prisma:migrate:dev:create  # Create migration without applying
pnpm prisma:migrate:deploy      # Apply migrations (production)
pnpm prisma:migrate:status      # Check migration status
pnpm prisma:migrate:reset       # Reset database (⚠️ destructive)

# Client generation
pnpm prisma:generate            # Regenerate Prisma client
pnpm prisma:generate:watch      # Watch mode for schema changes
```

### Additional Tools

```bash
# Development with PWA support
pnpm dev:pwa                    # Dev server with PWA features enabled

# Preview deployment
pnpm preview                    # Preview NuxtHub deployment locally

# Database seeding
pnpm prisma:seed                # Seed database with test data
```

---

---

## Quality Assurance & Pre-commit Checklist

### Before Committing Changes

**ALWAYS run these commands in order:**

1. **Build Validation**

   ```bash
   pnpm build
   ```

   - ✅ Must build successfully without errors
   - ⏱️ Takes ~45-120 seconds (depending on cache state)
   - ❌ CI will fail if build fails

2. **Linting**

   ```bash
   pnpm lint
   ```

   - ✅ Fix any **errors** (mandatory)
   - ⚠️ Warnings are acceptable
   - 💡 Use `pnpm lint:fix` for auto-fixes
   - ❌ CI will fail if errors exist

3. **Type Checking** (Optional but Recommended)

   ```bash
   pnpm typecheck
   ```

   - ✅ Must pass without errors
   - ⏱️ Takes ~22 seconds
   - 💡 Catches TypeScript issues early

4. **Commit Message Validation**

   ```bash
   pnpm commitlint --from HEAD~1 --to HEAD --verbose
   ```

   - ✅ Validates commit message format
   - 📋 Must follow Conventional Commits standard
   - ❌ CI may reject improperly formatted commits

### Commit Message Format

**Standard**: Conventional Commits with commitlint

**Format**: `<type>(<scope>): <subject>`

**Allowed Types**:

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring without changing behavior
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or external dependency changes
- `ci` - CI/CD configuration changes
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverting previous commits
- `types` - TypeScript type definition updates

**Rules**:

- Scope must be **lowercase** (e.g., `auth`, `api`, `ui`)
- Subject must be **lowercase** and **imperative** mood
- No **exclamation marks** in subject
- No **period** at the end of subject

**Examples**:

```bash
# ✅ Good examples
feat: add user dashboard component
feat(auth): implement Discord OAuth2 flow
fix(api): resolve guild data fetching issue
docs: update installation instructions
style: format code with prettier
refactor(components): simplify button component logic
perf(database): optimize guild query performance
test(api): add unit tests for auth endpoints
ci: update GitHub Actions workflow

# ❌ Bad examples
Add feature                     # Missing type
feat: Add feature               # Subject not lowercase
feat!: breaking change          # Exclamation mark not allowed
fix(Auth): bug fix              # Scope not lowercase
feat: add feature.              # Period at end
update docs                     # Invalid type
```

### Automated Git Hooks with Husky

**Husky automatically enforces code quality on every commit**

The project uses **Husky v9+** with Git hooks to automatically validate commits before they are created. This ensures consistent code quality and commit message formatting across all contributors.

#### What Happens Automatically

When you run `git commit`, Husky automatically triggers:

1. **commit-msg hook** - Validates commit message format
   - Runs `commitlint` to check Conventional Commits format
   - Rejects commits with invalid messages
   - Ensures all commits follow project standards

2. **pre-commit hook** (via lint-staged) - Lints and formats staged files
   - Runs `eslint --fix` on staged `.js`, `.ts`, `.vue` files
   - Runs `prettier --write` on staged files
   - Only processes files that are staged for commit
   - Automatically fixes issues when possible

#### Configuration

**Husky hooks location**: `.husky/` directory

- `.husky/commit-msg` - Commit message validation
- `.husky/pre-commit` - Lint-staged execution

**lint-staged configuration**: `package.json`

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": "eslint --fix",
    "*.{js,ts,vue,json,md}": "prettier --write"
  }
}
```

#### Example Workflow

```bash
# 1. Stage your changes
git add .

# 2. Commit with proper message
git commit -m "feat(api): add new endpoint for guild settings"

# Husky automatically runs:
# → lint-staged (eslint + prettier on staged files)
# → commitlint (validates commit message)

# If everything passes:
# ✅ Commit created successfully

# If issues found:
# ❌ Commit rejected with error messages
# → Fix the issues and try again
```

#### Bypassing Hooks (Not Recommended)

In rare cases, you may need to bypass hooks:

```bash
# Skip all hooks (NOT RECOMMENDED)
git commit -m "message" --no-verify

# Or use the -n flag
git commit -m "message" -n
```

**⚠️ Warning**: Bypassing hooks can lead to:

- CI pipeline failures
- Inconsistent code formatting
- Invalid commit messages in history
- Rejected pull requests

**Only bypass when**:

- Fixing a broken hook during development
- Emergency hotfix (still must follow standards manually)
- Working on hook configuration itself

#### Benefits of Husky Integration

✅ **Automatic enforcement** - No need to remember to run linters
✅ **Consistent quality** - All commits meet project standards
✅ **Fast feedback** - Catch issues before pushing
✅ **Reduced CI failures** - Issues caught locally first
✅ **Better git history** - Consistent commit message format

**Validation Command**:

```bash
# Validate commit message before pushing
echo "feat(api): add new endpoint" | pnpm commitlint

# Validate last commit
pnpm commitlint --from HEAD~1 --to HEAD --verbose
```

### CI Pipeline Enforcement

The CI pipeline (`.github/workflows/continuous-integration.yml`) will **fail** if:

- ❌ Linting errors exist
- ❌ Type checking fails
- ❌ Build fails
- ❌ Core tests fail
- ❌ Commit messages are improperly formatted

---

## Development Workflows

### 1. Feature Development Workflow

```bash
# Step 1: Start development server
pnpm dev

# Step 2: Make your changes to components/pages/api

# Step 3: Verify changes in browser
# Navigate to http://localhost:3000

# Step 4: Run quality checks
pnpm lint:fix                   # Auto-fix linting issues
pnpm typecheck                  # Check TypeScript types
pnpm build                      # Validate production build

# Step 5: Validate commit message format
echo "feat(component): add new feature" | pnpm commitlint

# Step 6: Commit with proper format
git add .
git commit -m "feat(component): add new feature"

# Step 7: Push changes
git push
```

### 2. Database Schema Development Workflow

#### Prototyping Phase (Rapid Iteration)

```bash
# Step 1: Make changes to server/database/schema.prisma
# Edit the schema file with your changes

# Step 2: Push changes to database (no migration file created)
pnpm prisma:push

# Step 3: Test changes
pnpm dev
# Verify functionality in the application

# Step 4: Iterate
# Repeat steps 1-3 until satisfied with the schema
```

#### Migration Creation (For Production)

```bash
# Step 1: Ensure schema is finalized and tested

# Step 2: Create migration file
pnpm prisma:migrate:dev
# Prompts for migration name: use descriptive names
# Example: "add_user_preferences_table"

# Step 3: Review generated migration
# Check files in server/database/migrations/

# Step 4: Regenerate Prisma client
pnpm prisma:generate

# Step 5: Commit migration files
git add server/database/migrations server/database/schema.prisma
git commit -m "feat(database): add user preferences table"
```

### 3. API Endpoint Development Workflow

```bash
# Step 1: Create API route file
# Location: server/api/your-endpoint.ts or .post.ts, .get.ts, etc.

# Step 2: Use wrapped handler pattern (see Core Development Patterns)
# Implement authentication, rate limiting, and error handling

# Step 3: Test endpoint
pnpm dev
# Use browser DevTools or Postman to test

# Step 4: Validate and commit
pnpm lint:fix
pnpm typecheck
pnpm build
git commit -m "feat(api): add new endpoint for guild settings"
```

### 4. Discord Bot Integration Development

**Key Areas**:

- OAuth2 configuration: `server/utils/discord.ts`
- Guild permissions: Use `manageAbility` utility
- Rate limiting: Via `@tanstack/pacer` in wrapped handlers
- Session management: Via nuxt-auth-utils

**Example Flow**:

```typescript
// Check if user can manage guild
const hasPermission = manageAbility(guild.permissions);
if (!hasPermission) {
  throw createError({ statusCode: 403, message: "Insufficient permissions" });
}
```

---

---

## Technology Stack

### Frontend

- **Framework**: Nuxt 4 with Vue 3 Composition API
- **TypeScript**: Full TypeScript support with strict mode
- **Styling**: TailwindCSS + DaisyUI + NuxtUI components
- **State Management**: Pinia stores
- **Authentication**: nuxt-auth-utils with Discord OAuth2
- **Icons**: Nuxt Icon with ph, ic, heroicons, lucide collections

### Backend

- **Runtime**: Node.js 22+ with Nitro server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Discord OAuth2 with JWT sessions
- **API**: RESTful APIs with OpenAPI documentation
- **Caching**: Unstorage for rate limiting and session management

### DevOps

- **Package Manager**: pnpm with workspace configuration
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions for testing and deployment
- **Deployment**: Cloudflare Pages with NuxtHub
- **Monitoring**: Sentry for error tracking

---

## Project Structure

```
wolfstar.rocks/
├── app/                           # Nuxt application (client-side)
│   ├── components/                # Vue components
│   │   ├── ui/                    # Reusable UI components
│   │   ├── guild/                 # Guild-specific components
│   │   └── layout/                # Layout components
│   ├── composables/               # Vue composables
│   │   ├── useAuth.ts             # Authentication composable
│   │   ├── useGuild.ts            # Guild data composable
│   │   └── useLogger.ts           # Logging composable
│   ├── layouts/                   # Page layouts
│   │   ├── default.vue            # Default layout
│   │   └── dashboard.vue          # Dashboard layout
│   ├── pages/                     # File-based routing
│   │   ├── index.vue              # Homepage
│   │   ├── guilds/                # Guild pages
│   │   └── auth/                  # Auth pages
│   ├── plugins/                   # Nuxt plugins
│   ├── stores/                    # Pinia stores
│   │   ├── auth.ts                # Auth store
│   │   └── guild.ts               # Guild store
│   ├── themes/                    # UI theme configurations
│   ├── types/                     # Frontend type definitions
│   └── utils/                     # Frontend utilities
│
├── server/                        # Nitro server (backend)
│   ├── api/                       # API routes
│   │   ├── auth/                  # Auth endpoints
│   │   ├── guilds/                # Guild endpoints
│   │   └── oauth/                 # OAuth endpoints
│   ├── database/                  # Database utilities
│   │   ├── migrations/            # Prisma migrations
│   │   ├── schema.prisma          # Database schema
│   │   └── client.ts              # Prisma client singleton
│   ├── middlewares/               # Server middlewares
│   │   └── auth.ts                # Auth middleware
│   ├── plugins/                   # Server plugins
│   ├── types/                     # Server type definitions
│   └── utils/                     # Server utilities
│       ├── discord.ts             # Discord API utilities
│       ├── permissions.ts         # Permission utilities
│       └── wrapped-handler.ts     # Response handler wrapper
│
├── shared/                        # Shared code (client + server)
│   ├── types/                     # Shared type definitions
│   │   ├── discord.ts             # Discord types
│   │   └── api.ts                 # API types
│   └── utils/                     # Shared utilities
│       └── constants.ts           # Constants
│
├── .github/                       # GitHub configuration
│   ├── workflows/                 # CI/CD workflows
│   │   └── continuous-integration.yml
│   └── copilot-instructions.md    # Copilot instructions
│
├── .husky/                        # Git hooks
│   └── commit-msg                 # Commit message validation
│
├── prisma/                        # Prisma (legacy location)
├── public/                        # Static assets
├── .env                           # Environment variables (local)
├── nuxt.config.ts                 # Nuxt configuration
├── tailwind.config.ts             # TailwindCSS configuration
├── tsconfig.json                  # TypeScript configuration
├── .commitlintrc.json             # Commitlint configuration
├── eslint.config.js               # ESLint configuration
└── package.json                   # Project dependencies
```

### Key Directories Explained

**`app/`** - All frontend code

- File-based routing via `pages/`
- Reusable components in `components/`
- Composables for shared logic
- Pinia stores for global state

**`server/`** - All backend code

- API routes auto-registered from `api/`
- Database schema and migrations
- Server utilities and middlewares
- Nitro-specific code

**`shared/`** - Code shared between client and server

- Common type definitions
- Constants and utilities
- Must be isomorphic (works in both environments)

### File Naming Conventions

| Type             | Convention       | Example                                |
| ---------------- | ---------------- | -------------------------------------- |
| Vue Components   | PascalCase       | `UserProfile.vue`, `GuildSettings.vue` |
| TypeScript Files | kebab-case       | `auth-utils.ts`, `discord-api.ts`      |
| API Routes       | kebab-case       | `guild-settings.get.ts`                |
| Directories      | kebab-case       | `guild-settings/`, `user-profile/`     |
| Types/Interfaces | PascalCase       | `interface UserData {}`                |
| Functions        | camelCase        | `getUserData()`, `fetchGuilds()`       |
| Variables        | camelCase        | `guildId`, `userName`, `isLoading`     |
| Constants        | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES`          |

---

## Core Development Patterns

### 1. API Development with Wrapped Handlers

**⚠️ ALWAYS use `defineWrappedResponseHandler` for API endpoints**

**Why?**

- Consistent error handling across all endpoints
- Built-in rate limiting
- Automatic authentication checks
- Standardized response format

**Basic Pattern**:

```typescript
// server/api/guilds/[guild]/settings.get.ts
export default defineWrappedResponseHandler(
  async (event) => {
    const guildId = getRouterParam(event, "guild");

    // Your handler logic here
    const settings = await prisma.guild.findUnique({
      where: { id: guildId }
    });

    if (!settings) {
      throw createError({
        statusCode: 404,
        message: "Guild not found"
      });
    }

    return settings;
  },
  {
    // Require Discord authentication
    auth: true,

    // Rate limiting configuration
    rateLimit: {
      enabled: true,
      window: 10000, // 10 seconds
      limit: 5, // 5 requests per window
      type: "fixed" // or "sliding"
    }
  }
);
```

**Complete Example with All Options**:

```typescript
// server/api/guilds/[guild]/settings.patch.ts
export default defineWrappedResponseHandler(
  async (event) => {
    const guildId = getRouterParam(event, "id");
    const body = await readBody(event);

    // Update guild settings
    const updatedSettings = await prisma.guildSettings.update({
      where: { guildId },
      data: body
    });

    return updatedSettings;
  },
  {
    // Require authentication
    auth: true,

    // Rate limiting
    rateLimit: {
      enabled: true,
      window: 60000, // 60 seconds (1 minute)
      limit: 10, // 10 requests per minute
      type: "sliding" // Sliding window for smoother limits
    },

    // Success callback
    onSuccess: (logger, data) => {
      logger.info("Guild settings updated successfully", {
        guildId: data.guildId,
        updatedAt: data.updatedAt
      });
    },

    // Error callback (called before error is thrown)
    onError: (logger, error) => {
      logger.error("Failed to update guild settings", {
        error: error.message,
        statusCode: error.statusCode
      });
    }
  }
);
```

**Cached Response Handler**:

```typescript
// server/api/guilds/[guild]/channels.get.ts
export default defineWrappedCachedResponseHandler(
  async (event) => {
    const guildId = getRouterParam(event, "guild");

    // Fetch channels from Discord API
    const channels = await fetchGuildChannels(guildId);

    return channels;
  },
  {
    auth: true,
    rateLimit: {
      enabled: true,
      window: 10000,
      limit: 5
    },

    // Cache options (from Nitro's cachedEventHandler)
    maxAge: 60 * 60, // Cache for 1 hour
    swr: true, // Stale-while-revalidate
    name: "guild-channels", // Cache key prefix
    getKey: (event) => {
      const guildId = getRouterParam(event, "guild");
      return `channels:${guildId}`;
    }
  }
);
```

**Options Reference**:

| Option              | Type                      | Default     | Description                         |
| ------------------- | ------------------------- | ----------- | ----------------------------------- |
| `auth`              | `boolean`                 | `false`     | Require Discord authentication      |
| `rateLimit.enabled` | `boolean`                 | `true`      | Enable rate limiting                |
| `rateLimit.window`  | `number`                  | `10000`     | Time window in milliseconds         |
| `rateLimit.limit`   | `number`                  | `5`         | Max requests per window             |
| `rateLimit.type`    | `"fixed" \| "sliding"`    | `"fixed"`   | Window type for rate limiting       |
| `onSuccess`         | `(logger, data) => void`  | `undefined` | Callback on successful response     |
| `onError`           | `(logger, error) => void` | `undefined` | Callback on error (before throwing) |

**Additional Options for `defineWrappedCachedResponseHandler`**:

| Option   | Type                | Default     | Description                |
| -------- | ------------------- | ----------- | -------------------------- |
| `maxAge` | `number`            | `60 * 60`   | Cache duration in seconds  |
| `swr`    | `boolean`           | `true`      | Stale-while-revalidate     |
| `name`   | `string`            | `undefined` | Cache key prefix           |
| `getKey` | `(event) => string` | `undefined` | Custom cache key generator |

### 2. Vue Component Structure

**Required Order** (enforced by ESLint):

```vue
<!-- 1. Template (always first) -->
<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <button @click="handleClick">
      Click me
    </button>
  </div>
</template>

<!-- 2. Regular script (if needed, rare) -->
<script>
// Only use for component-level options that don't work in setup
</script>

<!-- 3. Setup script (main logic) -->
<script setup lang="ts">
// Imports
import { computed, onMounted, ref } from "vue";

// Props
interface Props {
  initialTitle?: string;
}

const { initialTitle = "Default Title" } = defineProps<Props>();

const emit = defineEmits<Emits>();

// Emits
interface Emits {
  (e: "update", value: string): void;
}

// State
const title = ref(initialTitle);
const count = ref(0);

// Computed
const doubleCount = computed(() => count.value * 2);

// Methods
function handleClick() {
  count.value++;
  emit("update", title.value);
}

// Lifecycle
onMounted(() => {
  console.log("Component mounted");
});
</script>

<!-- 4. Non-scoped styles (if needed) -->
<style>
/* Global styles affecting descendants */
.container h1 {
	font-weight: bold;
}
</style>

<!-- 5. Scoped styles (component-specific) -->
<style scoped>
.container {
	background-color: var(--color-background);
	padding: 1rem;
}
</style>
```

**Component Best Practices**:

- ✅ Use Composition API exclusively
- ✅ Prefer `<script setup>` syntax
- ✅ Type props and emits with TypeScript
- ✅ Use `withDefaults` for prop defaults
- ✅ Follow single responsibility principle
- ❌ Avoid mixing Options API with Composition API
- ❌ Don't use `export default` in setup scripts

### 3. Authentication Patterns

**Server-Side Authentication**:

```typescript
// In API routes
export default defineWrappedResponseHandler(
  async (event) => {
    // Wrapped handler automatically validates session when auth: true
    const session = await requireUserSession(event);

    // session.user contains Discord user data
    const userId = session.user.id;
    const username = session.user.username;

    // Your logic here
  },
  {
    auth: true // Requires authentication
  }
);
```

**Client-Side Authentication**:

```vue
<script setup lang="ts">
// Using auth composable
const { loggedIn, user, session, fetch, clear } = useUserSession();

// Check if user is logged in
if (!loggedIn.value) {
  navigateTo("/auth/login");
}

// Access user data
const username = user.value?.username;
const avatar = user.value?.avatar;
</script>
```

**Guild Permission Checking**:

```typescript
import { manageAbility } from "~/server/utils/permissions";

// Check if user can manage guild
const hasPermission = manageAbility(guild.permissions);

if (!hasPermission) {
  throw createError({
    statusCode: 403,
    message: "Insufficient permissions to manage this guild"
  });
}
```

### 4. Database Patterns with Prisma

**Prisma Client Singleton**:

```typescript
// server/database/client.ts - Always use this import
import { prisma } from "~/server/database/client";

// Usage in API routes
const guilds = await prisma.guild.findMany({
  where: { userId: session.user.id },
  include: { settings: true }
});
```

**Schema Conventions**:

```prisma
// server/database/schema.prisma

// Models: PascalCase
model Guild {
  // Fields: camelCase
  id          String   @id @default(cuid())
  discordId   String   @unique
  name        String
  ownerId     String

  // Relations
  owner       User     @relation(fields: [ownerId], references: [id])
  settings    GuildSettings?

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Map to snake_case table name
  @@map("guilds")
}
```

**Migration Best Practices**:

- Use descriptive migration names: `add_guild_settings_table`, not `migration_1`
- Always review generated SQL before applying
- Test migrations locally before deploying
- Use `prisma migrate dev` for development
- Use `prisma migrate deploy` for production

### 5. State Management with Pinia

**Store Structure**:

```typescript
// app/stores/guild.ts
import { defineStore } from "pinia";

export const useGuildStore = defineStore("guild", () => {
  // State (using composition API style)
  const selectedGuild = ref<Guild | null>(null);
  const guilds = ref<Guild[]>([]);
  const loading = ref(false);

  // Getters (computed)
  const hasGuilds = computed(() => guilds.value.length > 0);
  const selectedGuildId = computed(() => selectedGuild.value?.id);

  // Actions (functions)
  async function fetchGuilds() {
    loading.value = true;
    try {
      const { data } = await useFetch("/api/guilds");
      guilds.value = data.value || [];
    }
 finally {
      loading.value = false;
    }
  }

  function selectGuild(guild: Guild) {
    selectedGuild.value = guild;
  }

  // Return everything to expose
  return {
    // State
    selectedGuild,
    guilds,
    loading,
    // Getters
    hasGuilds,
    selectedGuildId,
    // Actions
    fetchGuilds,
    selectGuild
  };
});
```

**Usage in Components**:

```vue
<script setup lang="ts">
const guildStore = useGuildStore();

// Reactive access
const guilds = computed(() => guildStore.guilds);

// Call actions
onMounted(() => {
  guildStore.fetchGuilds();
});
</script>
```

### 6. Styling with TailwindCSS + DaisyUI

**DaisyUI Components**:

```vue
<template>
  <!-- Use semantic DaisyUI classes -->
  <button class="btn btn-primary">
    Primary Button
  </button>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Card Title</h2>
      <p>Card content</p>
    </div>
  </div>

  <div class="alert alert-info">
    <span>Information message</span>
  </div>
</template>
```

**Responsive Design**:

```vue
<template>
  <!-- Mobile first approach -->
  <div
    class="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-4
  "
  >
    <!-- Content -->
  </div>
</template>
```

**Theme Colors**:

- `primary` - Primary brand color
- `secondary` - Secondary brand color
- `accent` - Accent color
- `neutral` - Neutral color
- `base-100` - Background color
- `base-200` - Slightly darker background
- `base-300` - Even darker background
- `info` - Information color
- `success` - Success color
- `warning` - Warning color
- `error` - Error color

### 7. Error Handling Patterns

**Server-Side Error Handling**:

```typescript
// H3 errors in server handlers
throw createError({
  statusCode: 400,
  statusMessage: "Bad Request",
  message: "Invalid guild ID provided",
  data: { guildId: "expected string" }
});

// Common status codes:
// 400 - Bad Request (invalid input)
// 401 - Unauthorized (not authenticated)
// 403 - Forbidden (authenticated but no permission)
// 404 - Not Found (resource doesn't exist)
// 429 - Too Many Requests (rate limited)
// 500 - Internal Server Error (unexpected error)
```

**Client-Side Error Handling**:

```vue
<script setup lang="ts">
const { data, error, pending } = await useFetch("/api/guilds");

// Handle errors
if (error.value) {
  const statusCode = error.value.statusCode;
  const message = error.value.message;

  // Show user-friendly error
  console.error("Failed to fetch guilds:", message);
}
</script>
```

**Logging**:

```typescript
// Use logger composable
const logger = useLogger("@wolfstar/component-name");

logger.info("User logged in", { userId: user.id });
logger.warn("Guild not found", { guildId });
logger.error("Database error", { error: err.message });
```

### 8. Discord Bot Integration

**OAuth2 Configuration**:

```typescript
// server/utils/discord.ts
const DISCORD_CLIENT_ID = process.env.NUXT_OAUTH_DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.NUXT_OAUTH_DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.NUXT_OAUTH_DISCORD_REDIRECT_URI;

// Required OAuth scopes
const SCOPES = ["identify", "guilds"];
```

**Guild Permission Checking**:

```typescript
import { manageAbility } from "~/server/utils/permissions";

// Check if user has MANAGE_GUILD permission
const canManage = manageAbility(guild.permissions);

if (!canManage) {
  throw createError({
    statusCode: 403,
    message: "You need MANAGE_GUILD permission to access this guild"
  });
}
```

**Bot Integration Points**:

- **WolfStar Bot**: Moderation, logging, and server management
- **Staryl Bot**: Social media notifications (Twitch, Instagram, etc.)
- **OAuth Scopes**: `identify` for user data, `guilds` for server list, `bot` for bot invitations
- **Permissions**: Use Discord permission bitfield calculations via `@sapphire/bitfield`
- **Rate Limiting**: Built into wrapped handlers via `@tanstack/pacer`

---

## Code Style & Formatting

### ESLint Configuration

- **Base**: @antfu/eslint-config with Nuxt integration
- **Formatting**: Prettier integration with 2-space indentation
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Vue**: Specific Vue.js rules with custom block order

### Block Order for Vue Components

```vue
<template>
  <!-- Template content -->
</template>

<script>
// Regular script
</script>

<script setup lang="ts">
// Setup script
</script>

<style>
/* Non-scoped styles */
</style>

<style scoped>
/* Scoped styles */
</style>
```

### Commit Conventions

**Standard**: Conventional Commits with commitlint validation

**Configuration**:

- Uses `@commitlint/config-conventional` as base
- Custom rules in `.commitlintrc.json`
- Pre-commit validation via Husky hooks
- CI/CD enforcement in GitHub Actions

**Commit Message Format**: `<type>(<scope>): <subject>`

**Allowed Types**:

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring without changing behavior
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or external dependency changes
- `ci` - CI/CD configuration changes
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverting previous commits
- `types` - TypeScript type definition updates

**Rules**:

- Scope must be **lowercase** (e.g., `auth`, `api`, `ui`)
- Subject must be **lowercase** and **imperative** mood
- No **exclamation marks** in subject
- No **period** at the end of subject
- Maximum line length enforced

**Examples**:

```bash
# ✅ Good examples
feat: add user dashboard component
feat(auth): implement Discord OAuth2 flow
fix(api): resolve guild data fetching issue
docs: update installation instructions
style: format code with prettier
refactor(components): simplify button component logic
perf(database): optimize guild query performance
test(api): add unit tests for auth endpoints

# ❌ Bad examples
Add feature                     # Missing type
feat: Add feature               # Subject not lowercase
feat!: breaking change          # Exclamation mark not allowed
fix(Auth): bug fix              # Scope not lowercase
feat: add feature.              # Period at end
```

**Validation Command**:

```bash
# Validate commit message
pnpm commitlint --from HEAD~1 --to HEAD --verbose
```

### Automated Git Hooks with Husky

**Husky automatically enforces code quality on every commit**

The project uses **Husky v9+** with Git hooks to automatically validate commits before they are created. This ensures consistent code quality and commit message formatting across all contributors.

#### What Happens Automatically

When you run `git commit`, Husky automatically triggers:

1. **commit-msg hook** - Validates commit message format
   - Runs `commitlint` to check Conventional Commits format
   - Rejects commits with invalid messages
   - Ensures all commits follow project standards

2. **pre-commit hook** (via lint-staged) - Lints and formats staged files
   - Runs `eslint --fix` on staged `.js`, `.ts`, `.vue` files
   - Runs `prettier --write` on staged files
   - Only processes files that are staged for commit
   - Automatically fixes issues when possible

#### Configuration

**Husky hooks location**: `.husky/` directory

- `.husky/commit-msg` - Commit message validation
- `.husky/pre-commit` - Lint-staged execution

**lint-staged configuration**: `package.json`

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": "eslint --fix",
    "*.{js,ts,vue,json,md}": "prettier --write"
  }
}
```

#### Example Workflow

```bash
# 1. Stage your changes
git add .

# 2. Commit with proper message
git commit -m "feat(api): add new endpoint for guild settings"

# Husky automatically runs:
# → lint-staged (eslint + prettier on staged files)
# → commitlint (validates commit message)

# If everything passes:
# ✅ Commit created successfully

# If issues found:
# ❌ Commit rejected with error messages
# → Fix the issues and try again
```

#### Bypassing Hooks (Not Recommended)

In rare cases, you may need to bypass hooks:

```bash
# Skip all hooks (NOT RECOMMENDED)
git commit -m "message" --no-verify

# Or use the -n flag
git commit -m "message" -n
```

**⚠️ Warning**: Bypassing hooks can lead to:

- CI pipeline failures
- Inconsistent code formatting
- Invalid commit messages in history
- Rejected pull requests

**Only bypass when**:

- Fixing a broken hook during development
- Emergency hotfix (still must follow standards manually)
- Working on hook configuration itself

#### Benefits of Husky Integration

✅ **Automatic enforcement** - No need to remember to run linters
✅ **Consistent quality** - All commits meet project standards
✅ **Fast feedback** - Catch issues before pushing
✅ **Reduced CI failures** - Issues caught locally first
✅ **Better git history** - Consistent commit message format

## Vue.js Conventions

### Component Structure

1. **Imports** - External libraries and internal modules
2. **Type Definitions** - Interfaces and types
3. **Props Definition** - With defaults using `withDefaults`
4. **Emits Definition** - Type-safe event definitions
5. **Composables** - Vue composables usage
6. **Reactive State** - ref, reactive declarations
7. **Computed Properties** - Derived state
8. **Methods** - Event handlers and functions
9. **Lifecycle Hooks** - When needed

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.vue`)
- **Props**: camelCase with descriptive names
- **Events**: kebab-case (e.g., `user-updated`)
- **Variables**: camelCase (e.g., `guildId`, `userName`, `isLoading`, `hasError`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`)
- **Functions**: camelCase (e.g., `getUserData`, `fetchGuilds`)
- **Types/Interfaces**: PascalCase (e.g., `UserData`, `GuildSettings`)

### Component Patterns

- Use **Composition API** exclusively
- Prefer **`<script setup>`** syntax
- Implement **proper prop validation** with TypeScript
- Use **defineExpose** for component methods when needed
- Follow **single responsibility principle**

### State Management

- Use **Pinia** for global state
- Store structure: `state`, `getters`, `actions`
- Use **composables** for reusable logic
- Implement **proper TypeScript** integration

## TypeScript Guidelines

### Configuration

- **Strict mode** enabled
- **Module resolution**: Node with ESM
- **Target**: ESNext
- **Auto-imports** via Nuxt

### Type Definitions

- Use **interfaces** for object shapes
- Use **type aliases** for unions and complex types
- Implement **generic types** where appropriate
- Use **const assertions** for immutable data

### Import/Export Patterns

```typescript
// Named exports preferred
export interface UserData {
  id: string;
  name: string;
}
export type UserRole = "admin" | "user";

// Default exports for components
export default defineComponent({
  name: "MyComponent"
});

export { default as Component } from "./Component.vue";
// Re-exports for barrel files
export * from "./types";
```

## API Development

### Route Structure

- **File-based routing** in `server/api/`
- **RESTful conventions** for endpoints
- **OpenAPI documentation**: Nitro provides an experimental build-time macro `defineRouteMeta` (it's not a third‑party module). To enable OpenAPI metadata generation:
  1. Set `nitro.experimental.openAPI = true` in `nuxt.config.ts`.
  2. Add a `defineRouteMeta({ openAPI: { /* path, method, params, responses */ } })` call immediately above your `export default defineEventHandler(...)` in `server/api` route files.
  3. Note: the feature is experimental and some tooling may auto-generate these `defineRouteMeta` calls for you.

  Example:

  ```ts
  // server/api/guilds/[id].get.ts
  defineRouteMeta({
    openAPI: {
      summary: "Get guild",
      responses: { 200: { description: "Guild object" } }
    }
  });

  export default defineEventHandler(async (event) => {
    // handler...
  });
  ```

- **Proper HTTP status codes** and error handling

### Authentication & Authorization

- **Discord OAuth2** integration
- **cookie-based (sealed/encrypted) sessions** with nuxt-auth-utils
- **Role-based access control** via authorization resolver
- **Rate limiting** with @tanstack/pacer (official framework-agnostic rate-limiter usable in Node/Nitro)

### Error Handling

```typescript
// Basic wrapped event handler
export default defineWrappedResponseHandler(
  async (event) => {
    // Handler logic
    const guildId = getRouterParam(event, "guild");
    const settings = await prisma.guild.findUnique({
      where: { id: guildId }
    });
    return settings;
  },
  {
    auth: true,
    rateLimit: {
      enabled: true,
      window: 10000, // 10 seconds
      limit: 5, // 5 requests per window
      type: "fixed" // or "sliding"
    }
  }
);

// Complete example with all options
export default defineWrappedResponseHandler(
  async (event) => {
    const guildId = getRouterParam(event, "guild");
    const body = await readBody(event);

    // Update guild settings
    const updatedSettings = await prisma.guildSettings.update({
      where: { guildId },
      data: body
    });

    return updatedSettings;
  },
  {
    auth: true,
    rateLimit: {
      enabled: true,
      window: 60000, // 60 seconds (1 minute)
      limit: 10, // 10 requests per minute
      type: "sliding" // Sliding window for smoother limits
    },
    // Success callback
    onSuccess: (logger, data) => {
      logger.info("Guild settings updated successfully", {
        guildId: data.guildId,
        updatedAt: data.updatedAt
      });
    },
    // Error callback (called before error is thrown)
    onError: (logger, error) => {
      logger.error("Failed to update guild settings", {
        error: error.message,
        statusCode: error.statusCode
      });
    }
  }
);
```

**Options Reference**:

- `auth: boolean` - Require Discord authentication (default: false)
- `rateLimit.enabled: boolean` - Enable rate limiting (default: true)
- `rateLimit.window: number` - Time window in milliseconds (default: 10000)
- `rateLimit.limit: number` - Max requests per window (default: 5)
- `rateLimit.type: "fixed" | "sliding"` - Window type (default: "fixed")
- `onSuccess: (logger, data) => void` - Callback on successful response
- `onError: (logger, error) => void` - Callback on error (before throwing)

### API Patterns

- Use **wrapped event handlers** for consistency (always use `defineWrappedResponseHandler`)
- Implement **proper validation** with Zod or similar
- Use **transformers** for data serialization
- Follow **REST conventions** for resource endpoints
- Use **camelCase** for all variables (e.g., `guildId`, not `guild_id`)
- Leverage **onSuccess** and **onError** callbacks for logging and monitoring

## Database Conventions

### Prisma Schema

- **PostgreSQL** as primary database
- **ESM module format** for generated client
- **Driver adapters** and **query compiler** preview features
- **JSON types** with prisma-json-types-generator

### Naming Conventions

- **PascalCase** for model names (e.g., `Guild`, `GuildSettings`)
- **camelCase** for field names (e.g., `guildId`, `createdAt`)
- **snake_case** for mapped database columns (e.g., `@@map("guild_settings")`)
- **Avoid kebab-case** (hyphens) — they require quoting and can cause issues with PostgreSQL/Prisma
- **Descriptive names** for relationships

### Migration Strategy

- **Development**: `prisma migrate dev`
- **Production**: `prisma migrate deploy`
- **Descriptive migration names** required
- **Schema drift detection** enabled

## Styling Guidelines

### TailwindCSS + DaisyUI

- **Utility-first** approach with TailwindCSS
- **DaisyUI components** for consistent theming
- **CSS variables** for theme customization
- **Light/dark mode** support with @nuxtjs/color-mode

### Component Styling

- Use **tailwind-variants** for component variants
- Implement **cn utility** for class merging
- Follow **design system** patterns
- Use **semantic color names** (primary, secondary, etc.)

### CSS Organization

```css
/* Main CSS structure */
@import 'tailwindcss';
@import 'tw-animate-css';
@import '@nuxt/ui';
@import './keyframes.css';
@plugin "@tailwindcss/typography";
@plugin 'daisyui';
```

### Theme Configuration

- **System preference** as default
- **Data attribute** theming (`data-theme`)
- **Custom color schemes** with oklch color space
- **Consistent spacing** and typography scales

## Security Practices

### Content Security Policy

- **Strict CSP** headers in production
- **HTTPS enforcement** with upgrade-insecure-requests
- **Frame protection** with frame-ancestors 'none'
- **XSS protection** with script-src restrictions

### Authentication Security

- **OAuth2 state validation**
- **Secure session management**
- **Rate limiting** on authentication endpoints
- **CSRF protection** via SameSite cookies

### Data Protection

- **Input validation** on all endpoints
- **SQL injection prevention** via Prisma
- **Sensitive data masking** in logs
- **Environment variable** security

## Performance Standards

### Frontend Optimization

- **Code splitting** with Nuxt auto-imports
- **Lazy loading** for heavy components
- **Image optimization** with @nuxt/image
- **Bundle analysis** and optimization

### Backend Performance

- **Database query optimization**
- **Caching strategies** with Unstorage
- **Rate limiting** to prevent abuse
- **Efficient serialization** with transformers

### Core Web Vitals

- **LCP**: Optimize largest contentful paint
- **FID**: Minimize first input delay
- **CLS**: Prevent cumulative layout shift
- **PWA support** with @vite-pwa/nuxt

## Testing & Quality Assurance

### Pre-commit Checklist

Before committing changes, **ALWAYS** run these commands in order:

1. **Build Validation**

   ```bash
   pnpm build
   ```

   - ✅ Must build successfully without errors
   - ⏱️ Takes ~45-120 seconds (depending on cache state)
   - ❌ CI will fail if build fails

2. **Linting**

   ```bash
   pnpm lint
   ```

   - ✅ Fix any **errors** (mandatory)
   - ⚠️ Warnings are acceptable
   - 💡 Use `pnpm lint:fix` for auto-fixes
   - ❌ CI will fail if errors exist

3. **Type Checking** (Optional but Recommended)

   ```bash
   pnpm typecheck
   ```

   - ✅ Must pass without errors
   - ⏱️ Takes ~22 seconds
   - 💡 Catches TypeScript issues early

4. **Commit Message Validation**

   ```bash
   pnpm commitlint --from HEAD~1 --to HEAD --verbose
   ```

   - ✅ Validates commit message format
   - 📋 Must follow Conventional Commits standard
   - ❌ CI may reject improperly formatted commits

### Code Quality Tools

**Automated Enforcement**:

- **Husky v9+** - Git hooks for automatic validation
  - Pre-commit hook: Runs lint-staged on staged files
  - Commit-msg hook: Validates commit message format
  - Automatic execution on every `git commit`
- **lint-staged** - Runs linters only on staged files
  - Executes `eslint --fix` on `.js`, `.ts`, `.vue` files
  - Executes `prettier --write` on all applicable files
  - Automatic fixes applied before commit

**Manual Tools**:

- **ESLint** - Code linting with @antfu/eslint-config
  - Command: `pnpm lint` or `pnpm lint:fix`
  - Enforces code style and best practices
- **TypeScript** - Type checking with strict mode
  - Command: `pnpm typecheck`
  - Catches type errors and improves code safety
- **Prettier** - Code formatting with @sapphire/prettier-config
  - Command: `pnpm format`
  - Ensures consistent code formatting
- **commitlint** - Commit message validation
  - Command: `pnpm commitlint --from HEAD~1 --to HEAD --verbose`
  - Enforces Conventional Commits standard

### Testing Strategy

- **Unit tests** for utilities and composables
- **Component tests** for Vue components
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Coverage reporting** for test effectiveness

### Continuous Integration

**CI Pipeline** (`.github/workflows/continuous-integration.yml`) enforces:

- ❌ Build must succeed
- ❌ Linting must pass (no errors)
- ❌ Type checking must pass
- ❌ Tests must pass
- ❌ Commit messages must be properly formatted

**Automated Checks**:

- **GitHub Actions** for CI/CD
- **Automated testing** on pull requests
- **Code coverage** reporting
- **Dependency vulnerability** scanning with Dependabot
- **Security scanning** with CodeQL

## DevOps & Deployment

### Container Strategy

- **Multi-stage Docker builds**
- **Alpine Linux** base images
- **Non-root user** execution
- **Minimal attack surface**

### Deployment Pipeline

- **Cloudflare Pages** for hosting
- **NuxtHub** for full-stack deployment
- **Environment-specific** configurations
- **Automated deployments** from main branch

### Monitoring & Observability

- **Sentry** for error tracking
- **Cloudflare Analytics** for web metrics
- **Console logging** with structured format
- **Performance monitoring** with Core Web Vitals

## Documentation Standards

### Code Documentation

- **JSDoc comments** for functions and components
- **TypeScript interfaces** with descriptions
- **README files** for major features
- **API documentation** with OpenAPI

### Project Documentation

- **Architecture decisions** recorded
- **Setup instructions** maintained
- **Contributing guidelines** available
- **Changelog** for version tracking

### Comment Guidelines

```typescript
/**
 * Transforms Discord OAuth guilds and user data
 * @param data - Raw OAuth response data
 * @returns Transformed guild and user information
 */
export async function transformOauthGuildsAndUser(data: OAuthData) {
  // Implementation
}
```

---

## Common Gotchas

### 1. File Naming & Variable Conventions

**❌ Wrong - Files**:

- `UserProfile.ts` (should be .vue for components)
- `guild-settings.vue` (components should be PascalCase)
- `AuthUtils.ts` (utils should be kebab-case)

**✅ Correct - Files**:

- `UserProfile.vue` (component)
- `GuildSettings.vue` (component)
- `auth-utils.ts` (utility)
- `guild-settings.get.ts` (API route)

**❌ Wrong - Variables**:

- `guild_id` (snake_case, not TypeScript convention)
- `GuildId` (PascalCase, reserved for types)
- `GUILD_ID` (uppercase, reserved for constants)

**✅ Correct - Variables**:

- `guildId` (camelCase for variables)
- `userId`, `userName`, `isLoading` (camelCase)
- `API_BASE_URL`, `MAX_RETRIES` (UPPER_SNAKE_CASE for constants)

### 2. Import Confusion

**❌ Avoid manual imports when auto-imports work**:

```typescript
import { useFetch } from "#app";
// Don't do this
import { computed, ref } from "vue";
```

**✅ Use Nuxt auto-imports**:

```typescript
// Just use them directly
const count = ref(0);
const doubled = computed(() => count.value * 2);
const { data } = await useFetch("/api/guilds");
```

**When to manually import**:

- Third-party libraries not in auto-imports
- Shared utilities from `~/shared/`
- Explicit imports for clarity in complex files

### 3. State Management Misuse

**❌ Wrong - Using reactive state in wrong place**:

```typescript
// Don't create global state outside composables/stores
const globalUser = ref(null); // Bad!
```

**✅ Correct - Use Pinia for global state**:

```typescript
// app/stores/auth.ts
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  return { user };
});
```

**✅ Correct - Use composables for local logic**:

```typescript
// app/composables/useUser.ts
export function useUser() {
  const user = ref(null);
  // Local logic
  return { user };
}
```

### 4. API Route Registration

**❌ Wrong location - API not auto-registered**:

```
app/api/guilds.ts           # Wrong directory!
```

**✅ Correct location**:

```
server/api/guilds.get.ts    # GET /api/guilds
server/api/guilds.post.ts   # POST /api/guilds
```

### 5. Database Migration Confusion

**❌ Wrong - Skipping migrations**:

```bash
# Making schema changes without migrations
# Edit schema.prisma
pnpm dev  # ❌ Schema not applied!
```

**✅ Correct - Use proper workflow**:

```bash
# Prototyping (development only)
pnpm prisma:push

# Production-ready changes
pnpm prisma:migrate:dev
```

### 6. Environment-Specific Code

**Issue**: Code behaves differently on Cloudflare Pages vs Node.js

**Solution**: Use environment detection

```typescript
// Check runtime environment
if (import.meta.server) {
  // Server-side code
}

if (import.meta.client) {
  // Client-side code
}

// Check deployment target
const isCloudflare = process.env.NITRO_PRESET === "cloudflare-pages";
```

### 7. Discord OAuth Redirect Issues

**Common Problem**: OAuth redirect doesn't match configured URI

**Solution**: Ensure `.env` matches Discord app settings

```bash
# .env
NUXT_OAUTH_DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback

# Must match exactly in Discord Developer Portal
```

### 8. Rate Limiting Not Working

**Problem**: Rate limiting bypassed or not triggering

**Checklist**:

- ✅ Using `defineWrappedResponseHandler`
- ✅ `rateLimit.enabled: true` in options
- ✅ Cache storage properly configured
- ✅ Unique identifier (user ID or IP) available

### 9. Prisma Client Not Updated

**Problem**: Schema changes not reflected in TypeScript types

**Solution**:

```bash
# After schema changes, always regenerate
pnpm prisma:generate

# Or use watch mode during development
pnpm prisma:generate:watch
```

### 10. Vue Component Block Order

**Problem**: ESLint errors about block order

**Solution**: Always follow this order

1. `<template>`
2. `<script>` (if needed)
3. `<script setup lang="ts">`
4. `<style>`
5. `<style scoped>`

---

## Troubleshooting

### Development Server Won't Start

**Symptoms**: `pnpm dev` fails or hangs

**Solutions**:

```bash
# 1. Check port availability
lsof -i :3000                   # macOS/Linux
netstat -ano | findstr :3000    # Windows

# 2. Clear Nuxt cache
rm -rf .nuxt .output node_modules/.cache

# 3. Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 4. Regenerate Prisma client
pnpm prisma:generate

# 5. Check environment variables
cat .env  # Verify all required vars are set
```

### Build Fails with Timeout

**Symptoms**: `pnpm build` hangs or times out

**Solutions**:

1. **Wait longer** - First builds can take 90-120 seconds
2. **Check memory** - Ensure sufficient RAM (4GB+ recommended)
3. **Clear caches**:
   ```bash
   rm -rf .nuxt .output node_modules/.cache
   pnpm build
   ```
4. **Incremental builds** - Subsequent builds should be faster

### Database Connection Errors

**Symptoms**: `PrismaClientInitializationError` or connection refused

**Solutions**:

```bash
# 1. Verify PostgreSQL is running
# In Copilot environment, it's auto-provided

# 2. Check DATABASE_URL in .env
echo $DATABASE_URL

# 3. Test connection
pnpm prisma db pull  # Should not error

# 4. Reset database (⚠️ destructive)
pnpm prisma:migrate:reset
```

### Type Errors After Updates

**Symptoms**: TypeScript errors after package updates

**Solutions**:

```bash
# 1. Regenerate all type definitions
pnpm nuxt prepare
pnpm prisma:generate

# 2. Restart TypeScript server in VS Code
# Command Palette: "TypeScript: Restart TS Server"

# 3. Run type check
pnpm typecheck
```

### Hot Reload Not Working

**Symptoms**: Changes not reflected without manual refresh

**Solutions**:

1. **Check file watchers**: Ensure no watcher limit issues (Linux)

   ```bash
   # Increase file watchers (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart dev server**:

   ```bash
   # Kill and restart
   pkill node
   pnpm dev
   ```

3. **Clear Vite cache**:
   ```bash
   rm -rf node_modules/.vite
   pnpm dev
   ```

### Authentication Not Persisting

**Symptoms**: User logged out after page refresh

**Solutions**:

1. **Check session configuration** in `nuxt.config.ts`
2. **Verify cookie settings** (secure, httpOnly, sameSite)
3. **Check cache connection** for session storage
4. **Clear browser cookies** and retry

### API Calls Failing with CORS

**Symptoms**: CORS errors in browser console

**Note**: Should not happen in this setup (same origin)

**If it does occur**:

- Verify API routes are in `server/api/` directory
- Check Nitro server configuration
- Ensure using `/api/` prefix in fetch calls

### Linting Errors Won't Fix

**Symptoms**: `pnpm lint` shows errors even after `lint:fix`

**Solutions**:

```bash
# 1. Clear ESLint cache
rm -rf node_modules/.cache/eslint

# 2. Run fix again
pnpm lint:fix

# 3. If specific errors persist, check:
# - .eslintrc or eslint.config.js for rules
# - Whether error is from Prettier (formatting issue)
# - Whether it's a genuine code issue requiring manual fix
```

### Commit Message Rejected

**Symptoms**: Husky hook fails on commit

**Solutions**:

```bash
# 1. Validate message format
echo "your commit message" | pnpm commitlint

# 2. Check allowed types
# Must be one of: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, types

# 3. Ensure format: type(scope): subject
# Examples:
git commit -m "feat(auth): add Discord OAuth2"
git commit -m "fix: resolve database connection issue"

# 4. Bypass hook (not recommended)
git commit -m "your message" --no-verify
```

---

---

## Quality Assurance Commands

```bash
# Daily development
pnpm dev                        # Start dev server
pnpm lint:fix                   # Fix linting issues
pnpm typecheck                  # Check types

# Database work
pnpm prisma:studio              # Visual database editor
pnpm prisma:push                # Quick schema sync
pnpm prisma:migrate:dev         # Create migration

# Before committing
pnpm build                      # Validate build
pnpm lint                       # Check for errors
pnpm commitlint --from HEAD~1 --to HEAD --verbose  # Validate commit

# Validation
pnpm prisma:validate            # Validate Prisma schema
```

---

## Enforcement

These conventions are enforced through:

- **Automated linting** with ESLint (pre-commit and CI)
- **Type checking** with TypeScript (pre-commit and CI)
- **Commit message validation** with commitlint (pre-commit and CI)
- **Pre-commit hooks** with Husky
- **CI/CD pipeline** checks (GitHub Actions)
- **Code review** requirements

**CI Pipeline Failures**: The build will fail if:

- ❌ Linting errors exist
- ❌ Type checking fails
- ❌ Build fails
- ❌ Tests fail
- ❌ Commit messages are improperly formatted

---

## Philosophy

This codebase emphasizes:

- ✅ **Type Safety** - Full TypeScript with strict mode
- ✅ **Developer Experience** - Fast hot reload, auto-imports, great DX
- ✅ **Discord Integration** - Seamless OAuth and bot management
- ✅ **Code Quality** - Automated linting, formatting, and testing
- ✅ **Performance** - Optimized builds, efficient caching, PWA support
- ✅ **Security** - Proper authentication, authorization, and rate limiting
- ✅ **Maintainability** - Clear patterns, consistent conventions, good documentation

**When in doubt**: Always reference existing patterns in similar files when implementing new features.

---

## Updates

This document should be updated when:

- New conventions are established
- Technology stack changes
- Architecture decisions are made
- Best practices evolve

When the project or this file has changed, the **Last Updated** date will be updated to reflect the current month and year.

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Maintained by**: WolfStar Development Team

When the project or this file has changed, the **Last Updated** date will be updated to reflect the current month and year.

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Maintained by**: WolfStar Development Team

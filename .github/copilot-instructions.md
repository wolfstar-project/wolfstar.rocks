# WolfStar.rocks Copilot Instructions

- **Project Snapshot**: Nuxt 4 + Vue 3 + TypeScript app on Node 22+; start locally with `pnpm dev` (first boot can take ~60s).
- **Essential Commands**: `pnpm build` (pre-PR sanity), `pnpm lint`, `pnpm typecheck`, `pnpm prisma:studio`, `pnpm prisma:migrate:dev`, `pnpm prisma:generate`.
- **Workspace Layout**: `app/` drives the client, `server/` hosts Nitro API + Prisma, `shared/` contains isomorphic types/utilities—keep new code inside the right boundary.
- **Routing & Fetching**: Pages live in `app/pages/**`; author components with `<script setup>` Composition API and lean on Nuxt auto-imports instead of manual Vue imports.
- **State & Data**: Use Pinia stores in `app/stores` for global state, colocate reusable logic inside `app/composables`, and pull types from `shared/types` to avoid drift.
- **Styling**: Tailwind + DaisyUI + Nuxt UI drive styling; shared utility sheets sit in `app/assets/css`, and tokens/variants live in `app/themes`.
- **API Pattern**: Place routes under `server/api`; wrap handlers with `defineWrappedResponseHandler` (or cached variant) from `server/utils/wrappedEventHandler.ts` to inherit auth + @tanstack/pacer rate limiting.
- **Auth & Discord**: Sessions come from `nuxt-auth-utils`; required Discord scopes are `identify` + `guilds`; manage permission checks with `shared/utils/abilities.ts` and helpers in `server/utils/discord.ts`.
- **Database**: Prisma schema resides in `server/database/schema.prisma`; default client exports from `server/database/prisma.ts`; prototype with `pnpm prisma:push`, ship changes via `pnpm prisma:migrate:dev`.
- **Conventions**: Directories/files use kebab-case except Vue components (PascalCase); enforce block order template → script → script setup → styles; constants in UPPER_SNAKE; never create reactive state at module scope.
- **Logging & Transform**: Prefer `shared/utils/logger.ts` for structured logs and `server/utils/ApiTransformers.ts` when shaping API payloads.
- **Error Handling**: Throw `createError` inside handlers; use wrapper `onSuccess`/`onError` callbacks for logging; wrappers auto-set `X-RateLimit-*` headers.
- **Testing Hooks**: Husky + lint-staged run ESLint/Prettier on staged files; commit messages must follow Conventional Commits (`pnpm commitlint`).
- **Validation Scenarios**: After auth or guild changes, run `pnpm dev`, complete Discord login, and ensure guild dashboards load without console errors.
- **Deployment Notes**: Nitro output targets Cloudflare/NuxtHub—respect runtime config in `config/env.ts` and `server/utils/runtimeConfig.ts` for env-aware features.
- **Common Pitfalls**: Match HTTP suffixes (`.get.ts`, `.post.ts`) for new endpoints, regenerate Prisma after schema edits, and remember rate-limit state persists via Nitro storage.
- **Diagnostics**: If builds misbehave, clear `.nuxt` and `node_modules/.cache`, then restart rather than editing generated output.
- **Reference Files**: `nuxt.config.ts`, `app/plugins/api.ts`, `server/plugins/authorization-resolver.ts`, and `app/utils/seoMeta.ts` illustrate preferred patterns.
- **CI Expectations**: `.github/workflows/continuous-integration.yml` runs build/lint/typecheck on PRs—mirror that locally before pushing.
- **When Unsure**: Copy existing patterns from similar files (e.g., `server/api/guilds/**`, `app/components/discord/**`) before inventing new ones.

# WolfStar.rocks Development Instructions

> **Comprehensive guide for AI-assisted development on the WolfStar.rocks dashboard project**

WolfStar.rocks is a modern Nuxt 4 full-stack web application serving as the official dashboard for **WolfStar** (Discord moderation bot) and **Staryl** (social notifications bot). Built with Vue 3, TypeScript, Prisma, and PostgreSQL, featuring Discord OAuth2 authentication and comprehensive guild management.

**⚠️ ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

---

## Table of Contents

- [Quick Start](#quick-start)
- [AI Development Tools](#ai-development-tools)
- [Development Commands](#development-commands)
- [Quality Assurance & Pre-commit Checklist](#quality-assurance--pre-commit-checklist)
- [Development Workflows](#development-workflows)
- [Validation Scenarios](#validation-scenarios)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Core Development Patterns](#core-development-patterns)
- [Common Gotchas](#common-gotchas)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- **Node.js**: 22+ (LTS)
- **Package Manager**: pnpm (required, not npm or yarn)
- **Database**: PostgreSQL (auto-provided in Copilot environment)

### Initial Setup

In the Copilot environment:

- ✅ PostgreSQL service is **automatically provided** with pre-configured environment variables
- ✅ Database is **already created and seeded**
- ✅ Dependencies are **already installed** via pnpm
- ✅ Prisma client is **already generated**

**You can immediately start the development server without additional setup.**

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
3. ✅ Reference these instructions first, then use Context7 for library-specific details
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

## Validation Scenarios

**⚠️ ALWAYS manually validate changes using these complete user scenarios:**

### Scenario 1: Basic Dashboard Functionality

**Purpose**: Verify core application functionality

**Steps**:

1. Start development server: `pnpm dev`
2. Navigate to `http://localhost:3000`
3. Verify homepage loads with WolfStar branding
4. Click "Login with Discord" button
5. Complete Discord OAuth flow
6. Verify guild list loads after authentication
7. Click on a guild to view settings
8. Check browser console for **critical errors** (warnings are expected)

**Expected Results**:

- ✅ Homepage renders correctly
- ✅ Discord OAuth redirects properly
- ✅ Guild list displays user's servers
- ✅ No critical console errors
- ⚠️ Warnings are acceptable

### Scenario 2: Full Development Workflow

**Purpose**: Verify hot reload and development experience

**Steps**:

1. Start development server: `pnpm dev`
2. Open `app/pages/index.vue`
3. Make a visible change (e.g., edit heading text)
4. Save the file
5. Observe browser auto-refresh
6. Verify change appears without manual reload
7. Check terminal for compilation errors

**Expected Results**:

- ✅ Changes reflect immediately in browser
- ✅ No compilation errors in terminal
- ✅ Fast hot module replacement (< 1 second)

### Scenario 3: Production Build Validation

**Purpose**: Ensure production-ready code

**Steps**:

1. Build application: `pnpm build`
2. Wait for build to complete (~45-120 seconds)
3. Verify no build errors
4. Start production server: `pnpm start`
5. Navigate to `http://localhost:3000`
6. Test Discord authentication flow
7. Verify guild functionality works
8. Check browser DevTools Network tab for errors

**Expected Results**:

- ✅ Build completes successfully
- ✅ Production server starts without errors
- ✅ Application loads and functions correctly
- ✅ No network errors or failed requests

### Scenario 4: Database Changes Validation

**Purpose**: Verify database schema changes

**Steps**:

1. Make schema change in `server/database/schema.prisma`
2. Run: `pnpm prisma:push` (for prototyping) OR `pnpm prisma:migrate:dev` (for production)
3. Open Prisma Studio: `pnpm prisma:studio`
4. Verify schema changes in Studio (http://localhost:5555)
5. Test affected API endpoints
6. Verify data integrity

**Expected Results**:

- ✅ Schema changes applied successfully
- ✅ Prisma Studio reflects changes
- ✅ Application uses updated schema
- ✅ No data loss or corruption

---

## Technology Stack

### Frontend Stack

- **Framework**: Nuxt 4 (latest)
- **UI Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v3 + DaisyUI v4 + NuxtUI
- **State Management**: Pinia stores
- **Icons**: @nuxt/icon (ph, ic, heroicons, lucide collections)
- **Image Optimization**: @nuxt/image
- **PWA Support**: @vite-pwa/nuxt

### Backend Stack

- **Runtime**: Node.js 22+ with Nitro server
- **Database**: PostgreSQL with Prisma ORM v6
- **Cache/Session**: Unstorage
- **Authentication**: nuxt-auth-utils with Discord OAuth2
- **Rate Limiting**: @tanstack/pacer
- **API Documentation**: OpenAPI/Swagger

### DevOps & Tooling

- **Package Manager**: pnpm v9+ (workspaces enabled)
- **Linting**: ESLint with @antfu/eslint-config
- **Formatting**: Prettier with @sapphire/prettier-config
- **Type Checking**: TypeScript v5+
- **Commit Linting**: commitlint with @commitlint/config-conventional
- **Git Hooks**: Husky v9+ with lint-staged
- **CI/CD**: GitHub Actions
- **Deployment**: Netlify/Cloudflare Pages with NuxtHub
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
│   └── copilot-instructions.md    # This file
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

````

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
import { ref, computed, onMounted } from 'vue';

// Props
interface Props {
  initialTitle?: string;
}

const { initialTitle = "Default Title" } = defineProps<Props>();

// Emits
interface Emits {
  (e: "update", value: string): void;
}

const emit = defineEmits<Emits>();

// State
const title = ref(initialTitle);
const count = ref(0);

// Computed
const doubleCount = computed(() => count.value * 2);

// Methods
function handleClick() {
  count.value++;
  emit('update', title.value);
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted');
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
  padding: 1rem;
  background-color: var(--color-background);
}
</style>
````

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

## Development Servers and Ports

### Active Services

| Service               | URL                   | Purpose            | Command                    |
| --------------------- | --------------------- | ------------------ | -------------------------- |
| **Nuxt Dev Server**   | http://localhost:3000 | Main application   | `pnpm dev`                 |
| **Prisma Studio**     | http://localhost:5555 | Database GUI       | `pnpm prisma:studio`       |
| **Production Server** | http://localhost:3000 | Production preview | `pnpm build && pnpm start` |

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
| `taze.config.ts`          | Taze configuration            |
| `prisma.config.ts`        | Prisma configuration          |
| `package.json`            | Dependencies and scripts      |
| `.env`                    | Environment variables (local) |

---

## Additional Resources

### Documentation

- **Nuxt 4**: https://nuxt.com/docs
- **Vue 3**: https://vuejs.org/guide/
- **Prisma**: https://www.prisma.io/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **NuxtUI**: https://ui.nuxt.com/docs
- **DaisyUI**: https://daisyui.com/components/
- **Discord API**: https://discord.com/developers/docs

### Project-Specific Docs

- **AGENTS.md**: Complete project conventions and standards
- **README.md**: Project overview and setup instructions
- **CHANGELOG.md**: Version history and changes

---

## Philosophy & Best Practices

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

When the project or this file has changed, the **Last Updated** date will be updated to reflect the current month and year.

---

**Last Updated**: October 2025
**Version**: 2.0.0
**Maintained by**: WolfStar Development Team

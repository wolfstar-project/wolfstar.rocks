# WolfStar.rocks Project Rules & Conventions

This document outlines the established project norms, conventions, and best practices for the WolfStar.rocks dashboard project.

## Table of Contents

- [Project Overview](#project-overview)
- [AI Development Tools](#ai-development-tools)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Code Style & Formatting](#code-style--formatting)
- [Vue.js Conventions](#vuejs-conventions)
- [TypeScript Guidelines](#typescript-guidelines)
- [API Development](#api-development)
- [Database Conventions](#database-conventions)
- [Styling Guidelines](#styling-guidelines)
- [Security Practices](#security-practices)
- [Performance Standards](#performance-standards)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [DevOps & Deployment](#devops--deployment)
- [Documentation Standards](#documentation-standards)

## Project Overview

**Project Name**: WolfStar.rocks Dashboard
**Version**: 2.0.0
**License**: Apache-2.0
**Description**: Official web dashboard for WolfStar, a powerful multi-purpose Discord bot

### Core Applications

- **WolfStar**: Primary Discord bot for moderation and logging
- **Staryl**: Social notifications bot for Twitch, Instagram, etc.

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

## Project Structure

```
wolfstar.rocks/
├── app/                    # Nuxt application code
│   ├── components/         # Vue components
│   │   └── *.vue          # Feature-specific components
│   ├── composables/       # Vue composables
│   ├── layouts/           # Nuxt layouts
│   ├── pages/             # File-based routing
│   ├── plugins/           # Nuxt plugins
│   ├── stores/            # Pinia stores
│   ├── types/             # Frontend type definitions
│   └── utils/             # Frontend utilities
├── server/                # Nitro server code
│   ├── api/               # API routes
│   ├── database/          # Database utilities
│   ├── middlewares/       # Server middlewares
│   ├── plugins/           # Server plugins
│   └── utils/             # Server utilities
├── shared/                # Shared code between client/server
│   ├── types/             # Shared type definitions
│   └── utils/             # Shared utilities
├── prisma/                # Database schema and migrations
├── .trae/rules/           # Project documentation and rules
└── config/                # Configuration files
```

### Directory Naming Conventions

- Use **kebab-case** for directories and files
- Use **PascalCase** for Vue components
- Use **camelCase** for TypeScript files and utilities

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
- **OpenAPI documentation** with `defineRouteMeta`
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

- ❌ `UserProfile.ts` for components → ✅ `UserProfile.vue`
- ❌ `guild-settings.vue` for components → ✅ `GuildSettings.vue`
- ❌ `AuthUtils.ts` for utilities → ✅ `auth-utils.ts`
- ❌ `guild_id` for variables (snake_case) → ✅ `guildId` (camelCase)
- ❌ `GuildId` for variables (PascalCase) → ✅ `guildId` (camelCase)
- ❌ `GUILD_ID` for variables → ✅ Use for constants only: `const MAX_RETRIES = 3`

### 2. Import Patterns

- ✅ Prefer Nuxt auto-imports for Vue, composables, and utilities
- ✅ Manually import third-party libraries
- ✅ Explicitly import from `~/shared/` for clarity

### 3. State Management

- ✅ Use **Pinia stores** for global state
- ✅ Use **composables** for reusable local logic
- ❌ Don't create reactive state at module level

### 4. API Routes

- ✅ Must be in `server/api/` directory to auto-register
- ✅ Use `.get.ts`, `.post.ts` suffixes for HTTP methods
- ✅ Always use `defineWrappedResponseHandler` for consistency
- ✅ Use camelCase for parameter names: `getRouterParam(event, 'guild')`
- ✅ Leverage `onSuccess` and `onError` options for logging

### 5. Database Migrations

- ✅ Use `prisma:push` for prototyping (no migration files)
- ✅ Use `prisma:migrate:dev` for production-ready changes
- ✅ Always run `prisma:generate` after schema changes

### 6. Vue Component Block Order

**Required order** (enforced by ESLint):

1. `<template>`
2. `<script>` (if needed)
3. `<script setup lang="ts">`
4. `<style>`
5. `<style scoped>`

### 7. Discord OAuth

- ✅ Redirect URI must exactly match Discord app settings
- ✅ Required scopes: `identify`, `guilds`
- ✅ Session management via nuxt-auth-utils

### 8. Rate Limiting

- ✅ Configured per endpoint in wrapped handlers
- ✅ Requires cache storage for state
- ✅ Uses `@tanstack/pacer` for implementation
- ✅ Supports both `"fixed"` and `"sliding"` window types
- ✅ Default: enabled with 5 requests per 10 seconds

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

# WolfStar.rocks Development Instructions

WolfStar.rocks is a modern Nuxt 4 full-stack web application serving as the official dashboard for **WolfStar** (Discord moderation bot) and **Staryl** (social notifications bot). Built with Vue 3, TypeScript, Prisma, and PostgreSQL, featuring Discord OAuth2 authentication and comprehensive guild management.

**Always reference these instructions first and fallback to search or documentation queries only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Initial Setup

- **Node.js**: 24+ (LTS)
- **Package Manager**: pnpm (required, not npm or yarn)
- **Database**: PostgreSQL

In the Copilot environment, PostgreSQL is automatically provided with pre-configured environment variables. The database is already created and seeded, dependencies are already installed, and the Prisma client is already generated.

### Build and Development Commands

**CRITICAL - Build Timeouts:**

- **NEVER CANCEL** build commands. Set timeout to 120+ minutes.
- Build takes 45-60 seconds normally but can take 90-120 seconds on first run.
- Always wait for builds to complete fully.

```bash
# Development server (NEVER CANCEL - takes 30+ seconds to start)
pnpm dev                        # Runs on http://localhost:3000 - TIMEOUT: 120+ seconds

# Production build (NEVER CANCEL - takes 45-60 seconds)
pnpm build                      # TIMEOUT: 120+ seconds

# Production server (requires build first)
pnpm start                      # Runs on http://localhost:3000
```

### Testing Commands

```bash
# All tests
pnpm test                       # Run all test suites with Vitest

# Specific test projects
pnpm test:nuxt                  # Nuxt-specific tests
pnpm test:browser               # Playwright browser tests (E2E)
pnpm test:browser:ui            # Browser tests with UI

# Coverage and watch
pnpm test -- --coverage         # Generate coverage report
pnpm test -- --watch            # Watch mode
```

### Quality Assurance Commands

```bash
# Linting (comprehensive check)
pnpm lint                       # Takes ~30 seconds - warnings expected, no errors

# Linting with auto-fix
pnpm lint:fix                   # Automatically fixes fixable issues

# Type checking
pnpm typecheck                  # Takes ~22 seconds

# Code formatting
pnpm format                     # Formats all files with oxfmt

# Prisma validation
pnpm prisma:validate            # Takes ~1.5 seconds
```

### Database Tools

```bash
# Database visual editor
pnpm prisma:studio              # Runs on http://localhost:5555

# Schema synchronization (development only)
pnpm prisma:push                # Push schema changes without migration

# Migration management
pnpm prisma:migrate:dev         # Create and apply migration
pnpm prisma:generate            # Regenerate Prisma client after schema edits
```

## Workflows

### Database Schema Development Workflow

1. **Prototyping Phase:**

    ```bash
    # Make changes to server/database/schema.prisma
    pnpm prisma:push              # Push changes to database (no migration)
    pnpm dev                      # Test changes
    # Iterate and repeat until satisfied
    ```

2. **Migration Creation:**

    ```bash
    pnpm prisma:migrate:dev       # Generate migration file from schema changes
    pnpm prisma:generate          # Regenerate Prisma client
    ```

### API Endpoint Development

- Routes go under `server/api/` with HTTP suffix (`.get.ts`, `.post.ts`)
- Always wrap handlers with `defineWrappedResponseHandler` for auth + rate limiting
- Use `createError` for error responses with proper status codes
- Use `onSuccess`/`onError` callbacks for logging

### Feature Development

```bash
pnpm dev                        # Start dev server
# Make changes, verify in browser at http://localhost:3000
pnpm lint:fix                   # Auto-fix linting issues
pnpm typecheck                  # Check TypeScript types
pnpm build                      # Validate production build
git commit -m "feat(scope): description"
```

## Validation Scenarios

**ALWAYS manually validate changes using these complete user scenarios:**

### Scenario 1: Basic Application Functionality

1. Start development server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Verify homepage loads correctly
4. Check browser console for critical errors (warnings are expected)

### Scenario 2: Auth and Guild Changes

1. Run `pnpm dev`, complete Discord login
2. Ensure guild dashboards load without console errors
3. Run unit tests: `pnpm test`

### Scenario 3: Production Build Validation

1. Build application: `pnpm build`
2. Start production server: `pnpm start`
3. Verify application loads correctly

## Technology Stack and Architecture

- **Frontend:** Nuxt 4, Vue 3, TypeScript, Composition API with `<script setup lang="ts">`
- **Styling:** TailwindCSS + DaisyUI + Nuxt UI; tokens in `app/themes`
- **Backend:** Nitro server, RESTful API routes
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Discord OAuth2 via nuxt-auth-utils (`identify` + `guilds` scopes); custom auth module in `modules/auth/`
- **Testing:** Vitest for unit/component, Playwright for E2E
- **Linting:** oxlint + oxfmt (Rust-based, 10-100x faster than ESLint)
- **Deployment:** Cloudflare/NuxtHub; Sentry for error tracking
- **CI/CD:** GitHub Actions (build/lint/typecheck on PRs)

## Important Directory Structure

```
app/                            # Nuxt application (client-side)
  components/                   # Vue components (PascalCase)
  composables/                  # Vue composables for reactive state
  layouts/                      # Page layouts (default, dashboard)
  pages/                        # File-based routing
  plugins/                      # Nuxt plugins
  themes/                       # UI theme configurations
  utils/                        # Frontend utilities
server/                         # Nitro server (backend)
  api/                          # API routes (auto-registered)
    auth/                       # Auth endpoints
    guilds/                     # Guild endpoints
    users/                      # User endpoints
  database/                     # Prisma schema, migrations, client
  plugins/                      # Server plugins
  utils/                        # Server utilities (discord, rate-limiting, transformers)
shared/                         # Isomorphic code (client + server)
  types/                        # Shared type definitions
  utils/                        # Shared utilities (logger, abilities)
test/
  unit/                         # Vitest unit tests
  nuxt/                         # Nuxt component tests
  e2e/                          # Playwright E2E tests
```

## Core Patterns

### API Handlers

Always use `defineWrappedResponseHandler` (or `defineWrappedCachedResponseHandler` for cached responses). This provides auth, rate limiting, and consistent error handling.

### Vue Components

- Composition API exclusively with `<script setup lang="ts">`
- Lean on Nuxt auto-imports instead of manual Vue/Nuxt imports
- Block order: template -> script -> script setup -> styles
- Never create reactive state at module scope; use composables in `app/composables/`

### Naming Conventions

| Type             | Convention       | Example                 |
| ---------------- | ---------------- | ----------------------- |
| Directories      | kebab-case       | `guild-settings/`       |
| TypeScript files | kebab-case       | `auth-utils.ts`         |
| Vue Components   | PascalCase       | `GuildSettings.vue`     |
| API Routes       | kebab-case       | `guild-settings.get.ts` |
| Variables        | camelCase        | `guildId`, `isLoading`  |
| Constants        | UPPER_SNAKE_CASE | `API_BASE_URL`          |
| Types/Interfaces | PascalCase       | `GuildSettings`         |

## Pre-commit Checklist

Before committing changes, always run:

1. `pnpm build` - Must build successfully
2. `pnpm lint` - Fix any errors, warnings are acceptable
3. `pnpm typecheck` - Must pass without errors
4. `pnpm test` - All tests must pass

Commit messages must follow Conventional Commits: `<type>(<scope>): <subject>`

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `types`

Husky + lint-staged automatically run oxlint/oxfmt on staged files and validate commit messages.

The CI pipeline (`.github/workflows/continuous-integration.yml`) will fail if linting, type checking, building, or tests fail.

## Development Servers and Ports

- **Main application:** http://localhost:3000 (dev server)
- **Prisma Studio:** http://localhost:5555 (database management)

Always ensure ports are available before starting services. The development server includes hot reload and will automatically reflect code changes.

## Troubleshooting

- **Build issues:** Clear `.nuxt`, `.output`, and `node_modules/.cache`, then rebuild
- **Prisma types stale:** Run `pnpm prisma:generate` after schema changes
- **OAuth redirect fails:** Ensure `.env` `NUXT_OAUTH_DISCORD_REDIRECT_URI` matches Discord Developer Portal exactly
- **Hot reload broken:** Check file watcher limits on Linux, restart dev server
- **Type errors after updates:** Run `pnpm nuxt prepare && pnpm prisma:generate`

**When in doubt:** Copy existing patterns from similar files (e.g., `server/api/guilds/**`, `app/components/discord/**`) before inventing new ones.

# WolfStar.rocks Development Instructions

WolfStar.rocks is a modern Nuxt 4 full-stack web application serving as the dashboard for WolfStar and Staryl Discord bots. It's built with Vue 3, TypeScript, Prisma and PostgreSQL, featuring Discord OAuth2 authentication and comprehensive guild management.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Initial Setup

PostgreSQL and Redis services are automatically provided with pre-configured environment variables in the Copilot environment. The database is already created and seeded.
The dependencies are already installed via pnpm.

### Build and Development Commands

**CRITICAL - Build Timeouts:**

- **NEVER CANCEL** build commands. Set timeout to 120+ minutes.
- Build takes 45-60 seconds normally but can take longer on first run.
- Always wait for builds to complete fully.

```bash
# Development server (NEVER CANCEL - takes 30+ seconds to start)
pnpm dev                        # Runs on http://localhost:3000 - TIMEOUT: 120+ seconds

# Production build (NEVER CANCEL - takes 45-60 seconds)
pnpm build                      # TIMEOUT: 120+ seconds

# Production server (requires build first)
pnpm start                      # Runs on http://localhost:3000
```

### Quality Assurance Commands

```bash
# Linting (comprehensive check)
pnpm lint                       # Takes ~30 seconds - warnings expected, no errors

# Type checking
pnpm typecheck                  # Takes ~22 seconds

# Prisma validation
pnpm prisma:validate            # Takes ~1.5 seconds
```

### Additional Development Tools

```bash
# Database visual editor
pnpm prisma:studio              # Runs on http://localhost:5555

# Database operations
pnpm prisma:push                # Push schema changes to dev DB
pnpm prisma:migrate:dev         # Create and apply new migration
pnpm prisma:generate            # Regenerate Prisma client

# Development with PWA support
pnpm dev:pwa                    # Dev server with PWA features
```

## Workflows

### Database Schema Development Workflow

1. **Prototyping Phase:**

   ```bash
   # Make changes to server/database/schema.prisma

   pnpm prisma:push            # Push changes to database (no migration)
   # Iterate and test changes
   ```

2. **Migration Creation:**
   ```bash
   pnpm prisma:migrate:dev     # Generate migration file from schema changes
   ```

### Discord Bot Integration Development

- OAuth2 configuration in `server/utils/discord.ts`
- Guild permissions checked via `manageAbility` utility
- Rate limiting via `@tanstack/pacer` in wrapped handlers
- Session management via nuxt-auth-utils

## Validation Scenarios

**ALWAYS manually validate changes using these complete user scenarios:**

### Scenario 1: Basic Dashboard Functionality

1. Start development server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Verify homepage loads with WolfStar branding
4. Test Discord OAuth login flow
5. Verify guild list loads after authentication
6. Check browser console for critical errors (warnings are expected)

### Scenario 2: Full Development Workflow

1. Make code changes to components or pages
2. Verify that it works in the browser

### Scenario 3: Production Build Validation

1. Build application: `pnpm build`
2. Start production server: `pnpm start`
3. Verify application loads correctly
4. Test Discord authentication and guild functionality

## Technology Stack and Architecture

- **Frontend**: Nuxt 4, Vue 3 Composition API, TypeScript
- **Styling**: TailwindCSS, DaisyUI, shadcn/ui components
- **Backend**: Nitro server, Prisma ORM, PostgreSQL
- **Cache**: Redis for sessions and rate limiting
- **Authentication**: Discord OAuth2 via nuxt-auth-utils
- **Testing**: Vitest for unit/integration tests
- **Deployment**: Cloudflare Pages with NuxtHub

## Important Directory Structure

```
/app/                    # Nuxt application code (frontend)
  /components/           # Vue components
  /composables/          # Vue composables
  /layouts/              # Page layouts
  /pages/                # File-based routing
  /stores/               # Pinia stores
  /themes/               # UI theme configurations
/server/                 # Nitro server code (backend)
  /api/                  # API routes
  /database/             # Prisma schema and utilities
    /migrations          # Prisma migrations
    /schema.prisma       # Database schema definition
  /middlewares/          # Server middlewares
  /plugins/              # Server plugins
  /utils/                # Server utilities
/shared/                 # Shared code between client/server
  /types/                # Shared type definitions
  /utils/                # Shared utilities
/.github/workflows/      # CI/CD pipeline configuration
```

## Pre-commit Checklist

Before committing changes, always run:

2. `pnpm build` - Must build successfully
3. `pnpm lint` - Fix any errors, warnings are acceptable
4. `pnpm typecheck` - Must pass without errors (optional)

The CI pipeline (.github/workflows/continuous-integration.yml) will fail if linting, type checking, building, or core tests fail.

## Development Servers and Ports

- **Main application**: http://localhost:3000 (dev server)
- **Prisma Studio**: http://localhost:5555 (database management)

Always ensure ports are available before starting services. The development server includes hot reload and will automatically reflect code changes.

## Core Development Patterns

### API Development with Wrapped Handlers

**Always use** `defineWrappedResponseHandler` for API endpoints:

```typescript
export default defineWrappedResponseHandler(async (event) => {
  // Your handler logic
}, {
  auth: true, // Require Discord authentication
  rateLimit: { enabled: true, window: 10000, limit: 5 }
});
```

### Vue Component Structure

Follow this specific order in `.vue` files:

1. `<template>` - Template content
2. `<script>` - Regular script (if needed)
3. `<script setup lang="ts">` - Composition API setup
4. `<style>` - Non-scoped styles
5. `<style scoped>` - Scoped styles

### Authentication Patterns

- Use `requireUserSession(event)` in server handlers for auth
- Frontend auth state managed via nuxt-auth-utils
- Session contains Discord user data and OAuth tokens
- Guild permissions via `manageAbility` utility

### Database with Prisma

- **Always run migrations**: `pnpm prisma:migrate:dev` after schema changes
- Use ESM format for generated Prisma client
- Database models use PascalCase, fields use camelCase
- Preview features: driver adapters, query compiler, JSON types

## Discord Bot Integration

This dashboard manages settings for **WolfStar** (moderation) and **Staryl** (social notifications) Discord bots:

- **Guild Management**: Server-specific settings and permissions
- **OAuth Scopes**: `identify guilds` for user auth, `bot` for invitations
- **Permissions**: Use `manageAbility` to check guild management rights
- **Rate Limiting**: Built into wrapped handlers

## Styling Conventions

### TailwindCSS + DaisyUI

- Use **DaisyUI components** for consistent theming: `btn`, `card`, `modal`
- **Semantic colors**: `primary`, `secondary`, `accent`, `base-100`
- **Responsive design**: `sm:`, `lg:` prefixes for breakpoints
- Theme switching via `data-theme` attribute

## Error Handling & Monitoring

- **Sentry integration** for production error tracking
- **H3 errors** in server handlers: `throw createError({ statusCode: 400, message: "..." })`
- **Console logging** via `useLogger("@wolfstar/component-name")`
- **Rate limiting** via `@tanstack/pacer`

## Common Gotchas

1. **File naming**: Use kebab-case for files, PascalCase for Vue components
2. **Imports**: Use auto-imports; avoid manual imports when possible
3. **State management**: Prefer Pinia stores for global state, composables for local logic
4. **API routes**: Must be in `server/api/` directory to be auto-registered
5. **Environment presets**: Code adapts to Cloudflare Pages vs Node.js deployment
6. **Database migrations**: Always run after schema changes
7. **Discord OAuth**: Requires proper scopes and redirect URI configuration
8. **Rate limiting**: Configured per endpoint in wrapped handlers

This codebase emphasizes **type safety**, **developer experience**, and **Discord integration**. Always reference existing patterns in similar files when implementing new features.

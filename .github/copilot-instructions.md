# WolfStar.rocks Copilot Instructions

This is the official web dashboard for WolfStar, a Discord bot built with Nuxt 4. This document contains essential patterns and conventions for AI coding agents working on this project.

## Architecture Overview

This is a **Nuxt 4 full-stack application** with the following key components:
- **Frontend**: Vue 3 Composition API with TypeScript, TailwindCSS + DaisyUI + NuxtUI
- **Backend**: Nitro server with Prisma ORM and PostgreSQL database
- **Auth**: Discord OAuth2 via nuxt-auth-utils with JWT sessions
- **Deployment**: Cloudflare Pages with NuxtHub for full-stack hosting

### Directory Structure Patterns
- `app/` - Nuxt application code (frontend)
- `server/` - Nitro server code (backend APIs)
- `shared/` - Code shared between client/server
- `prisma/` - Database schema and migrations

## Core Development Patterns

### API Development with Wrapped Handlers
**Always use** `defineWrappedResponseHandler` for API endpoints in `server/api/`:

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

### Database with Prisma
- **Always run migrations**: `pnpm prisma:migrate:dev` after schema changes
- Use ESM format for generated Prisma client
- Database models use PascalCase, fields use camelCase

## Key Development Commands

```bash
# Development
pnpm dev                    # Start dev server with hot reload
pnpm dev:pwa               # Dev server with PWA support

# Database
pnpm prisma:migrate:dev    # Apply migrations in development
pnpm prisma:studio         # Open Prisma Studio GUI
pnpm prisma:generate       # Regenerate Prisma client

# Code Quality
pnpm lint                  # Run ESLint
pnpm typecheck            # TypeScript type checking
```

## Discord Bot Integration

This dashboard manages settings for **WolfStar** (moderation) and **Staryl** (social notifications) Discord bots. Key concepts:

- **Guild Management**: Server/guild-specific settings and permissions
- **OAuth Scopes**: `identify guilds` for user auth, `bot` for guild invitations  
- **Permissions**: Use `manageAbility` to check if user can manage guild settings
- **Rate Limiting**: Built into wrapped handlers via `@tanstack/pacer`

## Styling Conventions

### TailwindCSS + DaisyUI
- Use **DaisyUI components** for consistent theming: `btn`, `card`, `modal`, etc.
- **Semantic colors**: `primary`, `secondary`, `accent`, `base-100` (auto-adapt to themes)
- **Responsive design**: `sm:`, `lg:` prefixes for breakpoints
- Theme switching via `data-theme` attribute on `<html>`

### Component Variants
Use `tailwind-variants` for component variants:
```typescript
import { tv } from 'tailwind-variants';

const button = tv({
  base: "btn",
  variants: {
    color: {
      primary: "btn-primary",
      secondary: "btn-secondary"
    }
  }
});
```

## Error Handling & Monitoring

- **Sentry integration** for production error tracking
- **H3 errors** in server handlers: `throw createError({ statusCode: 400, message: "..." })`
- **Console logging** via `useLogger("@wolfstar/component-name")`

## Environment & Configuration

### Runtime Config Pattern
Environment variables defined in `server/utils/runtimeConfig.ts` and accessed via:
```typescript
const config = useRuntimeConfig();
```

### Development vs Production
- **Development**: OpenAPI docs at `/api/docs`, debug logging enabled
- **Production**: CSP headers, rate limiting, Cloudflare analytics

## Testing & Quality Assurance

- **ESLint**: `@antfu/eslint-config` with Nuxt-specific rules
- **TypeScript**: Strict mode enabled with auto-imports
- **Pre-commit hooks**: Husky + lint-staged for code quality
- **Conventional commits**: Required for all commits

## Special Files & Patterns

- **Route middleware**: Use `definePageMeta()` for auth requirements
- **Composables**: Shared logic in `app/composables/` with `createSharedComposable()`
- **Server utils**: Helper functions in `server/utils/` for API logic
- **Type definitions**: Shared types in `shared/types/`

## Common Gotchas

1. **File naming**: Use kebab-case for files, PascalCase for Vue components
2. **Imports**: Use auto-imports; avoid manual import statements when possible
3. **State management**: Prefer Pinia stores for global state, composables for local logic
4. **API routes**: Must be in `server/api/` directory to be auto-registered
5. **Environment presets**: Code adapts to Cloudflare Pages vs Node.js deployment

This codebase emphasizes **type safety**, **developer experience**, and **Discord integration**. Always reference existing patterns in similar files when implementing new features.

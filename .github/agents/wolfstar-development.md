# WolfStar Development Agent

**Description**: Expert agent for WolfStar.rocks dashboard development using Nuxt 4, Vue 3, TypeScript, Prisma, and PostgreSQL

**Capabilities**:
- Full-stack Nuxt 4 development with Vue 3 Composition API
- TypeScript development with strict mode
- Prisma ORM database operations
- Discord OAuth2 integration
- TailwindCSS + DaisyUI styling
- API development with wrapped handlers
- State management with Pinia

## Instructions

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

## Quick Start

### Prerequisites

- **Node.js**: 22+ (LTS)
- **Package Manager**: pnpm (required, not npm or yarn)
- **Database**: PostgreSQL (auto-provided in Copilot environment)

### First Command

```bash
pnpm dev
# Development server starts on http://localhost:3000
# Cold start: ~30-60 seconds (normal behavior)
```

## Development Commands

### Core Development

```bash
# Development server (hot reload enabled)
pnpm dev                        # Runs on http://localhost:3000

# Production build (for deployment validation)
pnpm build                      # TIMEOUT: 120+ seconds

# Production server (requires build first)
pnpm start                      # Runs on http://localhost:3000
```

### Quality Assurance

```bash
# Linting
pnpm lint                       # Check for errors
pnpm lint:fix                   # Auto-fix issues

# Type checking
pnpm typecheck                  # Must pass without errors

# Code formatting
pnpm format                     # Formats all files with Prettier

# Commit message validation
pnpm commitlint --from HEAD~1 --to HEAD --verbose
```

### Database Management

```bash
# Database visual editor (Prisma Studio)
pnpm prisma:studio              # Runs on http://localhost:5555

# Schema synchronization (development only)
pnpm prisma:push                # Push schema changes without migration

# Migration management
pnpm prisma:migrate:dev         # Create and apply migration
pnpm prisma:generate            # Regenerate Prisma client
```

## Quality Assurance & Pre-commit Checklist

**ALWAYS run these commands before committing:**

1. **Build Validation**: `pnpm build`
2. **Linting**: `pnpm lint` (fix errors, warnings acceptable)
3. **Type Checking**: `pnpm typecheck` (must pass)
4. **Commit Message Validation**: `pnpm commitlint --from HEAD~1 --to HEAD --verbose`

### Commit Message Format

**Standard**: Conventional Commits with commitlint

**Format**: `<type>(<scope>): <subject>`

**Allowed Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, types

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

# ❌ Bad examples
Add feature                     # Missing type
feat: Add feature               # Subject not lowercase
feat!: breaking change          # Exclamation mark not allowed
```

## Technology Stack

### Frontend
- **Framework**: Nuxt 4 with Vue 3 Composition API
- **TypeScript**: Full TypeScript support with strict mode
- **Styling**: TailwindCSS + DaisyUI + NuxtUI components
- **State Management**: Pinia stores
- **Authentication**: nuxt-auth-utils with Discord OAuth2

### Backend
- **Runtime**: Node.js 22+ with Nitro server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Discord OAuth2 with JWT sessions
- **API**: RESTful APIs with wrapped handlers
- **Rate Limiting**: @tanstack/pacer

## Project Structure

```
wolfstar.rocks/
├── app/                           # Nuxt application (client-side)
│   ├── components/                # Vue components (PascalCase)
│   ├── composables/               # Vue composables
│   ├── pages/                     # File-based routing
│   ├── stores/                    # Pinia stores
│   └── utils/                     # Frontend utilities
│
├── server/                        # Nitro server (backend)
│   ├── api/                       # API routes
│   ├── database/                  # Database utilities
│   │   ├── schema.prisma          # Database schema
│   │   └── client.ts              # Prisma client singleton
│   └── utils/                     # Server utilities
│
├── shared/                        # Shared code (client + server)
│   ├── types/                     # Shared type definitions
│   └── utils/                     # Shared utilities
│
└── .github/                       # GitHub configuration
    ├── workflows/                 # CI/CD workflows
    └── copilot-instructions.md    # Copilot instructions
```

## File Naming Conventions

| Type             | Convention       | Example                                |
| ---------------- | ---------------- | -------------------------------------- |
| Vue Components   | PascalCase       | `UserProfile.vue`, `GuildSettings.vue` |
| TypeScript Files | kebab-case       | `auth-utils.ts`, `discord-api.ts`      |
| API Routes       | kebab-case       | `guild-settings.get.ts`                |
| Directories      | kebab-case       | `guild-settings/`, `user-profile/`     |
| Variables        | camelCase        | `guildId`, `userName`, `isLoading`     |
| Constants        | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES`          |

## Core Development Patterns

### 1. API Development with Wrapped Handlers

**⚠️ ALWAYS use `defineWrappedResponseHandler` for API endpoints**

```typescript
// server/api/guilds/[guild]/settings.get.ts
export default defineWrappedResponseHandler(
  async (event) => {
    const guildId = getRouterParam(event, "guild");
    
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
    auth: true,
    rateLimit: {
      enabled: true,
      window: 10000,
      limit: 5,
      type: "fixed"
    }
  }
);
```

### 2. Vue Component Structure

**Required Order** (enforced by ESLint):

```vue
<!-- 1. Template (always first) -->
<template>
  <div class="container">
    <h1>{{ title }}</h1>
  </div>
</template>

<!-- 2. Setup script (main logic) -->
<script setup lang="ts">
// Use Nuxt auto-imports
const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<!-- 3. Scoped styles (component-specific) -->
<style scoped>
.container {
  padding: 1rem;
}
</style>
```

### 3. Authentication Patterns

**Server-Side Authentication**:

```typescript
export default defineWrappedResponseHandler(
  async (event) => {
    const session = await requireUserSession(event);
    const userId = session.user.id;
    // Your logic here
  },
  { auth: true }
);
```

**Client-Side Authentication**:

```vue
<script setup lang="ts">
const { loggedIn, user } = useUserSession();

if (!loggedIn.value) {
  navigateTo("/auth/login");
}
</script>
```

### 4. Database Patterns with Prisma

```typescript
// Always use this import
import { prisma } from "~/server/database/client";

// Usage in API routes
const guilds = await prisma.guild.findMany({
  where: { userId: session.user.id },
  include: { settings: true }
});
```

### 5. State Management with Pinia

```typescript
// app/stores/guild.ts
export const useGuildStore = defineStore("guild", () => {
  const guilds = ref<Guild[]>([]);
  const loading = ref(false);
  
  async function fetchGuilds() {
    loading.value = true;
    try {
      const { data } = await useFetch("/api/guilds");
      guilds.value = data.value || [];
    } finally {
      loading.value = false;
    }
  }
  
  return { guilds, loading, fetchGuilds };
});
```

## Common Gotchas

1. **File Naming**: Components use PascalCase, utilities use kebab-case
2. **Auto-imports**: Don't import Vue composables manually, Nuxt provides them
3. **API Routes**: Must be in `server/api/` with proper HTTP suffixes (`.get.ts`, `.post.ts`)
4. **Database**: Always run `pnpm prisma:generate` after schema changes
5. **Vue Block Order**: Template → Script → Script Setup → Styles
6. **Variables**: Use camelCase (e.g., `guildId`), not snake_case (`guild_id`)
7. **Rate Limiting**: Built into wrapped handlers, ensure proper configuration
8. **Discord OAuth**: Ensure redirect URIs match in `.env` and Discord Developer Portal

## Troubleshooting

### Development Server Won't Start
```bash
rm -rf .nuxt .output node_modules/.cache
pnpm install
pnpm prisma:generate
pnpm dev
```

### Build Fails
- Wait longer (first builds: 90-120 seconds)
- Clear caches: `rm -rf .nuxt .output node_modules/.cache`

### Type Errors After Updates
```bash
pnpm nuxt prepare
pnpm prisma:generate
pnpm typecheck
```

## Philosophy

This codebase emphasizes:
- ✅ **Type Safety** - Full TypeScript with strict mode
- ✅ **Developer Experience** - Fast hot reload, auto-imports
- ✅ **Discord Integration** - Seamless OAuth and bot management
- ✅ **Code Quality** - Automated linting, formatting, testing
- ✅ **Performance** - Optimized builds, efficient caching
- ✅ **Security** - Proper authentication, authorization, rate limiting

**When in doubt**: Copy existing patterns from similar files before inventing new ones.

# WolfStar.rocks Project Rules & Conventions

This document outlines the established project norms, conventions, and best practices for the WolfStar.rocks dashboard project.

## Table of Contents

- [Project Overview](#project-overview)
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
- **Caching**: Redis for rate limiting and caching

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
│   │   ├── ui/            # Reusable UI components
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
<!-- Regular script -->
</script>

<script setup lang="ts">
<!-- Setup script -->
</script>

<style>
<!-- Non-scoped styles -->
</style>

<style scoped>
<!-- Scoped styles -->
</style>
```

### Commit Conventions
- Follow **Conventional Commits** standard
- Use **commitlint** with @commitlint/config-conventional
- Pre-commit hooks with **Husky** and **lint-staged**

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
- **Variables**: camelCase with auxiliary verbs (e.g., `isLoading`, `hasError`)

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
export interface UserData { ... }
export type UserRole = 'admin' | 'user';

// Default exports for components
export default defineComponent({ ... });

// Re-exports for barrel files
export * from './types';
export { default as Component } from './Component.vue';
```

## API Development

### Route Structure
- **File-based routing** in `server/api/`
- **RESTful conventions** for endpoints
- **OpenAPI documentation** with `defineRouteMeta`
- **Proper HTTP status codes** and error handling

### Authentication & Authorization
- **Discord OAuth2** integration
- **JWT sessions** with nuxt-auth-utils
- **Role-based access control** via authorization resolver
- **Rate limiting** with @tanstack/pacer

### Error Handling
```typescript
// Wrapped event handlers for consistent error handling
export default defineWrappedResponseHandler(
  async (event) => {
    // Handler logic
  },
  {
    auth: true,
    rateLimit: { enabled: true, window: 10000, limit: 5 }
  }
);
```

### API Patterns
- Use **wrapped event handlers** for consistency
- Implement **proper validation** with Zod or similar
- Use **transformers** for data serialization
- Follow **REST conventions** for resource endpoints

## Database Conventions

### Prisma Schema
- **PostgreSQL** as primary database
- **ESM module format** for generated client
- **Driver adapters** and **query compiler** preview features
- **JSON types** with prisma-json-types-generator

### Naming Conventions
- **PascalCase** for model names
- **camelCase** for field names
- **snake_case** for mapped database columns — avoid kebab-case (hyphens) because they require quoting and can cause issues with PostgreSQL/Prisma and other tooling.
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
- **Caching strategies** with Redis
- **Rate limiting** to prevent abuse
- **Efficient serialization** with transformers

### Core Web Vitals
- **LCP**: Optimize largest contentful paint
- **FID**: Minimize first input delay
- **CLS**: Prevent cumulative layout shift
- **PWA support** with @vite-pwa/nuxt

## Testing & Quality Assurance

### Code Quality
- **ESLint** for code linting
- **TypeScript** for type checking
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

### Testing Strategy
- **Unit tests** for utilities and composables
- **Component tests** for Vue components
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows

### Continuous Integration
- **GitHub Actions** for CI/CD
- **Automated testing** on pull requests
- **Code coverage** reporting
- **Dependency vulnerability** scanning

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

## Enforcement

These conventions are enforced through:
- **Automated linting** with ESLint
- **Type checking** with TypeScript
- **Pre-commit hooks** with Husky
- **CI/CD pipeline** checks
- **Code review** requirements

## Updates

This document should be updated when:
- New conventions are established
- Technology stack changes
- Architecture decisions are made
- Best practices evolve

**Last Updated**: January 2025  
**Version**: 1.0.0

# Contributing to WolfStar.rocks

Thank you for your interest in contributing to WolfStar.rocks! This guide will help you get started with development.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Guidelines](#code-guidelines)
- [Submitting Changes](#submitting-changes)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please read it before contributing.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22+ (LTS)
- **pnpm** 10+ (required - not npm or yarn)
- **PostgreSQL** 14+
- **Discord Bot Application** ([Create one](https://discord.com/developers/applications/))

### Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/wolfstar.rocks.git
   cd wolfstar.rocks
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and configure:

   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NUXT_OAUTH_DISCORD_CLIENT_ID` - Discord OAuth client ID
   - `NUXT_OAUTH_DISCORD_CLIENT_SECRET` - Discord OAuth client secret
   - `NUXT_SESSION_PASSWORD` - Random 32+ character string

4. **Set up the database**

   ```bash
   pnpm prisma:push          # Sync schema to database
   pnpm prisma:seed          # Seed with test data (optional)
   ```

5. **Start development server**

   ```bash
   pnpm dev                  # Runs on http://localhost:3000
   ```

## 💻 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feat/your-feature-name
```

Branch naming convention:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `style/` - Code style changes
- `perf/` - Performance improvements

### 2. Make Your Changes

Follow our [code guidelines](#code-guidelines) and test your changes locally.

### 3. Run Quality Checks

Before committing, always run:

```bash
pnpm lint:fix              # Fix linting issues
pnpm typecheck             # Check TypeScript types
pnpm build                 # Validate production build
```

All checks must pass without errors.

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(component): add new feature"
```

Format: `<type>(<scope>): <subject>`

**Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `types`

**Examples**:

- ✅ `feat(auth): implement Discord OAuth2 flow`
- ✅ `fix(api): resolve guild data fetching issue`
- ✅ `docs: update installation instructions`
- ❌ `Add feature` (missing type)
- ❌ `feat: Add feature` (subject not lowercase)

> **Note**: Husky git hooks will automatically validate your commits and run linters.

## 📝 Code Guidelines

### TypeScript & Vue

- Use **TypeScript** with strict mode
- Use **Vue 3 Composition API** with `<script setup>`
- Type all props, emits, and function signatures
- Follow the project's ESLint configuration (@antfu/eslint-config)

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.vue`)
- **Utilities/Composables**: kebab-case (e.g., `auth-utils.ts`)
- **API Routes**: kebab-case with method suffix (e.g., `guild-settings.get.ts`)

### Component Structure

Required order (enforced by ESLint):

1. `<template>`
2. `<script>` (if needed)
3. `<script setup lang="ts">`
4. `<style>`
5. `<style scoped>`

### API Routes

Always use `defineWrappedResponseHandler`:

```typescript
// server/api/guilds/[guild]/settings.get.ts
export default defineWrappedResponseHandler(
  async (event) => {
    const guildId = getRouterParam(event, "guild");

    const settings = await prisma.guild.findUnique({
      where: { id: guildId }
    });

    return settings;
  },
  {
    auth: true,              // Require authentication
    rateLimit: {
      enabled: true,
      window: 10000,         // 10 seconds
      limit: 5               // 5 requests per window
    }
  }
);
```

### Database Changes

**For prototyping** (development only):

```bash
pnpm prisma:push
```

**For production-ready changes**:

```bash
pnpm prisma:migrate:dev     # Creates migration file
```

Always commit migration files with descriptive names.

## 📤 Submitting Changes

### Pull Request Process

1. **Push your branch**

   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title following Conventional Commits format
   - Description of what changed and why
   - Screenshots/videos for UI changes
   - Link to related issue (if applicable)

3. **Respond to feedback** from reviewers

4. **Ensure CI passes** - All automated checks must pass

### PR Requirements

- ✅ Code follows our style guidelines
- ✅ All tests pass
- ✅ Build succeeds without errors or warnings
- ✅ Changes are documented (if applicable)
- ✅ Commit messages follow Conventional Commits
- ✅ No merge conflicts with main branch

### Review Process

- PRs require at least one approval from a maintainer
- Changes may be requested - please address them promptly
- Once approved, a maintainer will merge your PR

---

**Thank you for contributing to WolfStar.rocks! 🎉**

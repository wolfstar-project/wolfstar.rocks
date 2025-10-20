# Contributing to WolfStar.rocks

Thank you for your interest in contributing to WolfStar.rocks! This document provides guidelines and instructions for contributing to the project.

**Have a question?** Join our [Discord Server](https://join.wolfstar.rocks)!

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

---

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to:

- ✅ Be respectful and inclusive
- ✅ Provide constructive feedback
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other community members
- ❌ Avoid harassment, trolling, or discriminatory language

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 22+ (LTS version)
- **pnpm** (required package manager, not npm or yarn)
- **PostgreSQL** (local installation or Docker)
- **Git** with proper configuration
- **Code Editor** (VS Code recommended with ESLint and Prettier extensions)

### Initial Setup

1. **Fork the repository**

   ```bash
   # Visit https://github.com/wolfstar-project/wolfstar.rocks
   # Click "Fork" button in the top right
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/wolfstar.rocks.git
   cd wolfstar.rocks
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/wolfstar-project/wolfstar.rocks.git
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Setup environment variables**

   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env with your configuration
   # Required variables:
   # - DATABASE_URL (PostgreSQL connection string)
   # - NUXT_OAUTH_DISCORD_CLIENT_ID
   # - NUXT_OAUTH_DISCORD_CLIENT_SECRET
   # - NUXT_OAUTH_DISCORD_REDIRECT_URI
   ```

6. **Setup Discord OAuth**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create or select your bot application
   - Navigate to OAuth2 tab
   - Add redirect URLs:
     - `http://localhost:3000/auth/discord/callback`
   - Copy Client ID and Client Secret to your `.env` file

7. **Setup database**

   ```bash
   # Run migrations
   pnpm prisma:migrate:dev
   ```

8. **Start development server**

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

### Development Workflow

```bash
# Start dev server
pnpm dev

# Run linting
pnpm lint
pnpm lint:fix

# Run type checking
pnpm typecheck

# Build for production
pnpm build

# View database with Prisma Studio
pnpm prisma:studio
```

---

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**

1. Check [existing issues](https://github.com/wolfstar-project/wolfstar.rocks/issues) to avoid duplicates
2. Ensure you're using the latest version
3. Verify the bug is reproducible

**When submitting a bug report, include:**

- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots/error messages (if applicable)
- Environment details (OS, Node version, browser)
- Relevant code snippets

**Use the bug report template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- OS: [e.g., Windows 11]
- Node: [e.g., 22.0.0]
- Browser: [e.g., Chrome 120]
```

### Suggesting Features

**Before suggesting a feature:**

1. Check if it already exists or is planned
2. Ensure it aligns with project goals
3. Consider if it benefits the broader community

**When suggesting a feature, include:**

- Clear, descriptive title
- Detailed description of the feature
- Use cases and benefits
- Possible implementation approach
- Mockups/examples (if applicable)

### Submitting Pull Requests

**Pull Request Workflow:**

1. **Create a feature branch**

   ```bash
   git checkout -b feat/my-new-feature
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Follow the [Development Guidelines](#development-guidelines)
   - Write clear, maintainable code
   - Add/update tests if applicable
   - Update documentation if needed

3. **Commit your changes**

   ```bash
   # Husky will automatically:
   # - Run lint-staged (ESLint + Prettier on staged files)
   # - Validate commit message format

   git add .
   git commit -m "feat: add new feature"
   ```

4. **Keep your branch updated**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push to your fork**

   ```bash
   git push origin feat/my-new-feature
   ```

6. **Create Pull Request**
   - Go to [Pull Requests](https://github.com/wolfstar-project/wolfstar.rocks/pulls)
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Link related issues

---

## Development Guidelines

### Code Style

**This project uses:**

- **ESLint** with `@antfu/eslint-config` for linting
- **Prettier** with `@sapphire/prettier-config` for formatting
- **TypeScript** with strict mode enabled

**Automatic enforcement via Husky:**

- Pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files)
- Commit-msg hook validates commit message format
- All checks must pass before commit is created

**Manual commands:**

```bash
# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm typecheck
```

### Commit Conventions

**This project follows [Conventional Commits](https://www.conventionalcommits.org/)**

**Format:** `<type>(<scope>): <subject>`

**Allowed types:**

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring without changing behavior
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or dependency changes
- `ci` - CI/CD configuration changes
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverting previous commits
- `types` - TypeScript type definition updates

**Rules:**

- Scope must be lowercase (e.g., `auth`, `api`, `ui`)
- Subject must be lowercase and imperative mood
- No exclamation marks in subject
- No period at end of subject

**Examples:**

```bash
# ✅ Good examples
feat: add user dashboard component
feat(auth): implement Discord OAuth2 flow
fix(api): resolve guild data fetching issue
docs: update installation instructions
refactor(components): simplify button component logic

# ❌ Bad examples
Add feature                     # Missing type
feat: Add feature               # Subject not lowercase
feat!: breaking change          # Exclamation mark not allowed
fix(Auth): bug fix              # Scope not lowercase
feat: add feature.              # Period at end
```

**Automatic validation:**
Husky's `commit-msg` hook automatically validates your commit message. If invalid, the commit will be rejected with an error message.

### File Naming Conventions

| Type             | Convention       | Example                     |
| ---------------- | ---------------- | --------------------------- |
| Vue Components   | PascalCase       | `UserProfile.vue`           |
| TypeScript Files | kebab-case       | `auth-utils.ts`             |
| API Routes       | kebab-case       | `guild-settings.get.ts`     |
| Directories      | kebab-case       | `guild-settings/`           |
| Variables        | camelCase        | `guildId`, `userName`       |
| Constants        | UPPER_SNAKE_CASE | `API_BASE_URL`              |
| Types/Interfaces | PascalCase       | `UserData`, `GuildSettings` |

### API Development

**Always use `defineWrappedResponseHandler` for API endpoints:**

```typescript
// server/api/example.get.ts
export default defineWrappedResponseHandler(
  async (event) => {
    // Your handler logic
    return { message: "Success" };
  },
  {
    auth: true,
    rateLimit: {
      enabled: true,
      window: 10000,
      limit: 5,
      type: "fixed"
    },
    onSuccess: (logger, data) => {
      logger.info("Request successful");
    },
    onError: (logger, error) => {
      logger.error("Request failed", error);
    }
  }
);
```

### Vue Component Structure

**Required block order (enforced by ESLint):**

```vue
<!-- 1. Template -->
<template>
  <div>Content</div>
</template>

<!-- 2. Regular script (if needed) -->
<script>
// Rarely used
</script>

<!-- 3. Setup script -->
<script setup lang="ts">
// Imports, logic, composables
</script>

<!-- 4. Non-scoped styles -->
<style>
/* Global styles */
</style>

<!-- 5. Scoped styles -->
<style scoped>
/* Component-specific styles */
</style>
```

### Database Changes

**For prototyping:**

```bash
# Edit server/database/schema.prisma
pnpm prisma:push
```

**For production-ready changes:**

```bash
# Edit server/database/schema.prisma
pnpm prisma:migrate:dev
# Enter descriptive migration name
pnpm prisma:generate
```

**Always:**

- Use descriptive migration names
- Review generated SQL
- Test migrations locally
- Commit migration files with schema changes

### Testing

**Before submitting a PR:**

1. **Build validation**

   ```bash
   pnpm build
   ```

   Must complete without errors

2. **Linting**

   ```bash
   pnpm lint
   ```

   No errors allowed (warnings acceptable)

3. **Type checking**

   ```bash
   pnpm typecheck
   ```

   Must pass without errors

4. **Manual testing**
   - Test your changes in the browser
   - Verify no console errors
   - Test on multiple screen sizes (if UI changes)
   - Verify Discord OAuth still works

### Documentation

**Update documentation when:**

- Adding new features
- Changing existing behavior
- Adding new API endpoints
- Modifying configuration
- Changing development workflow

**Documentation locations:**

- `/README.md` - Project overview and setup
- `/.github/copilot-instructions.md` - AI development guidelines
- `/AGENTS.md` - Project conventions and standards
- `/.github/CONTRIBUTING.md` - This file
- Inline code comments for complex logic
- JSDoc comments for functions and components

---

## Pull Request Process

### Before Submitting

**Checklist:**

- [ ] Branch is up to date with `main`
- [ ] All commits follow Conventional Commits format
- [ ] Code passes `pnpm lint` (no errors)
- [ ] Code passes `pnpm typecheck`
- [ ] Code builds successfully (`pnpm build`)
- [ ] Changes have been manually tested
- [ ] Documentation has been updated (if needed)
- [ ] No sensitive information in commits

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would break existing functionality)
- [ ] Documentation update

## Related Issues

Fixes #(issue number)

## How Has This Been Tested?

Describe the testing you've done

## Screenshots (if applicable)

Add screenshots to help explain your changes

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
```

### Review Process

1. **Automated checks** (via GitHub Actions)
   - Build validation
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Commit message validation

2. **Manual review** by maintainers
   - Code quality and style
   - Architecture and design
   - Performance considerations
   - Security implications

3. **Feedback and iteration**
   - Address review comments
   - Make requested changes
   - Push updates to your branch

4. **Merge**
   - After approval from maintainer(s)
   - Squash merge (default) or rebase merge
   - Delete branch after merge

### After Merge

- Your changes will be deployed automatically
- Monitor for any issues in production
- Be available to address any bugs that arise
- Celebrate your contribution! 🎉

---

## Community

### Getting Help

**Need help?**

- 💬 [Discord Server](https://join.wolfstar.rocks) - Real-time chat and support
- 📝 [GitHub Discussions](https://github.com/wolfstar-project/wolfstar.rocks/discussions) - Community discussions
- 🐛 [GitHub Issues](https://github.com/wolfstar-project/wolfstar.rocks/issues) - Bug reports and feature requests

### Recommended AI Tools

**For AI-assisted development:**

- **Context7** - Access up-to-date documentation for project dependencies
- **MCP ESLint** - Real-time linting feedback and automatic fixes

**Best practices:**

1. Use Context7 when unsure about API usage or library patterns
2. Use MCP ESLint to validate code before committing
3. Reference `AGENTS.md` and `copilot-instructions.md` for project-specific guidelines

### Recognition

Contributors are recognized in:

- Project README.md
- Release notes
- GitHub contributors page

**Significant contributors may:**

- Be invited to join the core team
- Get special roles in Discord server
- Receive early access to new features

---

## Additional Resources

- **Project Documentation**
  - [README.md](../README.md) - Project overview
  - [AGENTS.md](../AGENTS.md) - Project conventions
  - [copilot-instructions.md](copilot-instructions.md) - AI development guide

- **External Documentation**
  - [Nuxt 4](https://nuxt.com/docs)
  - [Vue 3](https://vuejs.org/guide/)
  - [Prisma](https://www.prisma.io/docs)
  - [TailwindCSS](https://tailwindcss.com/docs)
  - [Discord API](https://discord.com/developers/docs)

---

## Questions?

If you have questions not covered in this guide:

1. Check [existing documentation](../README.md)
2. Search [GitHub Issues](https://github.com/wolfstar-project/wolfstar.rocks/issues)
3. Ask in [Discord Server](https://join.wolfstar.rocks)
4. Open a [GitHub Discussion](https://github.com/wolfstar-project/wolfstar.rocks/discussions)

---

**Thank you for contributing to WolfStar.rocks! 🐺⭐**

---

**Last Updated**: October 2025
**Maintained by**: WolfStar Development Team

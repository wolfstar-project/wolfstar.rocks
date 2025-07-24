# Technology Stack

## Framework & Runtime
- **Nuxt 3** - Full-stack Vue.js framework with SSR/SSG capabilities
- **Vue 3** - Progressive JavaScript framework with Composition API
- **Node.js 22+** - JavaScript runtime (minimum version 20)
- **TypeScript** - Type-safe JavaScript development

## Package Management
- **pnpm 10+** - Fast, disk space efficient package manager
- **Volta** - JavaScript tool version manager (Node 22.17.0)

## Database & ORM
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe database ORM and query builder
- **Prisma Client** - Auto-generated database client

## Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library (prefix: `Shad`)
- **Reka UI** - Vue component primitives
- **DaisyUI** - Tailwind CSS component library
- **Nuxt Icon** - Icon management with Iconify

## Authentication & Security
- **nuxt-auth-utils** - Authentication utilities
- **nuxt-authorization** - Authorization management
- **nuxt-security** - Security headers and protection
- **Discord OAuth** - Authentication via Discord

## Development Tools
- **ESLint** - Code linting with Antfu config
- **Prettier** - Code formatting with Sapphire config
- **Husky** - Git hooks management
- **lint-staged** - Run linters on staged files
- **Commitlint** - Conventional commit message linting

## Deployment & Infrastructure
- **Docker** - Containerization
- **Cloudflare Pages** - Hosting platform
- **Wrangler** - Cloudflare development tool
- **Sentry** - Error monitoring and performance tracking

## Common Commands

### Development
```bash
pnpm dev              # Start development server
pnpm dev:pwa          # Start development with PWA enabled
pnpm build            # Build for production
pnpm generate         # Generate static site
pnpm preview          # Preview production build
```

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm typecheck        # Run TypeScript type checking
```

### Database
```bash
pnpm prisma:generate  # Generate Prisma client
```

### Deployment
```bash
pnpm serve            # Serve production build
pnpm serve:generate   # Serve static generated site
```

## Build Configuration
- **Nitro preset**: Configurable via `NUXT_NITRO_PRESET` environment variable
- **Target**: ESNext for modern JavaScript features
- **PWA**: Optional via `VITE_PLUGIN_PWA` environment variable
- **Source maps**: Hidden in client, enabled for debugging

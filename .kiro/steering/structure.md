# Project Structure

## Root Directory Organization

### Configuration Files
- `nuxt.config.ts` - Main Nuxt configuration
- `tsconfig.json` - TypeScript configuration (references .nuxt configs)
- `package.json` - Dependencies and scripts
- `pnpm-lock.yaml` - Lock file for reproducible installs
- `eslint.config.mjs` - ESLint configuration using Antfu preset
- `prettier.config.mjs` - Prettier configuration using Sapphire preset

### Application Structure (`app/`)
```
app/
├── app.vue              # Root application component
├── error.vue            # Global error page
├── assets/              # Static assets (CSS, images)
├── components/          # Vue components
├── composables/         # Vue composables and utilities
├── layouts/             # Nuxt layouts
├── pages/               # File-based routing pages
├── plugins/             # Nuxt plugins
├── stores/              # Pinia state management
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Server-Side (`server/`)
```
server/
├── api/                 # API routes
├── database/            # Database utilities
├── middlewares/         # Server middlewares
├── plugins/             # Server plugins
├── utils/               # Server utilities
└── tsconfig.json        # Server-specific TypeScript config
```

### Database (`prisma/`)
```
prisma/
├── schema.prisma        # Database schema definition
└── migrations/          # Database migration files
```

### Shared Code (`shared/`)
```
shared/
├── types/               # Shared TypeScript types
└── utils/               # Shared utility functions
```

### Configuration (`config/`)
```
config/
├── env.ts               # Environment configuration
└── pwa.ts               # PWA configuration
```

### Build & Deployment
- `.nuxt/` - Generated Nuxt build files (auto-generated)
- `.output/` - Production build output
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-container setup
- `wrangler.toml` - Cloudflare Workers configuration

### Development Tools
- `.husky/` - Git hooks configuration
- `.vscode/` - VS Code workspace settings
- `.devcontainer/` - Development container configuration

## Key Conventions

### File Naming
- Use kebab-case for files and directories
- Vue components use PascalCase
- Pages follow Nuxt file-based routing conventions
- API routes mirror the URL structure

### Component Organization
- UI components in `app/components/ui/` (shadcn/ui with `Shad` prefix)
- Feature components organized by domain
- Shared components at root of `components/`

### Import Patterns
- Auto-imports enabled for composables, components, and utilities
- Explicit imports for external libraries
- Path aliases configured for clean imports

### Database Schema
- Prisma models use PascalCase
- Database tables use snake_case mapping
- JSON fields typed with custom generators

### Environment Configuration
- `.env` for local development
- `.env.example` as template
- Runtime config generated dynamically
- Environment-specific builds (dev/prod/preview)

# GitHub Copilot Instructions - WolfStar Dashboard

## Project Context
You are working on the WolfStar Dashboard, a Next.js-based web application for managing the WolfStar Discord bot. This dashboard allows users to configure their guild settings, view commands, and manage bot features.

## Core Technologies
- **Next.js 13.5.9**: React framework with server-side rendering and API routes
- **TypeScript 4.9.5**: Statically typed JavaScript
- **Material-UI v5**: React UI component library
- **Emotion**: CSS-in-JS styling solution
- **React 18**: Modern React with hooks and concurrent features
- **Yarn 3**: Package manager

## Project Structure
```
src/
├── components/     # Reusable React components
│   ├── assets/    # Asset-related components
│   ├── material/  # Custom MUI components
│   ├── mods/      # Moderation components
│   ├── pages/     # Page-specific components
│   ├── presentational/ # Presentational components
│   ├── routing/   # Routing components
│   └── selects/   # Select/input components
├── contexts/      # React context providers
├── pages/         # Next.js pages (routing)
├── public/        # Static assets
└── utils/         # Utility functions and helpers
```

## Coding Standards

### TypeScript Guidelines
1. Always use TypeScript with explicit types
2. Prefer `type` over `interface` for props definitions
3. Use `import type` for type-only imports
4. Avoid `any` - use `unknown` if type is truly unknown
5. Use proper type guards when narrowing types

### React Component Patterns
1. **Use Functional Components**: All components should be functional with hooks
2. **Component Structure**:
   ```typescript
   import { memo, type FC } from 'react';
   
   export interface ComponentNameProps {
     /** Clear JSDoc description */
     propName: string;
   }
   
   const ComponentName: FC<ComponentNameProps> = ({ propName }) => (
     // Component JSX
   );
   
   export default memo(ComponentName);
   ```

3. **Performance**: Wrap components in `memo()` when appropriate
4. **Props**: Destructure props in function parameters
5. **Event Handlers**: Use arrow functions, prefix with `handle` (e.g., `handleClick`)

### Material-UI Best Practices
1. Import specific components: `import { Button } from '@mui/material'`
2. Use the `sx` prop for styling when needed
3. Leverage MUI's theming system
4. Use proper MUI types for component props
5. Follow MUI accessibility guidelines

### Code Organization
1. **Imports Order**:
   - External dependencies (React, MUI, etc.)
   - Type imports from external packages
   - Internal components/utilities
   - Internal type imports
   
2. **File Naming**:
   - Components: PascalCase (e.g., `SelectBoolean.tsx`)
   - Utilities: camelCase (e.g., `wolfstarUtils.ts`)
   - Pages: lowercase (e.g., `index.tsx`, `commands.tsx`)

3. **Export Pattern**:
   - Default export for pages and single-component files
   - Named exports for utilities and multi-export files

### State Management
1. Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
2. Use Constate for shared context state
3. Keep state close to where it's used
4. Avoid prop drilling - use context for deeply nested props

### Error Handling
1. Handle API errors gracefully
2. Provide user-friendly error messages
3. Use proper TypeScript error types
4. Log errors appropriately (not to console in production)

### Accessibility (a11y)
1. Follow WCAG guidelines
2. Provide proper ARIA labels
3. Ensure keyboard navigation
4. Use semantic HTML elements
5. Test with screen readers in mind

### Comments and Documentation
1. Use JSDoc for complex functions and non-obvious code
2. Document props with JSDoc comments
3. Explain "why" not "what" in comments
4. Include Apache 2.0 license header for new utility files

### ESLint and Code Quality
1. Follow the @sapphire/eslint-config rules
2. Run `yarn lint` before committing
3. Fix all ESLint errors and warnings
4. Use Prettier for consistent formatting
5. Respect existing ESLint overrides in configuration

## Discord Integration Patterns
1. Use proper Discord API types from `discord-api-types`
2. Handle OAuth flows correctly
3. Manage guild and user data appropriately
4. Respect Discord rate limits and best practices

## Next.js Specific Guidelines
1. **Pages**: Place in `src/pages/` directory
2. **API Routes**: Use Next.js API routes for backend logic
3. **Async Pages**: Use `getServerSideProps` or `getStaticProps` when needed
4. **Metadata**: Use `next-seo` for SEO optimization
5. **Performance**: Optimize images, use lazy loading

## Common Patterns in This Project

### Select Components
- Located in `src/components/selects/`
- Follow the pattern of `SelectBoolean`, `SelectChannel`, etc.
- Use Material-UI form components
- Include proper TypeScript props interfaces

### Utility Functions
- Located in `src/utils/`
- Export pure functions
- Include proper TypeScript types
- Use JSDoc for complex utilities

### Page Components
- Located in `src/pages/`
- Follow Next.js conventions
- Include proper SEO metadata
- Handle loading and error states

## Development Workflow
1. **Local Development**: `yarn dev`
2. **Linting**: `yarn lint`
3. **Type Checking**: `yarn typecheck`
4. **Building**: `yarn build`
5. **Formatting**: `yarn format`

## Don't Do
- ❌ Don't use class components
- ❌ Don't use `any` type
- ❌ Don't import React in every file (modern React doesn't require it)
- ❌ Don't use inline styles without MUI's `sx` prop
- ❌ Don't bypass ESLint rules without justification
- ❌ Don't use `console.log` in production code
- ❌ Don't modify auto-generated files
- ❌ Don't use `var` - use `const` or `let`

## Do
- ✅ Use TypeScript with proper types
- ✅ Follow the existing code patterns
- ✅ Write accessible components
- ✅ Use React hooks appropriately
- ✅ Keep components small and focused
- ✅ Write self-documenting code
- ✅ Test your changes locally
- ✅ Follow the ESLint rules
- ✅ Use Prettier for formatting
- ✅ Add JSDoc for complex logic

## Environment Variables
- Store sensitive data in `.env.development.local` (not committed)
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Access via `process.env.VARIABLE_NAME`

## References
- Material-UI: https://mui.com/
- Next.js: https://nextjs.org/docs
- Discord API Types: https://discord-api-types.dev/
- Sapphire Framework: https://www.sapphirejs.dev/

# AI Coding Assistant Instruction Files

This repository includes comprehensive instruction files for AI coding assistants (GitHub Copilot, Cursor AI, etc.) to help with development on the WolfStar Dashboard project.

## Files Overview

### Main Configuration Files

#### `.cursor/rules`
Rules file for Cursor AI with project overview, technology stack, code style conventions, and best practices specific to the WolfStar Dashboard.

#### `copilot-istructions.md`
Main instructions file for GitHub Copilot providing:
- Project context and core technologies
- Project structure overview
- Coding standards and guidelines
- Common patterns and best practices
- Do's and Don'ts for development

### Specialized Instruction Files

#### `components.istructions.md`
Detailed guidance for React component development including:
- Component categories (presentational, selects, pages, routing, material)
- Component patterns and best practices
- Props definition standards
- Event handler conventions
- Styling approaches
- Performance optimization techniques
- Accessibility guidelines

#### `pages.istructions.md`
Next.js pages development instructions covering:
- Page component patterns
- Data fetching (SSR, SSG, CSR)
- SEO best practices with next-seo
- Dynamic routes implementation
- Authentication and authorization
- Layout and responsive design
- Performance optimization

#### `utils.istructions.md`
Utility functions and helpers guidance including:
- Pure function patterns
- Type safety requirements
- JSDoc documentation standards
- Discord-specific utilities
- Browser-specific utilities
- Error handling utilities
- Common utility patterns

#### `api.istructions.md`
API routes development instructions covering:
- Basic API route patterns
- HTTP methods handling
- Dynamic routes
- Authentication and authorization
- Discord OAuth integration
- Request validation
- Error handling
- Rate limiting
- CORS configuration

#### `styling.istructions.md`
Styling and theming guidance including:
- Material-UI theme system
- The `sx` prop usage
- Styled components
- Color palette and typography
- Responsive breakpoints
- Layout components (Container, Grid, Stack, Box)
- Dark mode support
- Accessibility considerations

## How to Use

These instruction files are designed to be read by AI coding assistants to understand project conventions and best practices. They help ensure:

1. **Consistent Code Style**: All code follows the same patterns and conventions
2. **Best Practices**: TypeScript, React, Next.js, and Material-UI best practices are followed
3. **Accessibility**: Components are built with accessibility in mind
4. **Performance**: Code is optimized for performance
5. **Maintainability**: Code is well-documented and easy to understand

## Technology Stack

- **Framework**: Next.js 13.5.9
- **Language**: TypeScript 4.9.5
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Constate
- **Styling**: Emotion (CSS-in-JS)
- **Code Quality**: ESLint (@sapphire/eslint-config), Prettier
- **Package Manager**: Yarn 3.4.1

## Contributing

When adding new instruction files or updating existing ones:

1. Follow the established format and structure
2. Include practical examples
3. Keep instructions clear and actionable
4. Update this README if adding new files
5. Ensure consistency across all instruction files

## File Naming Convention

- Cursor AI: `.cursor/rules`
- GitHub Copilot: `copilot-istructions.md` (note: "istructions" spelling is intentional)
- Specialized instructions: `<topic>.istructions.md` (e.g., `components.istructions.md`)

## Note on Spelling

The spelling "istructions" (instead of "instructions") is intentional and follows the project's naming convention for instruction files.

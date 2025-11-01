# WolfStar.rocks Custom Agents

This directory contains custom agents for GitHub Copilot to assist with development on the WolfStar.rocks project.

## Available Agents

### WolfStar Development Agent (`wolfstar-development.md`)

Expert agent for full-stack development on the WolfStar.rocks dashboard using:
- Nuxt 4 + Vue 3 + TypeScript
- Prisma ORM with PostgreSQL
- Discord OAuth2 integration
- TailwindCSS + DaisyUI styling
- Pinia state management

**Use this agent for**:
- Creating new Vue components
- Developing API endpoints with wrapped handlers
- Database schema changes and migrations
- Discord bot integration features
- Styling with TailwindCSS and DaisyUI
- State management with Pinia
- Authentication and authorization tasks

## How to Use Custom Agents

1. Custom agents are automatically detected by GitHub Copilot when working in this repository
2. You can reference the agent instructions when asking Copilot for help
3. The agent provides context-aware suggestions based on the project's conventions and patterns

## Agent Source

The WolfStar Development Agent is based on the comprehensive copilot-instructions from the `refactor/imagine-an-app` branch, which contains detailed development guidelines, coding patterns, and best practices for the project.

## Maintenance

When updating project conventions or patterns:
1. Update the source copilot-instructions on the `refactor/imagine-an-app` branch
2. Sync changes to the custom agent file in this directory
3. Keep both files aligned to ensure consistent guidance

## Related Files

- `.github/copilot-instructions.md` (main branch) - General Copilot instructions
- Source copilot-instructions on `refactor/imagine-an-app` branch - Detailed development guide
- `AGENTS.md` - Project rules and conventions

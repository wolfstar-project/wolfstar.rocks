# WolfStar.rocks Custom Agent

This directory contains a custom agent for GitHub Copilot to assist with development on the WolfStar.rocks project.

## Available Agent

### WolfStar Development Agent - Enhanced Edition (`wolfstar-agent.md`)

Unified autonomous expert agent combining deep WolfStar.rocks domain knowledge with Context7 MCP integration and autonomous problem-solving capabilities.

**Core Capabilities**:
- Full-stack Nuxt 4 + Vue 3 + TypeScript development
- Prisma ORM with PostgreSQL database operations
- Discord OAuth2 integration and bot management
- TailwindCSS + DaisyUI styling patterns
- Pinia state management
- API development with wrapped handlers
- ESLint configuration and auto-fixing
- Sentry error tracking and monitoring
- Autonomous problem-solving with iterative refinement
- Context7 MCP integration for up-to-date library documentation
- Internet research and documentation fetching

**Use this agent for**:
- **Development Tasks**:
  - Creating new Vue components with proper structure
  - Developing API endpoints with authentication and rate limiting
  - Database schema changes and migrations
  - Discord bot integration features
  - Styling with TailwindCSS and DaisyUI
  - State management with Pinia stores
  
- **Problem Solving**:
  - Solving complex technical problems autonomously
  - Integrating new libraries or frameworks
  - Debugging difficult issues requiring research
  - Tasks requiring current documentation from Context7
  - Problems needing iterative refinement and testing
  - Autonomous code fixes with comprehensive validation
  
- **Quality Assurance**:
  - ESLint error detection and auto-fixing
  - Sentry-powered error debugging
  - Pre-commit quality gates (build, lint, typecheck)
  - Conventional Commits validation

## How to Use the Custom Agent

1. The agent is automatically detected by GitHub Copilot when working in this repository
2. You can reference the agent instructions when asking Copilot for help
3. The agent provides context-aware suggestions based on the project's conventions and patterns
4. The agent can autonomously solve complex problems using Context7 for up-to-date documentation

## Agent Features

### WolfStar.rocks Expertise
- Deep knowledge of Nuxt 4, Vue 3, TypeScript, and Prisma patterns
- Understanding of Discord OAuth2 and bot integration
- Familiarity with project structure and conventions
- API development patterns with wrapped handlers
- Database schema and migration workflows

### Autonomous Problem-Solving
- Iterative refinement until problems are completely solved
- Comprehensive testing and validation
- Todo list tracking for complex tasks
- Internet research capabilities
- Root cause analysis and debugging

### Context7 MCP Integration
- Up-to-date, version-specific library documentation
- Prevents outdated code generation and API hallucinations
- Real-time documentation for thousands of libraries
- Topic-focused queries for targeted help

### Quality Tools
- ESLint integration with auto-fix capabilities
- Sentry error tracking and monitoring
- Pre-commit validation with Husky
- Conventional Commits enforcement

## Agent Source

The WolfStar Development Agent is based on the comprehensive copilot-instructions from the `refactor/imagine-an-app` branch, enhanced with Beast Mode 3.2 autonomous problem-solving capabilities and Context7 MCP integration.

## Maintenance

When updating project conventions or patterns:
1. Update the source copilot-instructions on the `refactor/imagine-an-app` branch
2. Sync changes to the agent file in this directory
3. Keep both files aligned to ensure consistent guidance

## Related Files

- `.github/copilot-instructions.md` (main branch) - General Copilot instructions
- Source copilot-instructions on `refactor/imagine-an-app` branch - Detailed development guide
- `AGENTS.md` - Project rules and conventions

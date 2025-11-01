# Nuxt Composables Best Practices

Follow best practices for creating and using composables in Nuxt.

## Context

Rules for creating and using composables in Nuxt applications. Composables are auto-imported from the composables/ directory.

## Requirements

- Name composables with "use" prefix (e.g., useCounter)
- Return reactive values using ref/reactive
- Handle SSR compatibility in composables
- Implement proper cleanup in onUnmounted when needed
- Use TypeScript for better type inference
- Document composable parameters and return values
- Handle error states within composables
- Use useState for shared state management
- Implement proper disposal of resources
- Consider using async composables with useAsyncData

## Critical Rules

- ALWAYS use "use" prefix for composable names
- Use useState for SSR-compatible shared state
- Implement proper cleanup in onUnmounted
- Handle SSR compatibility (no direct window/document access)
- Return readonly refs when state should be immutable
- Document composable parameters and return types

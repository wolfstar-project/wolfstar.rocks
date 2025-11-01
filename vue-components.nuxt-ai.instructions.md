# Vue Component Best Practices

Follow Vue component best practices in Nuxt application.

## Context

Rules for Vue components in a Nuxt application.

## Requirements

- Create small, focused components
- Use defineModel for two-way binding
- Use props for data down, emits for events up
- Use composables for shared state/logic
- Structure: script → template → style
- Use TypeScript interfaces for props/emits
- Define complex types in /types directory
- Mark optional props with ? symbol

## Critical Rules

- ALWAYS use TypeScript interfaces for props/emits
- Keep components small and focused
- Use proper component structure (script → template → style)

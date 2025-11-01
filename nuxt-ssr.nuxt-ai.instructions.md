# Nuxt SSR Compatibility

Ensure components work correctly in SSR environment.

## Context

Nuxt renders components on both server and client.
- Code should be isomorphic (runnable in both environments).
- Access window/document only within client-side hooks or checks.
- Be mindful of state hydration.

## Requirements

- Ensure code is isomorphic (runs on server and client)
- Access window/document only in client-side checks/hooks
- Use onMounted for client-side only logic
- Be mindful of state hydration mismatches
- Use <ClientOnly> for components incompatible with SSR

## Critical Rules

- NEVER access browser APIs without environment checks
- Use proper data fetching with useAsyncData/useFetch
- Handle hydration properly
- Use ClientOnly for client-only components
- Make components isomorphic
- Handle all rendering states

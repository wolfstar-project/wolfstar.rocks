# Nuxt Hydration Best Practices

Follow best practices to ensure smooth hydration in Nuxt applications.

## Context

Hydration is the process of making the server-rendered HTML interactive on the client.
- Mismatches between server and client output can cause issues.
- Ensure consistent state and DOM structure.
- Debug hydration errors using browser devtools.

## Requirements

- Ensure consistent state between server and client
- Avoid direct DOM manipulation before hydration
- Use keys for list rendering consistency
- Debug hydration mismatch warnings carefully
- Use <ClientOnly> sparingly for non-critical UI

## Critical Rules

- Ensure consistent state between server and client
- Avoid direct DOM manipulation before hydration
- Use keys for list rendering consistency
- Debug hydration mismatch warnings carefully
- Use <ClientOnly> sparingly for non-critical UI

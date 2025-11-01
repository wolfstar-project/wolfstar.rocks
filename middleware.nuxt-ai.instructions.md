# Nuxt Route Middleware

Follow best practices for route middleware and navigation guards in Nuxt.

## Context

Rules for creating route middleware in Nuxt.
- Middleware runs before route changes
- Global middleware runs on every route
- Named middleware can be applied selectively
- Server middleware runs on server only
- Can be used for auth, validation, redirection

## Requirements

- Use defineNuxtRouteMiddleware for type safety
- Handle async operations properly
- Implement proper error handling
- Use proper navigation guards
- Handle authentication/authorization
- Validate route parameters
- Handle redirects properly
- Implement proper loading states
- Use proper TypeScript types
- Handle server/client state properly

## Critical Rules

- ALWAYS use defineNuxtRouteMiddleware
- Handle async operations properly
- Implement proper error handling
- Use navigateTo for redirects
- Handle server/client state properly
- Validate route parameters properly

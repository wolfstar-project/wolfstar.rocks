---
applyTo: **/middleware/**/*.{ts,js}
---

# Nuxt Route Middleware

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

## Examples

<example>
// Example of proper analytics middleware with client-side only execution
export default `
export default defineNuxtRouteMiddleware((to) => {
  // Skip on server
  if (process.server) return

// Track page view
const analytics = useAnalytics()
analytics.trackPageView({
path: to.fullPath,
title: to.meta.title
})
})
`

</example>

<example>
// Example of proper authentication middleware
export default `
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

// Handle auth requirements
if (to.meta.requiresAuth && !isAuthenticated.value) {
// Redirect to login with return URL
return navigateTo({
path: '/login',
query: { redirect: to.fullPath }
})
}

// Handle guest-only pages
if (to.meta.guest && isAuthenticated.value) {
return navigateTo('/')
}
})
`

</example>

<example>
// Example of proper role-based guard middleware
export default `
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  const requiredRole = to.meta.requiredRole

// Skip if no role required
if (!requiredRole) return

// Check user role
if (!user.value?.roles.includes(requiredRole)) {
throw createError({
statusCode: 403,
message: 'Access denied'
})
}
})
`

</example>

<example>
// Example of proper route parameter validation middleware
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip validation for routes without params
  if (!to.params.id)
    return

try {
// Validate route params
const isValid = await validateRouteParams(to.params)
if (!isValid) {
throw createError({
statusCode: 400,
message: 'Invalid route parameters',
})
}
}
catch (error) {
// Handle validation errors
return navigateTo({
name: 'error',
query: {
statusCode: error.statusCode,
message: error.message,
},
})
}
})

</example>

<example type="invalid">
// Example of improper navigation in middleware
export default `
// ❌ Wrong: Improper navigation
export default defineNuxtRouteMiddleware(() => {
  // Wrong: Using window.location
  window.location.href = '/login'
})
`

</example>

<example type="invalid">
// Example of middleware without proper type safety
export default `
// ❌ Wrong: Not using defineNuxtRouteMiddleware
export default (to, from) => {
  // Wrong: No type safety
  if (!to.meta.auth) return
  // ...
}
`

</example>

<example type="invalid">
// Example of poor error handling in middleware
export default `
// ❌ Wrong: Poor error handling
export default defineNuxtRouteMiddleware(() => {
  try {
    // Implementation
  } catch (e) {
    // Wrong: Generic error
    console.error(e)
    return navigateTo('/error')
  }
})
`

</example>

## Critical Rules

- ALWAYS use defineNuxtRouteMiddleware
- Handle async operations properly
- Implement proper error handling
- Use navigateTo for redirects
- Handle server/client state properly
- Validate route parameters properly

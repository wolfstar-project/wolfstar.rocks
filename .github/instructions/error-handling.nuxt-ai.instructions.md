---
applyTo: **/server/**/*.{ts,js}
---

# Nuxt Error Handling

## Context

Rules for handling errors in Nuxt applications.

- Use error.vue for global error handling
- Use createError for server-side errors
- Use try/catch for async operations
- Implement proper error boundaries

## Requirements

- Implement proper error pages
- Use createError for server errors
- Handle async errors properly
- Implement error boundaries
- Use proper error logging
- Handle network errors
- Implement retry mechanisms
- Show user-friendly error messages
- Handle validation errors properly
- Implement proper error recovery

## Examples

<example>
export function useErrorHandler() {
  const toast = useToast()

function handleError(error: unknown) {
// Log error
console.error('Error:', error)

    // Show user-friendly message
    const message = error instanceof Error
      ? error.message
      : 'An unexpected error occurred'

    toast.error({
      title: 'Error',
      message,
      duration: 5000,
    })

    // Track error in monitoring
    trackError(error)

}

return {
handleError,
}
}

</example>

<example type="invalid">
// ❌ Wrong: Poor error handling
async function fetchData() {
  // Wrong: No error handling
  const data = await $fetch('/api/data')
  return data
}

// ❌ Wrong: Generic error messages
export default defineEventHandler(() => {
try {
// Implementation
}
catch (e) {
// Wrong: Generic error
throw createError({
statusCode: 500,
message: 'Something went wrong',
})
}
})

// ❌ Wrong: Not handling all error states
// <template>
// <div>
// <!-- Wrong: Missing error state -->
// <div v-if="loading">Loading...</div>
// <div v-else>{{ data }}</div>
// </div>
// </template>

</example>

## Critical Rules

- ALWAYS implement proper error pages
- Use createError for server-side errors
- Handle async errors properly
- Show user-friendly error messages
- Implement proper error logging
- Handle all error states in UI

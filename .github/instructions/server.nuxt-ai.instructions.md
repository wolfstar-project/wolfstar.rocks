---
applyTo: **/server/**/*.{ts,js}
---

# Nuxt Server Routes and Middleware

## Context

Rules for creating server-side functionality in Nuxt using h3.

- API routes are auto-registered from server/api/
- Server Middleware is not recommended as described in the nitro docs
- Event handlers are registered from server/plugins/
- File-based routing with support for dynamic parameters ([id].ts)
- Method-specific handlers supported (users.get.ts, users.post.ts)

## Requirements

- Use defineEventHandler for all route handlers
- Use H3 utilities for request/response handling (getQuery, readBody, etc.)
- Implement proper error handling with createError
- Use proper HTTP status codes and methods
- Validate request data with zod or similar
- Use proper TypeScript types for request/response
- Implement rate limiting for public endpoints
- Use proper CORS configuration
- Handle file uploads with readMultipartFormData
- Implement proper authentication/authorization
- Use environment variables for sensitive data
- Return appropriate response types (JSON, string, null, streams)
- Use lazy event handlers for expensive operations
- Implement proper request body size limits
- Add proper content-type headers

## Examples

<example>
defineEventHandler(() => {
  return 'Response'
})

</example>

<example>
export default defineLazyEventHandler(async () => {
  // Expensive one-time setup
  const db = await initializeDatabase()
  const cache = await setupCache()

// Return the actual handler
return defineEventHandler(async (event: H3Event) => {
const { id } = getQuery(event)

    // Check cache first
    const cached = await cache.get(id as string)
    if (cached)
      return cached

    // Query database if not in cache
    const result = await db.query(id as string)
    await cache.set(id as string, result)

    return result

})
})

</example>

<example type="invalid">
// ❌ WRONG: Not using H3 utilities
// This example shows incorrect usage of Node.js req/res objects

import { defineEventHandler } from 'h3'
import type { H3Event } from 'h3'

// Wrong: Using raw Node.js types instead of H3
export default defineEventHandler(async (event: H3Event) => {
try {
// Wrong: Accessing raw request properties
const id = event.context.params?.id

    // Wrong: Manual JSON parsing
    let body = ''
    event.req.on('data', (chunk) => {
      body += chunk.toString()
    })

    // Wrong: Manual response handling
    const data = JSON.parse(body)
    event.res.writeHead(200, { 'Content-Type': 'application/json' })
    event.res.end(JSON.stringify({ id, data }))

}
catch (error) {
// Wrong: Manual error handling
event.res.writeHead(500)
event.res.end(JSON.stringify({ error: 'Internal server error' }))
}
}

</example>

## Critical Rules

- ALWAYS use defineEventHandler for route handlers
- ALWAYS use H3 utilities for request handling (getQuery, readBody, etc.)
- ALWAYS implement proper error handling with createError
- NEVER return errors directly, use createError instead
- ALWAYS validate input data before processing
- ALWAYS use proper HTTP status codes
- ALWAYS secure sensitive endpoints with authentication
- ALWAYS handle file uploads safely with size and type limits
- NEVER use Node.js req/res objects directly
- NEVER expose sensitive data in error messages

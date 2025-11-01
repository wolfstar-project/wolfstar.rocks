# Nuxt Server Routes and Middleware

Follow best practices for server routes, API endpoints, and middleware in Nuxt using h3.

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

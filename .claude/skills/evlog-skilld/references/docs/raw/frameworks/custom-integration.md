# Custom Integration

> Build your own evlog framework integration using the toolkit API with createMiddlewareLogger, header extraction, AsyncLocalStorage, and the full drain/enrich/keep pipeline.

Don't see your framework listed? The `evlog/toolkit` package exposes the same building blocks that power every built-in integration (Hono, Express, Fastify, Elysia, NestJS, SvelteKit). Build a full-featured evlog middleware for any HTTP framework in ~50 lines of code.

<callout color="warning" icon="i-lucide-flask-conical">

The toolkit API is marked as **beta**. The surface is stable (used by all built-in integrations) but may evolve based on community feedback.

</callout>

## Install

<code-group>

```bash [pnpm]
pnpm add evlog
```

```bash [npm]
npm install evlog
```

```bash [bun]
bun add evlog
```

</code-group>

## What's in the Toolkit

<table>
<thead>
  <tr>
    <th>
      Export
    </th>
    
    <th>
      Purpose
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        createMiddlewareLogger(opts)
      </code>
    </td>
    
    <td>
      Full pipeline: logger creation, route filtering, tail sampling, emit, enrich, drain
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        BaseEvlogOptions
      </code>
    </td>
    
    <td>
      Base user-facing options type with <code>
        drain
      </code>
      
      , <code>
        enrich
      </code>
      
      , <code>
        keep
      </code>
      
      , <code>
        include
      </code>
      
      , <code>
        exclude
      </code>
      
      , <code>
        routes
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MiddlewareLoggerOptions
      </code>
    </td>
    
    <td>
      Internal options extending <code>
        BaseEvlogOptions
      </code>
      
       with <code>
        method
      </code>
      
      , <code>
        path
      </code>
      
      , <code>
        requestId
      </code>
      
      , <code>
        headers
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        MiddlewareLoggerResult
      </code>
    </td>
    
    <td>
      Return type: <code>
        { logger, finish, skipped }
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        extractSafeHeaders(headers)
      </code>
    </td>
    
    <td>
      Filter sensitive headers from a Web API <code>
        Headers
      </code>
      
       object (Hono, Elysia, Deno, Bun)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        extractSafeNodeHeaders(headers)
      </code>
    </td>
    
    <td>
      Filter sensitive headers from Node.js <code>
        IncomingHttpHeaders
      </code>
      
       (Express, Fastify, NestJS)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createLoggerStorage(hint)
      </code>
    </td>
    
    <td>
      Factory returning <code>
        { storage, useLogger }
      </code>
      
       backed by <code>
        AsyncLocalStorage
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        extractErrorStatus(error)
      </code>
    </td>
    
    <td>
      Extract HTTP status from any error shape (<code>
        status
      </code>
      
       or <code>
        statusCode
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        shouldLog(path, include, exclude)
      </code>
    </td>
    
    <td>
      Route filtering logic (glob patterns)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getServiceForPath(path, routes)
      </code>
    </td>
    
    <td>
      Resolve per-route service name
    </td>
  </tr>
</tbody>
</table>

Types like `RequestLogger`, `DrainContext`, `EnrichContext`, `WideEvent`, and `TailSamplingContext` are exported from the main `evlog` package.

## Architecture

Every evlog framework integration follows the same 5-step pattern:

```text
Request → createMiddlewareLogger() → store logger → handle request → finish()
```

1. **Extract** `method`, `path`, `requestId`, and `headers` from the framework request
2. **Call** `createMiddlewareLogger()` with those fields + user options
3. **Check** `skipped` - if `true`, the route is filtered out, skip to next middleware
4. **Store** the `logger` in the framework's idiomatic context (`req.log`, `c.set('log')`, etc.)
5. **Call** `finish({ status })` on success or `finish({ error })` on failure

`createMiddlewareLogger` handles everything else: route filtering, service overrides, duration tracking, tail sampling, event emission, enrichment, and draining.

## Minimal Example

Here's a complete integration for a generic Node.js HTTP framework:

```typescript [my-framework-evlog.ts]
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { RequestLogger } from 'evlog'
import {
  createMiddlewareLogger,
  extractSafeNodeHeaders,
  createLoggerStorage,
  type BaseEvlogOptions,
} from 'evlog/toolkit'

export type MyFrameworkEvlogOptions = BaseEvlogOptions

const { storage, useLogger } = createLoggerStorage(
  'middleware context. Make sure evlog middleware is registered before your routes.',
)

export { useLogger }

export function evlog(options: MyFrameworkEvlogOptions = {}) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => Promise<void>) => {
    const { logger, finish, skipped } = createMiddlewareLogger({
      method: req.method || 'GET',
      path: req.url || '/',
      requestId: (req.headers['x-request-id'] as string) || crypto.randomUUID(),
      headers: extractSafeNodeHeaders(req.headers),
      ...options,
    })

    if (skipped) {
      await next()
      return
    }

    ;(req as IncomingMessage & { log: RequestLogger }).log = logger

    try {
      await storage.run(logger, () => next())
      await finish({ status: res.statusCode })
    } catch (error) {
      await finish({ error: error as Error })
      throw error
    }
  }
}
```

That's it. This middleware gets **every feature** for free: route filtering, drain adapters, enrichers, tail sampling, error capture, and duration tracking.

## Key Rules

1. **Always use createMiddlewareLogger** - never call `createRequestLogger` directly
2. **Use the right header extractor** - `extractSafeHeaders` for Web API `Headers` (Hono, Elysia, Deno), `extractSafeNodeHeaders` for Node.js `IncomingHttpHeaders` (Express, Fastify)
3. **Spread user options** - `...options` passes `drain`, `enrich`, `keep`, `include`, `exclude` to the pipeline automatically
4. **Call finish() in both paths** - success (`{ status }`) and error (`{ error }`) - it handles emit + enrich + drain
5. **Re-throw errors** after `finish()` so framework error handlers still work
6. **Export useLogger()** - consumers expect it for accessing the logger from service functions
7. **Export your options type** extending `BaseEvlogOptions` - for IDE completion on `drain`, `enrich`, `keep`

## Usage

Once built, your integration is used like any other:

```typescript [src/index.ts]
import { initLogger } from 'evlog'
import { evlog, useLogger } from './my-framework-evlog'
import { createAxiomDrain } from 'evlog/axiom'

initLogger({ env: { service: 'my-api' } })

app.use(evlog({
  include: ['/api/**'],
  drain: createAxiomDrain(),
  enrich: (ctx) => {
    ctx.event.region = process.env.FLY_REGION
  },
  keep: (ctx) => {
    if (ctx.duration && ctx.duration > 2000) ctx.shouldKeep = true
  },
}))

app.get('/api/users', (req, res) => {
  req.log.set({ users: { count: 42 } })
  res.json({ users: [] })
})

// Access logger from anywhere in the call stack
function findUsers() {
  const log = useLogger()
  log.set({ db: { query: 'SELECT * FROM users' } })
}
```

## Reference Implementations

Study these built-in integrations for framework-specific patterns:

<table>
<thead>
  <tr>
    <th>
      Framework
    </th>
    
    <th>
      Lines
    </th>
    
    <th>
      Pattern
    </th>
    
    <th>
      Source
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Hono
    </td>
    
    <td>
      ~40
    </td>
    
    <td>
      Web API Headers, <code>
        c.set()
      </code>
      
      , try/catch
    </td>
    
    <td>
      <a href="https://github.com/hugorcd/evlog/blob/main/packages/evlog/src/hono/index.ts" rel="nofollow">
        hono/index.ts
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      Express
    </td>
    
    <td>
      ~60
    </td>
    
    <td>
      Node.js headers, <code>
        req.log
      </code>
      
      , <code>
        res.on('finish')
      </code>
    </td>
    
    <td>
      <a href="https://github.com/hugorcd/evlog/blob/main/packages/evlog/src/express/index.ts" rel="nofollow">
        express/index.ts
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      Elysia
    </td>
    
    <td>
      ~70
    </td>
    
    <td>
      Plugin API, <code>
        derive()
      </code>
      
      , <code>
        onAfterHandle
      </code>
      
      /<code>
        onError
      </code>
    </td>
    
    <td>
      <a href="https://github.com/hugorcd/evlog/blob/main/packages/evlog/src/elysia/index.ts" rel="nofollow">
        elysia/index.ts
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      Fastify
    </td>
    
    <td>
      ~70
    </td>
    
    <td>
      Plugin, <code>
        decorateRequest
      </code>
      
      , <code>
        onRequest
      </code>
      
      /<code>
        onResponse
      </code>
      
       hooks
    </td>
    
    <td>
      <a href="https://github.com/hugorcd/evlog/blob/main/packages/evlog/src/fastify/index.ts" rel="nofollow">
        fastify/index.ts
      </a>
    </td>
  </tr>
</tbody>
</table>

<callout color="neutral" icon="i-lucide-heart">

Built an integration for a framework we don't support? Open a PR - the community will thank you.

</callout>

## Next Steps

- [Wide Events](/logging/wide-events): Design comprehensive events with context layering
- [Adapters](/adapters/overview): Send logs to Axiom, Sentry, PostHog, and more
- [Sampling](/core-concepts/sampling): Control log volume with head and tail sampling
- [Structured Errors](/logging/structured-errors): Throw errors with `why`, `fix`, and `link` fields

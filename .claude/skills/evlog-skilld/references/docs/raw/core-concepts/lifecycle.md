# Request Lifecycle

> Understand the full lifecycle of a request in evlog, from creation to drain. Every step from logger creation, context accumulation, sampling, enrichment, to external delivery.

Every request that passes through evlog follows the same pipeline. Understanding this pipeline helps you know exactly when your hooks fire, where context is added, and how events reach your observability platform.

```mdc
Request In
       │
       ▼
  ┌──────────┐     Route excluded?
  │  Filter  │────── yes ──▶ skip (no logging)
  └──────────┘
       │ no
       ▼
  ┌──────────────────┐
  │  Create Logger   │  requestId, method, path, startTime
  └──────────────────┘
       │
       ▼
  ┌──────────────────┐
  │  Handler runs    │  log.set() accumulates context
  │                  │  log.error() records errors
  └──────────────────┘
       │
       ▼
  ┌──────────────────┐
  │  Request ends    │  status + duration computed
  └──────────────────┘
       │
       ▼
  ┌──────────────────┐
  │  Tail Sampling   │  evlog:emit:keep hook
  │  (keep?)         │  force-keep based on outcome
  └──────────────────┘
       │
       ▼
  ┌──────────────────┐
  │  Head Sampling   │  random % per level
  │  (sample?)       │  skipped if tail said "keep"
  └──────────────────┘
       │ sampled out? ──▶ discard (no output)
       │
       ▼
  ┌──────────────────┐
  │  Emit            │  WideEvent built + console output
  └──────────────────┘
       │
       ▼
  ┌──────────────────┐
  │  Enrich          │  evlog:enrich hook
  │                  │  user-agent, geo, trace, custom
  └──────────────────┘
       │
       ▼
  ┌──────────────────┐
  │  Drain           │  evlog:drain hook
  │                  │  Axiom, OTLP, Sentry, custom
  └──────────────────┘
       │
       ▼
   Done
```

## Step by Step

### 1. Route Filtering

When a request arrives, evlog checks whether the path matches the configured `include` / `exclude` patterns. If the route is excluded, no logger is created and the request proceeds without any logging overhead.

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    include: ['/api/**'],
  },
})
```

### 2. Logger Creation

For matched routes, evlog creates a `RequestLogger` and attaches it to the request context. The logger is pre-populated with:

<table>
<thead>
  <tr>
    <th>
      Field
    </th>
    
    <th>
      Source
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        method
      </code>
    </td>
    
    <td>
      HTTP method (<code>
        GET
      </code>
      
      , <code>
        POST
      </code>
      
      , ...)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        path
      </code>
    </td>
    
    <td>
      Request path
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        requestId
      </code>
    </td>
    
    <td>
      Auto-generated UUID (or <code>
        cf-ray
      </code>
      
       on Cloudflare)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        startTime
      </code>
    </td>
    
    <td>
      <code>
        Date.now()
      </code>
      
       for duration calculation
    </td>
  </tr>
</tbody>
</table>

The logger is stored on the event context so it's accessible via `useLogger(event)`.

### 3. Context Accumulation

During the handler, you call `log.set()` to attach context. Each call deep-merges into the existing context, so you can call it as many times as needed:

```typescript [server/api/checkout.post.ts]
const log = useLogger(event)

const user = await getUser(event)
log.set({ user: { id: user.id, plan: user.plan } })

const cart = await getCart(user.id)
log.set({ cart: { items: cart.items.length, total: cart.total } })
```

If an error is thrown, evlog's `error` hook captures it automatically and records it on the logger with the status code.

### 4. Request End

When the response is sent (or an error is thrown), evlog computes:

- **Status code** from the response (or from the error's `status` / `statusCode`)
- **Duration** from `Date.now() - startTime`
- **Level** - `error` if an error was recorded, `warn` if status >= 400, otherwise `info`

If an error triggered the emit, the request is marked as already emitted to prevent double-emission in the response hook.

### 5. Tail Sampling (`evlog:emit:keep`)

Before the event is sampled, evlog evaluates **tail sampling** rules. These run *after* the request completes, so they can inspect the outcome:

```typescript [nuxt.config.ts]
evlog: {
  sampling: {
    keep: [
      { duration: 1000 },          // slow requests
      { status: 400 },             // client/server errors
      { path: '/api/critical/**' }, // critical paths
    ],
  },
}
```

The `evlog:emit:keep` hook also fires, letting you force-keep based on custom business logic:

```typescript [server/plugins/evlog-custom.ts]
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:emit:keep', (ctx) => {
    if (ctx.context.user?.premium) {
      ctx.shouldKeep = true
    }
  })
})
```

If any rule or hook sets `shouldKeep = true`, the event **bypasses head sampling entirely**.

### 6. Head Sampling

If the event wasn't force-kept by tail sampling, head sampling applies. This is a random coin flip per log level:

```typescript [nuxt.config.ts]
evlog: {
  sampling: {
    rates: { info: 10, warn: 50, debug: 0 },
  },
}
```

- `info: 10` - keep 10% of info-level events
- `warn: 50` - keep 50% of warnings
- `error` defaults to **100%** (never sampled out)

If the event is sampled out, processing stops entirely: no console output, no enrichment, no drain.

### 7. Emit

The `WideEvent` object is built from the accumulated context:

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "info",
  "service": "my-app",
  "method": "POST",
  "path": "/api/checkout",
  "requestId": "abc-123",
  "duration": 234,
  "status": 200,
  "user": { "id": 1, "plan": "pro" },
  "cart": { "items": 3, "total": 9999 }
}
```

The event is printed to the console, pretty-formatted in development and as JSON in production.

### 8. Enrich (`evlog:enrich`)

After emission, enrichers add derived context to the event. Built-in enrichers extract data from request headers:

<table>
<thead>
  <tr>
    <th>
      Enricher
    </th>
    
    <th>
      Adds
    </th>
    
    <th>
      Source
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      User Agent
    </td>
    
    <td>
      <code>
        userAgent
      </code>
      
       (browser, OS, device)
    </td>
    
    <td>
      <code>
        User-Agent
      </code>
      
       header
    </td>
  </tr>
  
  <tr>
    <td>
      Geo
    </td>
    
    <td>
      <code>
        geo
      </code>
      
       (country, region, city)
    </td>
    
    <td>
      Platform headers (Vercel, Cloudflare)
    </td>
  </tr>
  
  <tr>
    <td>
      Request Size
    </td>
    
    <td>
      <code>
        requestSize
      </code>
      
       (request/response bytes)
    </td>
    
    <td>
      <code>
        Content-Length
      </code>
      
       headers
    </td>
  </tr>
  
  <tr>
    <td>
      Trace Context
    </td>
    
    <td>
      <code>
        traceContext
      </code>
      
       (traceId, spanId)
    </td>
    
    <td>
      <code>
        traceparent
      </code>
      
       header
    </td>
  </tr>
</tbody>
</table>

```typescript [server/plugins/evlog-enrich.ts]
import { createUserAgentEnricher, createGeoEnricher } from 'evlog/enrichers'

export default defineNitroPlugin((nitroApp) => {
  const enrichers = [createUserAgentEnricher(), createGeoEnricher()]

  nitroApp.hooks.hook('evlog:enrich', (ctx) => {
    for (const enricher of enrichers) enricher(ctx)
  })
})
```

Enrichers receive the full `EnrichContext` with the mutable event, request metadata, safe headers, and response info.

### 9. Drain (`evlog:drain`)

The final step sends the enriched event to your observability platform. The `evlog:drain` hook receives a `DrainContext` with the complete event:

```typescript [server/plugins/evlog-drain.ts]
import { createAxiomDrain } from 'evlog/axiom'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createAxiomDrain())
})
```

On platforms with `waitUntil` (Cloudflare Workers, Vercel Edge), the drain runs after the response is sent to avoid adding latency. On traditional servers, the drain is awaited to prevent losing events in serverless cold shutdowns.

## Hook Execution Order

<table>
<thead>
  <tr>
    <th>
      Order
    </th>
    
    <th>
      Hook
    </th>
    
    <th>
      When
    </th>
    
    <th>
      Purpose
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      1
    </td>
    
    <td>
      <code>
        evlog:emit:keep
      </code>
    </td>
    
    <td>
      After request ends, before sampling
    </td>
    
    <td>
      Force-keep events based on outcome
    </td>
  </tr>
  
  <tr>
    <td>
      2
    </td>
    
    <td>
      <code>
        evlog:enrich
      </code>
    </td>
    
    <td>
      After emit, before drain
    </td>
    
    <td>
      Add derived context to the event
    </td>
  </tr>
  
  <tr>
    <td>
      3
    </td>
    
    <td>
      <code>
        evlog:drain
      </code>
    </td>
    
    <td>
      After enrichment
    </td>
    
    <td>
      Send event to external services
    </td>
  </tr>
</tbody>
</table>

## Error vs Success Path

Both paths converge at the same emit/enrich/drain pipeline. The only difference is *when* the emit is triggered:

<table>
<thead>
  <tr>
    <th>
      
    </th>
    
    <th>
      Success
    </th>
    
    <th>
      Error
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        Trigger
      </strong>
    </td>
    
    <td>
      <code>
        afterResponse
      </code>
      
       / <code>
        response
      </code>
      
       hook
    </td>
    
    <td>
      <code>
        error
      </code>
      
       hook
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Level
      </strong>
    </td>
    
    <td>
      <code>
        info
      </code>
      
       (or <code>
        warn
      </code>
      
       if status >= 400)
    </td>
    
    <td>
      <code>
        error
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Status
      </strong>
    </td>
    
    <td>
      From response
    </td>
    
    <td>
      From error's <code>
        status
      </code>
      
       field (default 500)
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Error context
      </strong>
    </td>
    
    <td>
      None
    </td>
    
    <td>
      <code>
        error
      </code>
      
       field with message, stack, <code>
        why
      </code>
      
      , <code>
        fix
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Double-emit guard
      </strong>
    </td>
    
    <td>
      Checks <code>
        _evlogEmitted
      </code>
      
       flag
    </td>
    
    <td>
      Sets <code>
        _evlogEmitted = true
      </code>
    </td>
  </tr>
</tbody>
</table>

## Next Steps

- [Wide Events](/core-concepts/wide-events) - Design effective wide events
- [Sampling](/core-concepts/sampling) - Configure head and tail sampling
- [Adapters](/adapters/overview) - Send events to external platforms
- [Enrichers](/enrichers/overview) - Add derived context automatically



---

- [Wide Events](/core-concepts/wide-events)
- [Sampling](/core-concepts/sampling)

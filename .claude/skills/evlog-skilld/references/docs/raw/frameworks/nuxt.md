# Nuxt

> Automatic wide events, structured errors, drain adapters, enrichers, tail sampling, and client transport in Nuxt applications.

evlog provides a first-class Nuxt module with auto-imported `useLogger`, `createError`, and `parseError`. Add it to your config and start logging with zero boilerplate.

<code-collapse>

```txt [Prompt]
Set up evlog in my Nuxt app with wide events and structured errors.

- Install evlog: pnpm add evlog
- Add 'evlog/nuxt' to modules in nuxt.config.ts
- Set evlog.env.service to my app name
- useLogger, createError, and parseError are auto-imported
- Create a server/api route using useLogger(event) and log.set() to build a wide event
- Throw errors with createError({ message, status, why, fix })
- Wide events are auto-emitted when each request completes

Docs: https://www.evlog.dev/frameworks/nuxt
Adapters: https://www.evlog.dev/adapters
```

</code-collapse>

## Quick Start

### 1. Install

<code-group>

```bash [pnpm]
pnpm add evlog
```

```bash [npm]
npm install evlog
```

```bash [yarn]
yarn add evlog
```

```bash [bun]
bun add evlog
```

</code-group>

### 2. Add the module

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    env: {
      service: 'my-app',
    },
  },
})
```

That's it. `useLogger`, `createError`, and `parseError` are auto-imported.

## Wide Events

Build up context progressively throughout a request with `useLogger(event)`. evlog emits a single wide event when the request completes.

```typescript [server/api/checkout.post.ts]
export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const body = await readBody(event)

  log.set({ user: { id: body.userId, plan: 'enterprise' } })

  const cart = await db.findCart(body.cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const payment = await processPayment(cart)
  log.set({ payment: { method: payment.method, cardLast4: payment.last4 } })

  return { success: true, orderId: payment.orderId }
})
```

One request, one log line with all context:

```bash [Terminal output]
10:23:45 INFO [my-app] POST /api/checkout 200 in 145ms
  ├─ user: id=usr_123 plan=enterprise
  ├─ cart: items=3 total=14999
  ├─ payment: method=card cardLast4=4242
  └─ requestId: a1b2c3d4-...
```

## Error Handling

`createError` produces structured errors with `why`, `fix`, and `link` fields that help both humans and AI agents understand what went wrong.

```typescript [server/api/payment/process.post.ts]
export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const body = await readBody(event)

  log.set({ payment: { amount: body.amount } })

  if (body.amount <= 0) {
    throw createError({
      status: 400,
      message: 'Invalid payment amount',
      why: 'The amount must be a positive number',
      fix: 'Pass a positive integer in cents (e.g. 4999 for $49.99)',
      link: 'https://docs.example.com/api/payments#amount',
    })
  }

  return { success: true }
})
```

<callout color="info" icon="i-lucide-info">

Nuxt's error handler automatically catches `EvlogError` and returns a structured JSON response with `why`, `fix`, and `link` fields.

</callout>

## Configuration

<callout color="info" icon="i-lucide-book-open">

See the [Configuration reference](/core-concepts/configuration) for the full list of shared options (`enabled`, `pretty`, `silent`, `sampling`, middleware options, etc.).

</callout>

All options are set in `nuxt.config.ts` under the `evlog` key:

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Default
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        enabled
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Globally enable/disable all logging. When <code>
        false
      </code>
      
      , all operations become no-ops
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        console
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Enable/disable browser console output
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        env.service
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        'app'
      </code>
    </td>
    
    <td>
      Service name shown in logs
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        env.environment
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      Auto-detected
    </td>
    
    <td>
      Environment name
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        include
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Route patterns to log. Supports glob (<code>
        /api/**
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        exclude
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Route patterns to exclude. Exclusions take precedence
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        routes
      </code>
    </td>
    
    <td>
      <code>
        Record<string, RouteConfig>
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Route-specific service configuration
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pretty
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
      
       in dev
    </td>
    
    <td>
      Pretty print with tree formatting
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        silent
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      Suppress console output. Events are still built, sampled, and drained. Use for stdout-based platforms
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        sampling.rates
      </code>
    </td>
    
    <td>
      <code>
        object
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Head sampling rates per log level (0-100%)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        sampling.keep
      </code>
    </td>
    
    <td>
      <code>
        array
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Tail sampling conditions to force-keep logs
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        transport.enabled
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      Enable client-to-server log transport
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        transport.endpoint
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        '/api/_evlog/ingest'
      </code>
    </td>
    
    <td>
      Transport endpoint
    </td>
  </tr>
</tbody>
</table>

## Route Filtering

Use `include` and `exclude` to control which routes are logged:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    include: ['/api/**', '/auth/**'],
    exclude: [
      '/api/_nuxt_icon/**',
      '/api/_content/**',
      '/api/health',
    ],
  },
})
```

<callout color="warning" icon="i-lucide-alert-triangle">

**Exclusions take precedence.** If a path matches both `include` and `exclude`, it will be excluded.

</callout>

### Route-Based Service Names

Assign different service names to different route groups:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    env: { service: 'default-service' },
    routes: {
      '/api/auth/**': { service: 'auth-service' },
      '/api/payment/**': { service: 'payment-service' },
      '/api/booking/**': { service: 'booking-service' },
    },
  },
})
```

## Drain & Enrichers

Use Nitro plugin hooks to send logs to external services and enrich them with additional context.

### Drain Plugin

```typescript [server/plugins/evlog-drain.ts]
import type { DrainContext } from 'evlog'
import { createAxiomDrain } from 'evlog/axiom'
import { createDrainPipeline } from 'evlog/pipeline'

const pipeline = createDrainPipeline<DrainContext>({
  batch: { size: 50, intervalMs: 5000 },
  retry: { maxAttempts: 3 },
})
const drain = pipeline(createAxiomDrain())

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', drain)
})
```

### Enricher Plugin

```typescript [server/plugins/evlog-enrich.ts]
import {
  createUserAgentEnricher,
  createGeoEnricher,
  createRequestSizeEnricher,
  createTraceContextEnricher,
} from 'evlog/enrichers'

const enrichers = [
  createUserAgentEnricher(),
  createGeoEnricher(),
  createRequestSizeEnricher(),
  createTraceContextEnricher(),
]

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:enrich', (ctx) => {
    for (const enricher of enrichers) enricher(ctx)
  })
})
```

<callout color="neutral" icon="i-lucide-arrow-right">

See the [Adapters](/adapters/overview) and [Enrichers](/enrichers/overview) docs for the full list of available drains and enrichers.

</callout>

## Sampling

### Head Sampling

Randomly keep a percentage of logs per level. Runs before the request completes.

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    sampling: {
      rates: {
        info: 10,
        warn: 50,
        debug: 5,
        error: 100,
      },
    },
  },
})
```

Each level is a percentage from 0 to 100. Levels you don't configure default to 100% (keep everything). Error defaults to 100% even when other levels are configured.

### Tail Sampling

Evaluate after the request completes and force-keep logs that match specific conditions, regardless of head sampling.

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    sampling: {
      rates: { info: 10 },
      keep: [
        { duration: 1000 },
        { status: 400 },
        { path: '/api/critical/**' },
      ],
    },
  },
})
```

### Custom Tail Sampling

For conditions beyond status, duration, and path, use the `evlog:emit:keep` hook:

```typescript [server/plugins/evlog-sampling.ts]
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:emit:keep', (ctx) => {
    const user = ctx.context.user as { premium?: boolean } | undefined
    if (user?.premium) {
      ctx.shouldKeep = true
    }
  })
})
```

<callout color="info" icon="i-lucide-info">

Errors are always kept by default. You have to explicitly set `error: 0` to drop them.

</callout>

## Client Transport

Send browser logs to your server for processing and draining alongside server-side events.

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    transport: {
      enabled: true,
      endpoint: '/api/_evlog/ingest',
    },
  },
})
```

### How It Works

1. Client calls `log.info({ action: 'click', button: 'submit' })`
2. Log is sent to `/api/_evlog/ingest` via POST
3. Server enriches with environment context
4. `evlog:drain` hook is called with `source: 'client'`
5. External services receive the log

### Client Identity

Attach user context to every client log with `setIdentity`:

```typescript [Nuxt (auto-imported)]
// After login
setIdentity({ userId: 'usr_123', orgId: 'org_456' })

log.info({ action: 'checkout' })
// -> { userId: 'usr_123', orgId: 'org_456', action: 'checkout', ... }

// After logout
clearIdentity()
```

### Syncing Identity with Auth

Use a route middleware to keep identity in sync with your auth state:

```typescript [middleware/identity.global.ts]
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()

  if (user.value) {
    setIdentity({ userId: user.value.id, email: user.value.email })
  } else {
    clearIdentity()
  }
})
```

## Production Tips

Use Nuxt's `$production` override to keep full logging in development while sampling and disabling console output in production:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    env: { service: 'my-app' },
  },
  $production: {
    evlog: {
      console: false,
      sampling: {
        rates: { info: 10, warn: 50, debug: 0 },
        keep: [{ duration: 1000 }, { status: 400 }],
      },
    },
  },
})
```

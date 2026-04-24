# Sampling

> Control log volume with two-tier sampling. Head sampling drops noise by level, tail sampling rescues critical events based on outcome. Never miss errors, slow requests, or critical paths.

At scale, logging everything gets expensive fast. Sampling lets you keep costs under control without losing visibility into what matters. evlog uses a two-tier approach: head sampling drops noise upfront, tail sampling rescues critical events after the fact.

## Head Sampling

Head sampling randomly keeps a percentage of logs per level. It runs **before** the request completes, acting as a coin flip at emission time.

<code-group>

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    sampling: {
      rates: {
        info: 10,    // Keep 10% of info logs
        warn: 50,    // Keep 50% of warnings
        debug: 0,    // Drop all debug logs
        error: 100,  // Always keep errors (default)
      },
    },
  },
})
```

```typescript [lib/evlog.ts (Next.js)]
import { createEvlog } from 'evlog/next'

export const { withEvlog, useLogger } = createEvlog({
  service: 'my-app',
  sampling: {
    rates: {
      info: 10,
      warn: 50,
      debug: 0,
      error: 100,
    },
  },
})
```

```typescript [index.ts (Hono / Express / Fastify)]
import { initLogger } from 'evlog'

initLogger({
  env: { service: 'my-app' },
  sampling: {
    rates: {
      info: 10,
      warn: 50,
      debug: 0,
      error: 100,
    },
  },
})
```

</code-group>

Each level is a percentage from 0 to 100. Levels you don't configure default to 100% (keep everything). Error defaults to 100% even when other levels are configured, so you have to explicitly set `error: 0` to drop errors.

<callout color="info" icon="i-lucide-info">

Head sampling is random. A `10%` rate means roughly 1 in 10 info logs are kept, not exactly 1 in 10.

</callout>

## Tail Sampling

Head sampling is blind: it doesn't know if a request was slow, failed, or hit a critical path. Tail sampling fixes this by evaluating **after** the request completes and force-keeping logs that match specific conditions.

```typescript [nuxt.config.ts]
// Sampling config, works the same across all frameworks
evlog: {
  sampling: {
    rates: { info: 10 },
    keep: [
      { status: 400 },              // HTTP status >= 400
      { duration: 1000 },           // Request took >= 1s
      { path: '/api/payments/**' }, // Critical path (glob)
    ],
  },
}
```

Conditions use **>=** comparison for `status` and `duration`, and glob matching for `path`. If **any** condition matches, the log is kept regardless of head sampling (OR logic).

### Available Conditions

<table>
<thead>
  <tr>
    <th>
      Condition
    </th>
    
    <th>
      Type
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
        status
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      Keep if HTTP status >= value (e.g., <code>
        400
      </code>
      
       catches all 4xx and 5xx)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        duration
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      Keep if request duration >= value in milliseconds
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        path
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      Keep if request path matches glob pattern (e.g., <code>
        '/api/critical/**'
      </code>
      
      )
    </td>
  </tr>
</tbody>
</table>

## How They Work Together

The two tiers complement each other:

1. **Request completes** - evlog knows the status, duration, and path
2. **Tail sampling evaluates** - if any `keep` condition matches, the log is force-kept
3. **Head sampling applies** - only if tail sampling didn't force-keep, the random percentage check runs
4. **Log emits or drops** - kept logs go through enrichment and draining as normal

This means a request to `/api/payments/charge` that returns a 500 in 2 seconds will always be logged, even if `info` is set to 1%. The tail conditions rescue it.

<code-group>

```typescript [Configuration]
sampling: {
  rates: { info: 10 },
  keep: [
    { status: 400 },
    { duration: 1000 },
  ],
}
```

```bash [What gets logged]
POST /api/users     200  45ms   → 10% chance (head sampling)
POST /api/users     500  45ms   → always kept (status >= 400)
GET  /api/products  200  2300ms → always kept (duration >= 1000)
POST /api/checkout  200  120ms  → 10% chance (head sampling)
```

</code-group>

## Custom Tail Sampling

For conditions beyond status, duration, and path, use the `evlog:emit:keep` hook in Nuxt/Nitro or the `keep` callback in other frameworks.

<code-group>

```typescript [server/plugins/sampling.ts (Nuxt)]
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:emit:keep', (ctx) => {
    if (ctx.context.user?.plan === 'enterprise') {
      ctx.shouldKeep = true
    }
  })
})
```

```typescript [lib/evlog.ts (Next.js)]
import { createEvlog } from 'evlog/next'

export const { withEvlog, useLogger } = createEvlog({
  service: 'my-app',
  sampling: {
    rates: { info: 10 },
    keep: [{ status: 400 }],
  },
  keep(ctx) {
    if (ctx.context.user?.plan === 'enterprise') {
      ctx.shouldKeep = true
    }
  },
})
```

```typescript [index.ts (Hono)]
import { evlog } from 'evlog/hono'

app.use(evlog({
  keep(ctx) {
    if (ctx.context.user?.plan === 'enterprise') {
      ctx.shouldKeep = true
    }
  },
}))
```

</code-group>

The `ctx` object contains:

<table>
<thead>
  <tr>
    <th>
      Field
    </th>
    
    <th>
      Type
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
        status
      </code>
    </td>
    
    <td>
      <code>
        number | undefined
      </code>
    </td>
    
    <td>
      HTTP response status
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        duration
      </code>
    </td>
    
    <td>
      <code>
        number | undefined
      </code>
    </td>
    
    <td>
      Request duration in ms
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        path
      </code>
    </td>
    
    <td>
      <code>
        string | undefined
      </code>
    </td>
    
    <td>
      Request path
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        method
      </code>
    </td>
    
    <td>
      <code>
        string | undefined
      </code>
    </td>
    
    <td>
      HTTP method
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        context
      </code>
    </td>
    
    <td>
      <code>
        Record<string, unknown>
      </code>
    </td>
    
    <td>
      All fields set via <code>
        log.set()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        shouldKeep
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      Set to <code>
        true
      </code>
      
       to force-keep
    </td>
  </tr>
</tbody>
</table>

## Production Example

A typical production configuration that balances cost and visibility:

<code-group>

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    env: { service: 'my-app' },
  },
  $production: {
    evlog: {
      sampling: {
        rates: {
          info: 10,
          warn: 50,
          debug: 0,
          error: 100,
        },
        keep: [
          { status: 400 },
          { duration: 1000 },
          { path: '/api/payments/**' },
          { path: '/api/auth/**' },
        ],
      },
    },
  },
})
```

```typescript [lib/evlog.ts (Next.js)]
import { createEvlog } from 'evlog/next'

export const { withEvlog, useLogger } = createEvlog({
  service: 'my-app',
  sampling: {
    rates: {
      info: 10,
      warn: 50,
      debug: 0,
      error: 100,
    },
    keep: [
      { status: 400 },
      { duration: 1000 },
      { path: '/api/payments/**' },
      { path: '/api/auth/**' },
    ],
  },
})
```

```typescript [index.ts (Hono / Express / Fastify)]
import { initLogger } from 'evlog'

initLogger({
  env: { service: 'my-app' },
  sampling: {
    rates: {
      info: 10,
      warn: 50,
      debug: 0,
      error: 100,
    },
    keep: [
      { status: 400 },
      { duration: 1000 },
      { path: '/api/payments/**' },
      { path: '/api/auth/**' },
    ],
  },
})
```

</code-group>

<callout color="warning" icon="i-lucide-lightbulb">

In Nuxt, use the `$production` override to keep full logging in development while sampling in production. In other frameworks, use your own environment check or config system.

</callout>

## Next Steps

- [Best Practices](/core-concepts/best-practices) - Security and production checklist
- [Wide Events](/logging/wide-events) - Design effective wide events



---

- [Best Practices](/core-concepts/best-practices)
- [Wide Events](/logging/wide-events)

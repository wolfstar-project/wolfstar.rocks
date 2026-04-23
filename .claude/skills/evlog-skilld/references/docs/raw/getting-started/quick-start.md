# Quick Start

> Get up and running with evlog in minutes. Learn the log API, createLogger for wide events, useLogger for requests, and structured errors.

This guide covers the core APIs you'll use most often with evlog.

<callout color="info" icon="i-lucide-sparkles">

In Nuxt, evlog **auto-imports** all functions (`useLogger`, `log`, `createError`, `parseError`). No import statements needed.

</callout>

## log (Simple Logging)

The simplest way to use evlog. Fire-and-forget structured logs, anywhere in your code:

<code-group>

```typescript [Server]
import { log } from 'evlog'

log.info('auth', 'User logged in')
log.error({ action: 'payment', error: 'card_declined' })
log.warn('cache', 'Cache miss')
```

```bash [Output]
10:23:45.612 [auth] User logged in
10:23:45.613 ERROR [my-app] action=payment error=card_declined
10:23:45.614 [cache] Cache miss
```

</code-group>

Two call styles:

- **Tagged**: `log.info('tag', 'message')` for quick, readable console output
- **Structured**: `log.info({ key: value })` for rich events that flow through the drain pipeline

<callout color="neutral" icon="i-lucide-arrow-right">

See the full [Simple Logging](/logging/simple-logging) guide for all patterns and drain integration.

</callout>

## createLogger (Wide Events)

When you need to **accumulate context** across multiple steps of an operation, whether a script, background job, queue worker, or workflow, use `createLogger`:

<code-group>

```typescript [scripts/sync-job.ts]
import { initLogger, createLogger } from 'evlog'

initLogger({ env: { service: 'sync-worker' } })

const log = createLogger({ jobId: job.id, queue: 'emails' })

log.set({ batch: { size: 50 } })
log.set({ batch: { processed: 50 } })
log.emit()
```

```bash [Output (Pretty)]
10:23:45.612 INFO [sync-worker] in 1204ms
  ├─ jobId: job_abc123
  ├─ queue: emails
  └─ batch: size=50 processed=50
```

</code-group>

`createLogger()` accepts any initial context as a plain object. It returns a logger with `set`, `error`, `info`, `warn`, `emit`, and `getContext`.

For HTTP request contexts specifically, use `createRequestLogger()` which pre-populates `method`, `path`, and `requestId`:

```typescript [src/worker.ts]
import { createRequestLogger } from 'evlog'

const log = createRequestLogger({ method: 'POST', path: '/api/checkout' })
```

<callout color="info" icon="i-lucide-info">

With `createLogger` and `createRequestLogger`, you must call `log.emit()` manually. In framework integrations, this happens automatically.

</callout>

## useLogger (Retrieve the Request Logger)

When using a framework integration (Nuxt, Hono, Express, etc.), the middleware automatically creates a wide event logger on request start and emits it on response end. `useLogger(event)` retrieves that logger from the request context:

<code-group>

```typescript [server/api/checkout.post.ts]
import { useLogger } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)

  log.set({ user: { id: 1, plan: 'pro' } })
  log.set({ cart: { items: 3, total: 9999 } })

  const order = await processCheckout()
  log.set({ orderId: order.id })

  return { success: true, orderId: order.id }
})
```

```bash [Output (Pretty)]
10:23:45.612 INFO [my-app] POST /api/checkout 200 in 234ms
  ├─ user: id=1 plan=pro
  ├─ cart: items=3 total=9999
  └─ orderId: ord_abc123
```

</code-group>

<callout color="success" icon="i-lucide-check">

`useLogger` doesn't create a logger, the framework middleware already did that. It just retrieves it from the event context so you can add data with `set()`.

</callout>

### When to use what

<table>
<thead>
  <tr>
    <th>
      Use <code>
        log
      </code>
    </th>
    
    <th>
      Use <code>
        createLogger()
      </code>
      
       / <code>
        createRequestLogger()
      </code>
    </th>
    
    <th>
      Use <code>
        useLogger(event)
      </code>
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Quick one-off events
    </td>
    
    <td>
      Scripts, jobs, workers, queues, HTTP without a framework
    </td>
    
    <td>
      API routes with a framework integration
    </td>
  </tr>
  
  <tr>
    <td>
      No context accumulation needed
    </td>
    
    <td>
      Accumulate context over an operation
    </td>
    
    <td>
      Retrieve the request-scoped logger
    </td>
  </tr>
  
  <tr>
    <td>
      Client-side logging
    </td>
    
    <td>
      Wide events (one log per operation)
    </td>
    
    <td>
      Access the auto-managed wide event
    </td>
  </tr>
</tbody>
</table>

### Service Identification

In multi-service architectures, differentiate which service a log belongs to using either route-based configuration or explicit service names.

#### Route-Based Configuration

Configure service names per route pattern in your `nuxt.config.ts`:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],

  evlog: {
    env: {
      service: 'default-service',
    },
    routes: {
      '/api/auth/**': { service: 'auth-service' },
      '/api/payment/**': { service: 'payment-service' },
      '/api/booking/**': { service: 'booking-service' },
    },
  },
})
```

Logs from routes matching these patterns will automatically include the configured service name:

```bash [Output]
21:57:10.442 INFO [auth-service] POST /api/auth/login 200 in 1ms
  ├─ requestId: 88ced16a-bef2-4483-86cb-2b4fb677ea52
  ├─ user: id=user_123 email=demo@example.com
  └─ action: login
```

#### Explicit Service Parameter

Override the service name for specific routes using the second parameter of `useLogger`:

```typescript [server/api/legacy/process.post.ts]
import { useLogger } from 'evlog'

export default defineEventHandler((event) => {
  const log = useLogger(event, 'legacy-service')

  log.set({ action: 'process_legacy_request' })

  return { success: true }
})
```

<callout color="info" icon="i-lucide-info">

**Priority order:** Explicit `useLogger` parameter > Route configuration > `env.service` > Auto-detected from environment

</callout>

## createError (Structured Errors)

Use `createError()` to throw errors with actionable context:

<code-group>

```typescript [server/api/checkout.post.ts]
import { createError } from 'evlog'

throw createError({
  message: 'Payment failed',
  status: 402,
  why: 'Card declined by issuer',
  fix: 'Try a different payment method',
  link: 'https://docs.example.com/payments/declined',
})
```

```json [Response]
{
  "statusCode": 402,
  "message": "Payment failed",
  "data": {
    "why": "Card declined by issuer",
    "fix": "Try a different payment method",
    "link": "https://docs.example.com/payments/declined"
  }
}
```

</code-group>

### Error Fields

<table>
<thead>
  <tr>
    <th>
      Field
    </th>
    
    <th>
      Required
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
        message
      </code>
    </td>
    
    <td>
      Yes
    </td>
    
    <td>
      What happened (user-facing)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        status
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      HTTP status code (default: 500)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        why
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Technical reason (for debugging)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fix
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Actionable solution
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        link
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Documentation URL for more info
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cause
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Original error (if wrapping)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        internal
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Backend-only fields for logs and wide events — never included in HTTP JSON or <code>
        parseError()
      </code>
    </td>
  </tr>
</tbody>
</table>

### Frontend Integration

Use `parseError()` to extract all error fields on the client:

```typescript [composables/useCheckout.ts]
import { parseError } from 'evlog'

export async function checkout(cart: Cart) {
  try {
    await $fetch('/api/checkout', { method: 'POST', body: cart })
  } catch (err) {
    const error = parseError(err)

    toast.add({
      title: error.message,
      description: error.why,
      color: 'error',
      actions: error.link
        ? [{ label: 'Learn more', onClick: () => window.open(error.link) }]
        : undefined,
    })

    if (error.fix) {
      console.info(`Fix: ${error.fix}`)
    }
  }
}
```

## log (Client-Side)

The same `log` API works on the client side, outputting to the browser console:

<code-group>

```vue [components/CheckoutButton.vue]
<script setup lang="ts">
async function handleCheckout() {
  log.info('checkout', 'User initiated checkout')

  try {
    await $fetch('/api/checkout', { method: 'POST' })
    log.info({ action: 'checkout', status: 'success' })
  } catch (err) {
    log.error({ action: 'checkout', error: 'failed' })
  }
}
</script>
```

```typescript [composables/useAnalytics.ts]
export function useAnalytics() {
  function trackEvent(event: string, data?: Record<string, unknown>) {
    log.info('analytics', `Event: ${event}`)
    if (data) {
      log.debug({ event, ...data })
    }
  }

  return { trackEvent }
}
```

</code-group>

<callout color="neutral" icon="i-lucide-arrow-right">

See [Client Logging](/logging/client-logging) for transport configuration, identity context, and browser drain setup.

</callout>

## Next Steps

- [Logging Overview](/logging/overview): Understand all three logging modes
- [Wide Events](/logging/wide-events): Learn how to design effective wide events
- [Typed Fields](/core-concepts/typed-fields): Add compile-time type safety to your wide events
- [Structured Errors](/logging/structured-errors): Master error handling with evlog
- [Best Practices](/core-concepts/best-practices): Security guidelines and production tips



---

- [Logging Overview](/logging/overview)
- [Structured Errors](/logging/structured-errors)

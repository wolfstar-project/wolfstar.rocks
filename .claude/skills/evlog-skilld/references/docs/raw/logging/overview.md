# Logging Overview

> evlog gives you three ways to log. Simple one-liners, wide events that accumulate context, and auto-managed request logging. Choose the right one for your use case.

evlog provides three logging APIs, each designed for a different context. You can use all three in the same project.

## The Three Modes

<card-group>
<card color="neutral" icon="i-lucide-terminal" title="Simple Logging" to="/logging/simple-logging">

Fire-and-forget structured logs. Replace `console.log`, consola, or pino with `log.info`, `log.error`, `log.warn`, `log.debug`.

</card>

<card color="neutral" icon="i-lucide-layers" title="Wide Events" to="/logging/wide-events">

Accumulate context over a unit of work (a script, job, queue task, or request) then emit a single comprehensive event.

</card>

<card color="neutral" icon="i-lucide-git-branch" title="Request Logging" to="/frameworks/overview">

Auto-managed wide events scoped to HTTP requests. Framework middleware creates the logger and emits it for you.

</card>
</card-group>

## Quick Comparison

### Simple Logging (`log`)

One event per call. No accumulation, no lifecycle management.

```typescript [src/index.ts]
import { log } from 'evlog'

log.info('auth', 'User logged in')
log.error({ action: 'payment', error: 'card_declined', userId: 42 })
```

### Wide Events (`createLogger` / `createRequestLogger`)

One event per unit of work. Accumulate context progressively, emit when done.

<code-group>

```typescript [scripts/sync-job.ts]
import { createLogger } from 'evlog'

const log = createLogger({ jobId: 'sync-001', queue: 'emails' })
log.set({ batch: { size: 50, processed: 50 } })
log.emit()
```

```typescript [src/worker.ts]
import { createRequestLogger } from 'evlog'

const log = createRequestLogger({ method: 'POST', path: '/api/checkout' })
log.set({ user: { id: 1, plan: 'pro' } })
log.emit()
```

</code-group>

`createRequestLogger` is a thin wrapper around `createLogger` that pre-populates `method`, `path`, and `requestId`.

### Request Logging (framework middleware)

Framework integrations create a wide event logger automatically on each request. `useLogger(event)` retrieves the logger that's already attached to the request context:

```typescript [server/api/checkout.post.ts]
import { useLogger } from 'evlog'

export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  log.set({ user: { id: 1, plan: 'pro' } })
  return { success: true }
  // auto-emitted on response end
})
```

<callout color="info" icon="i-lucide-info">

`useLogger(event)` doesn't create a logger, it retrieves the one the framework middleware already attached to the event. Each framework has its own way to access it (`useLogger`, `req.log`, `c.get('log')`, etc.). In Nuxt, `useLogger` is auto-imported.

</callout>

## When to Use What

<table>
<thead>
  <tr>
    <th>
      
    </th>
    
    <th>
      <code>
        log
      </code>
    </th>
    
    <th>
      <code>
        createLogger
      </code>
      
       / <code>
        createRequestLogger
      </code>
    </th>
    
    <th>
      Framework middleware
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        Use case
      </strong>
    </td>
    
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
      <strong>
        Context
      </strong>
    </td>
    
    <td>
      Single call
    </td>
    
    <td>
      Accumulate with <code>
        set()
      </code>
    </td>
    
    <td>
      Accumulate with <code>
        set()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Emit
      </strong>
    </td>
    
    <td>
      Immediate
    </td>
    
    <td>
      Manual <code>
        emit()
      </code>
    </td>
    
    <td>
      Automatic on response end
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Lifecycle
      </strong>
    </td>
    
    <td>
      None
    </td>
    
    <td>
      You manage it
    </td>
    
    <td>
      Framework manages it
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Output
      </strong>
    </td>
    
    <td>
      Console + drain
    </td>
    
    <td>
      Console + drain
    </td>
    
    <td>
      Console + drain + enrich
    </td>
  </tr>
</tbody>
</table>

<callout color="info" icon="i-lucide-lightbulb">

Start with `log` for quick structured logging. When you need to accumulate context across an operation, switch to `createLogger` (or `createRequestLogger` for HTTP contexts). When using a framework integration, the middleware handles everything, just call `useLogger(event)` to retrieve the logger.

</callout>

## Shared Features

All three modes share the same foundation:

- **Pretty output** in development, **JSON** in production (default, no configuration needed)
- **Drain pipeline** to send events to Axiom, Sentry, PostHog, and more
- **Structured errors** with `why`, `fix`, and `link`, plus optional backend-only **internal** for logs
- **Sampling** to control log volume in production
- **Zero dependencies**, ~5 kB gzip

## Next Steps

- [Simple Logging](/logging/simple-logging): The `log` API in detail
- [Wide Events](/logging/wide-events): Accumulating context and emitting events
- [Structured Errors](/logging/structured-errors): Errors with actionable context
- [Frameworks](/frameworks/overview): Auto-managed request logging per framework



---

- [Simple Logging](/logging/simple-logging)
- [Wide Events](/logging/wide-events)

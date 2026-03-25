# Drain Pipeline

> Batch events, retry on failure, and protect against buffer overflow with the shared drain pipeline. Supports fan-out to multiple adapters.

In production, sending one HTTP request per log event is wasteful. The drain pipeline buffers events and sends them in batches, retries on transient failures, and drops the oldest events when the buffer overflows.

## Quick Start

```typescript [server/plugins/evlog-drain.ts]
import type { DrainContext } from 'evlog'
import { createDrainPipeline } from 'evlog/pipeline'
import { createAxiomDrain } from 'evlog/axiom'

export default defineNitroPlugin((nitroApp) => {
  const pipeline = createDrainPipeline<DrainContext>()
  const drain = pipeline(createAxiomDrain())

  nitroApp.hooks.hook('evlog:drain', drain)
  nitroApp.hooks.hook('close', () => drain.flush())
})
```

<callout color="warning" icon="i-lucide-alert-triangle">

Always call `drain.flush()` on server shutdown to ensure buffered events are sent before the process exits.

</callout>

## How It Works

1. Events are buffered in memory as they arrive via the `evlog:drain` hook
2. A batch is flushed when either the **batch size** is reached or the **interval** expires (whichever comes first)
3. If the drain function fails, the batch is retried with the configured **backoff strategy**
4. If all retries are exhausted, `onDropped` is called with the lost events
5. If the buffer exceeds `maxBufferSize`, the oldest events are dropped to prevent memory leaks

## Configuration

```typescript [server/plugins/evlog-drain.ts]
import type { DrainContext } from 'evlog'
import { createDrainPipeline } from 'evlog/pipeline'
import { createAxiomDrain } from 'evlog/axiom'

export default defineNitroPlugin((nitroApp) => {
  const pipeline = createDrainPipeline<DrainContext>({
    batch: {
      size: 50,          // Flush every 50 events
      intervalMs: 5000,  // Or every 5 seconds, whichever comes first
    },
    retry: {
      maxAttempts: 3,
      backoff: 'exponential',
      initialDelayMs: 1000,
      maxDelayMs: 30000,
    },
    maxBufferSize: 1000,
    onDropped: (events, error) => {
      console.error(`[evlog] Dropped ${events.length} events:`, error?.message)
    },
  })

  const drain = pipeline(createAxiomDrain())

  nitroApp.hooks.hook('evlog:drain', drain)
  nitroApp.hooks.hook('close', () => drain.flush())
})
```

### Options Reference

<table>
<thead>
  <tr>
    <th>
      Option
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
        batch.size
      </code>
    </td>
    
    <td>
      <code>
        50
      </code>
    </td>
    
    <td>
      Maximum events per batch
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        batch.intervalMs
      </code>
    </td>
    
    <td>
      <code>
        5000
      </code>
    </td>
    
    <td>
      Max time (ms) before flushing a partial batch
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        retry.maxAttempts
      </code>
    </td>
    
    <td>
      <code>
        3
      </code>
    </td>
    
    <td>
      Total attempts including the initial one
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        retry.backoff
      </code>
    </td>
    
    <td>
      <code>
        'exponential'
      </code>
    </td>
    
    <td>
      <code>
        'exponential'
      </code>
      
       | <code>
        'linear'
      </code>
      
       | <code>
        'fixed'
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        retry.initialDelayMs
      </code>
    </td>
    
    <td>
      <code>
        1000
      </code>
    </td>
    
    <td>
      Base delay for the first retry
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        retry.maxDelayMs
      </code>
    </td>
    
    <td>
      <code>
        30000
      </code>
    </td>
    
    <td>
      Upper bound for any retry delay
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        maxBufferSize
      </code>
    </td>
    
    <td>
      <code>
        1000
      </code>
    </td>
    
    <td>
      Max buffered events before dropping oldest
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        onDropped
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Callback when events are dropped (overflow or retry exhaustion)
    </td>
  </tr>
</tbody>
</table>

## Backoff Strategies

<table>
<thead>
  <tr>
    <th>
      Strategy
    </th>
    
    <th>
      Delay Pattern
    </th>
    
    <th>
      Use Case
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        exponential
      </code>
    </td>
    
    <td>
      1s, 2s, 4s, 8s...
    </td>
    
    <td>
      Default. Best for transient failures that may need time to recover
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        linear
      </code>
    </td>
    
    <td>
      1s, 2s, 3s, 4s...
    </td>
    
    <td>
      Predictable delay growth
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fixed
      </code>
    </td>
    
    <td>
      1s, 1s, 1s, 1s...
    </td>
    
    <td>
      Same delay every time. Useful for rate-limited APIs
    </td>
  </tr>
</tbody>
</table>

## Returned Drain Function

The function returned by `pipeline(drain)` is hook-compatible and exposes:

<table>
<thead>
  <tr>
    <th>
      Property
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
        drain(ctx)
      </code>
    </td>
    
    <td>
      <code>
        (ctx: T) => void
      </code>
    </td>
    
    <td>
      Push a single event into the buffer
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        drain.flush()
      </code>
    </td>
    
    <td>
      <code>
        () => Promise<void>
      </code>
    </td>
    
    <td>
      Force-flush all buffered events
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        drain.pending
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      Number of events currently buffered
    </td>
  </tr>
</tbody>
</table>

## Multiple Destinations

Wrap multiple adapters with a single pipeline:

```typescript [server/plugins/evlog-drain.ts]
import type { DrainContext } from 'evlog'
import { createDrainPipeline } from 'evlog/pipeline'
import { createAxiomDrain } from 'evlog/axiom'
import { createOTLPDrain } from 'evlog/otlp'

export default defineNitroPlugin((nitroApp) => {
  const axiom = createAxiomDrain()
  const otlp = createOTLPDrain()

  const pipeline = createDrainPipeline<DrainContext>()
  const drain = pipeline(async (batch) => {
    await Promise.allSettled([axiom(batch), otlp(batch)])
  })

  nitroApp.hooks.hook('evlog:drain', drain)
  nitroApp.hooks.hook('close', () => drain.flush())
})
```

## Custom Drain Function

You don't need an adapter. Pass any async function that accepts a batch:

```typescript [server/plugins/evlog-drain.ts]
import type { DrainContext } from 'evlog'
import { createDrainPipeline } from 'evlog/pipeline'

export default defineNitroPlugin((nitroApp) => {
  const pipeline = createDrainPipeline<DrainContext>({
    batch: { size: 100 },
  })

  const drain = pipeline(async (batch) => {
    await fetch('https://your-service.com/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch.map(ctx => ctx.event)),
    })
  })

  nitroApp.hooks.hook('evlog:drain', drain)
  nitroApp.hooks.hook('close', () => drain.flush())
})
```

## Standalone Usage (Without Nitro)

The pipeline works outside of Nitro. Use the `drain` option in `initLogger` to wire it up:

```typescript [index.ts]
import type { DrainContext } from 'evlog'
import { initLogger, log } from 'evlog'
import { createDrainPipeline } from 'evlog/pipeline'
import { createAxiomDrain } from 'evlog/axiom'

const pipeline = createDrainPipeline<DrainContext>({ batch: { size: 25 } })
const drain = pipeline(createAxiomDrain())

initLogger({ drain })

log.info({ action: 'started' }) // batched and drained

// Flush before exit
await drain.flush()
```

<callout color="neutral" icon="i-lucide-arrow-right">

See the full bun-script example for a complete working script.

</callout>

<callout color="neutral" icon="i-lucide-code">

See the [Next.js guide](/frameworks/nextjs) for a working implementation.

</callout>

## Next Steps

- [Adapters Overview](/adapters/overview) - Available built-in adapters
- [Custom Adapters](/adapters/custom) - Build your own drain function
- [Best Practices](/core-concepts/best-practices) - Security and production tips



---

- [Adapters Overview](/adapters/overview)
- [Custom Adapters](/adapters/custom)

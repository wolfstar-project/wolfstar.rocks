# HTTP drain

> Framework-agnostic HTTP log transport for sending client-side logs to your server via fetch or sendBeacon. Works in the browser or any environment with fetch. Use the `evlog/http` entry point.

Most observability tools focus on server-side logs. The HTTP drain gives you a framework-agnostic way to send structured logs from the browser to any HTTP endpoint without any vendor SDK or framework coupling.

<callout color="neutral" icon="i-lucide-info">

The `evlog/browser` import path is **deprecated** and re-exports the same API as `evlog/http`. It will be removed in the next **major** release. Prefer `evlog/http` for new code.

</callout>

## Quick Start

```typescript [app.ts]
import { initLogger, log } from 'evlog'
import { createHttpLogDrain } from 'evlog/http'

const drain = createHttpLogDrain({
  drain: { endpoint: 'https://logs.example.com/v1/ingest' },
})
initLogger({ drain })

log.info({ action: 'page_view', path: location.pathname })
```

## How It Works

1. `log.info()` / `log.warn()` / `log.error()` push events into a **memory buffer**
2. Events are **batched** by size (default 25) or time interval (default 2 s)
3. Batches are sent via `fetch` with `keepalive: true` so requests survive page navigation
4. When the page becomes hidden (tab switch, navigation), buffered events are flushed via `navigator.sendBeacon` as a fallback
5. Your **server endpoint** receives a `DrainContext[]` JSON array and processes it however you like

## Two-Tier API

### `createHttpLogDrain(options)`

High-level, pre-composed: creates a pipeline with batching, retry, and auto-flush on `visibilitychange`. Returns a `PipelineDrainFn<DrainContext>` directly usable with `initLogger({ drain })`.

```typescript [app.ts]
import { initLogger, log } from 'evlog'
import { createHttpLogDrain } from 'evlog/http'

const drain = createHttpLogDrain({
  drain: { endpoint: 'https://logs.example.com/v1/ingest' },
  pipeline: { batch: { size: 50, intervalMs: 5000 } },
})

initLogger({ drain })
log.info({ action: 'click', target: 'buy-button' })
```

### `createHttpDrain(config)`

Low-level transport function. Use this when you want full control over the pipeline configuration:

```typescript [app.ts]
import { createHttpDrain } from 'evlog/http'
import { createDrainPipeline } from 'evlog/pipeline'
import type { DrainContext } from 'evlog'

const transport = createHttpDrain({
  endpoint: 'https://logs.example.com/v1/ingest',
})
const pipeline = createDrainPipeline<DrainContext>({
  batch: { size: 100, intervalMs: 10000 },
  retry: { maxAttempts: 5 },
})

const drain = pipeline(transport)
```

## Configuration Reference

### `HttpDrainConfig`

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
        endpoint
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      <strong>
        (required)
      </strong>
      
       Full URL of the server ingest endpoint
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        headers
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Custom headers sent with each <code>
        fetch
      </code>
      
       request (e.g. <code>
        Authorization
      </code>
      
      , <code>
        X-API-Key
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        timeout
      </code>
    </td>
    
    <td>
      <code>
        5000
      </code>
    </td>
    
    <td>
      Request timeout in milliseconds
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useBeacon
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Use <code>
        sendBeacon
      </code>
      
       when the page is hidden
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        credentials
      </code>
    </td>
    
    <td>
      <code>
        'same-origin'
      </code>
    </td>
    
    <td>
      Fetch credentials mode (<code>
        'omit'
      </code>
      
      , <code>
        'same-origin'
      </code>
      
      , <code>
        'include'
      </code>
      
      ). Set to <code>
        'include'
      </code>
      
       for cross-origin endpoints
    </td>
  </tr>
</tbody>
</table>

### `HttpLogDrainOptions`

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
        drain
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      <strong>
        (required)
      </strong>
      
       <code>
        HttpDrainConfig
      </code>
      
       object
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pipeline
      </code>
    </td>
    
    <td>
      <code>
        { batch: { size: 25, intervalMs: 2000 }, retry: { maxAttempts: 2 } }
      </code>
    </td>
    
    <td>
      Pipeline configuration overrides
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        autoFlush
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Auto-register <code>
        visibilitychange
      </code>
      
       flush listener
    </td>
  </tr>
</tbody>
</table>

## sendBeacon Fallback

<callout color="info" icon="i-lucide-radio">

When `useBeacon` is enabled (the default) and the page becomes hidden, the drain automatically switches from `fetch` to `navigator.sendBeacon`. This ensures logs are delivered even when the user closes the tab or navigates away, preventing data loss on page exit.

</callout>

`sendBeacon` has a browser-imposed payload limit (~64 KB). If the payload exceeds this, the drain throws an error. Keep batch sizes reasonable (the default of 25 is well within limits).

## Authentication

Pass custom headers to protect your ingest endpoint:

```typescript [app.ts]
const drain = createHttpLogDrain({
  drain: {
    endpoint: 'https://logs.example.com/v1/ingest',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  },
})
```

<callout color="warning" icon="i-lucide-shield-alert">

`headers` are applied to `fetch` requests only. The `sendBeacon` API does not support custom headers, so when the page is hidden and `sendBeacon` is used, headers are not sent. If your endpoint requires authentication, consider validating via a session cookie (set `credentials: 'include'` for cross-origin endpoints, defaults to `'same-origin'`) or disable `sendBeacon` with `useBeacon: false`.

</callout>

## Server Endpoint

Your server needs a POST endpoint that accepts a `DrainContext[]` JSON body. Here are examples for common frameworks:

### Express

```typescript [server.ts]
app.post('/v1/ingest', express.json(), (req, res) => {
  for (const entry of req.body) {
    console.log('[BROWSER]', JSON.stringify(entry))
  }
  res.sendStatus(204)
})
```

### Hono

```typescript [server.ts]
app.post('/v1/ingest', async (c) => {
  const body = await c.req.json()
  for (const entry of body) {
    console.log('[BROWSER]', JSON.stringify(entry))
  }
  return c.body(null, 204)
})
```

## Full Control

Combine `createHttpDrain` with `createDrainPipeline` for maximum flexibility:

```typescript [app.ts]
import { initLogger, log } from 'evlog'
import type { DrainContext } from 'evlog'
import { createHttpDrain } from 'evlog/http'
import { createDrainPipeline } from 'evlog/pipeline'

const pipeline = createDrainPipeline<DrainContext>({
  batch: { size: 100, intervalMs: 10000 },
  retry: { maxAttempts: 5, backoff: 'exponential' },
  maxBufferSize: 500,
  onDropped: (events) => {
    console.warn(`Dropped ${events.length} client events`)
  },
})

const drain = pipeline(createHttpDrain({
  endpoint: 'https://logs.example.com/v1/ingest',
  timeout: 3000,
}))

initLogger({ drain })

log.info({ action: 'app_init' })

// Flush on page unload
window.addEventListener('beforeunload', () => drain.flush())
```

<callout color="neutral" icon="i-lucide-arrow-right">

See the full browser example for a working Hono server + browser page that demonstrates the complete flow end to end.

</callout>

<callout color="neutral" icon="i-lucide-code">

See the [Next.js guide](/frameworks/nextjs) for a working implementation.

</callout>

## Next Steps

- [Adapters Overview](/adapters/overview) - Available built-in adapters
- [Pipeline](/adapters/pipeline) - Batching, retry, and buffer overflow handling
- [Custom Adapters](/adapters/custom) - Build your own drain function



---

- [Adapters Overview](/adapters/overview)
- [Pipeline](/adapters/pipeline)

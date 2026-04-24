# Adapters Overview

> Send your logs to external services with evlog adapters. Built-in support for popular observability platforms and custom destinations.

Adapters let you send logs to external observability platforms. evlog provides built-in adapters for popular services, and you can create custom adapters for any destination.

## How Adapters Work

Adapters receive a `DrainContext` after each request completes and send the data to an external service. The drain runs in **fire-and-forget** mode, meaning it never blocks the HTTP response.

How you wire an adapter depends on your framework:

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
import { createAxiomDrain } from 'evlog/axiom'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createAxiomDrain())
})
```

```typescript [Hono]
import { createAxiomDrain } from 'evlog/axiom'

app.use(evlog({ drain: createAxiomDrain() }))
```

```typescript [Express]
import { createAxiomDrain } from 'evlog/axiom'

app.use(evlog({ drain: createAxiomDrain() }))
```

```typescript [Fastify]
import { createAxiomDrain } from 'evlog/axiom'

await app.register(evlog, { drain: createAxiomDrain() })
```

```typescript [Elysia]
import { createAxiomDrain } from 'evlog/axiom'

app.use(evlog({ drain: createAxiomDrain() }))
```

```typescript [NestJS]
import { createAxiomDrain } from 'evlog/axiom'

EvlogModule.forRoot({ drain: createAxiomDrain() })
```

```typescript [Standalone]
import { createAxiomDrain } from 'evlog/axiom'

initLogger({ drain: createAxiomDrain() })
```

</code-group>

<callout color="info" icon="i-lucide-cloud">

**Serverless Support:** On Cloudflare Workers and Vercel Edge, evlog automatically uses `waitUntil()` to ensure drains complete before the runtime terminates. No additional configuration needed.

</callout>

## Available Adapters

<card-group>
<card icon="i-custom-axiom" title="Axiom" to="/adapters/axiom">

Send logs to Axiom for powerful querying and dashboards.

</card>

<card icon="i-simple-icons-opentelemetry" title="OTLP" to="/adapters/otlp">

OpenTelemetry Protocol for Grafana, Datadog, Honeycomb, and more.

</card>

<card icon="i-custom-hyperdx" title="HyperDX" to="/adapters/hyperdx">

Send logs to HyperDX via OTLP/HTTP using their documented ingest endpoint and API key.

</card>

<card icon="i-simple-icons-posthog" title="PostHog" to="/adapters/posthog">

Send logs to PostHog Logs for structured logging and observability.

</card>

<card icon="i-simple-icons-sentry" title="Sentry" to="/adapters/sentry">

Send structured logs to Sentry Logs for high-cardinality querying.

</card>

<card icon="i-simple-icons-betterstack" title="Better Stack" to="/adapters/better-stack">

Send logs to Better Stack for log management and alerting.

</card>

<card icon="i-simple-icons-datadog" title="Datadog" to="/adapters/datadog">

Send logs to Datadog Logs via the native HTTP intake API.

</card>

<card icon="i-lucide-hard-drive" title="File System" to="/adapters/fs">

Write logs to local NDJSON files for debugging and AI agent integration.

</card>

<card icon="i-lucide-code" title="Custom" to="/adapters/custom">

Build your own adapter for any destination.

</card>

<card icon="i-lucide-globe" title="HTTP" to="/adapters/http">

Send client logs to your server over HTTP without framework coupling.

</card>

<card icon="i-lucide-workflow" title="Pipeline" to="/adapters/pipeline">

Batch events, retry on failure, and handle buffer overflow.

</card>
</card-group>

## Standalone Usage

In plain TypeScript or Bun scripts (no HTTP framework), use the `drain` option in `initLogger`. Every emitted event is drained automatically.

```typescript [index.ts]
import type { DrainContext } from 'evlog'
import { initLogger, log, createRequestLogger } from 'evlog'
import { createAxiomDrain } from 'evlog/axiom'
import { createDrainPipeline } from 'evlog/pipeline'

const pipeline = createDrainPipeline<DrainContext>()
const drain = pipeline(createAxiomDrain())

initLogger({
  env: { service: 'my-script' },
  drain,
})

log.info({ action: 'job_started' }) // drained automatically

const reqLog = createRequestLogger({ method: 'POST', path: '/process' })
reqLog.set({ processed: 42 })
reqLog.emit() // drained automatically

await drain.flush()
```

<callout color="neutral" icon="i-lucide-arrow-right">

See the full bun-script example for a realistic batch processing script.

</callout>

## Multiple Destinations

Send logs to multiple services simultaneously by composing drains:

```typescript [src/index.ts]
import { createAxiomDrain } from 'evlog/axiom'
import { createOTLPDrain } from 'evlog/otlp'

const axiom = createAxiomDrain()
const otlp = createOTLPDrain()

const drain = async (ctx) => {
  await Promise.allSettled([axiom(ctx), otlp(ctx)])
}
```

Then pass `drain` to your framework:

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', drain)
})
```

```typescript [Hono]
app.use(evlog({ drain }))
```

```typescript [Express]
app.use(evlog({ drain }))
```

```typescript [Fastify]
await app.register(evlog, { drain })
```

```typescript [Elysia]
app.use(evlog({ drain }))
```

```typescript [NestJS]
EvlogModule.forRoot({ drain })
```

```typescript [Standalone]
initLogger({ drain })
```

</code-group>

## Drain Context

Every adapter receives a `DrainContext` with:

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
        event
      </code>
    </td>
    
    <td>
      <code>
        WideEvent
      </code>
    </td>
    
    <td>
      The complete log event with all accumulated context
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        request
      </code>
    </td>
    
    <td>
      <code>
        object
      </code>
    </td>
    
    <td>
      Request metadata (<code>
        method
      </code>
      
      , <code>
        path
      </code>
      
      , <code>
        requestId
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        headers
      </code>
    </td>
    
    <td>
      <code>
        object
      </code>
    </td>
    
    <td>
      Safe HTTP headers (sensitive headers are filtered)
    </td>
  </tr>
</tbody>
</table>

<callout color="success" icon="i-lucide-shield-check">

**Security:** Sensitive headers (`authorization`, `cookie`, `x-api-key`, etc.) are automatically filtered and never passed to adapters.

</callout>

## Zero-Config Setup

All adapters support automatic configuration via environment variables. No code changes needed when deploying to different environments.

Each adapter reads from `NUXT_*` prefixed variables (for Nuxt/Nitro runtimeConfig) and unprefixed fallbacks (for any framework):

```bash [.env]
# Axiom (NUXT_AXIOM_* or AXIOM_*)
AXIOM_TOKEN=xaat-xxx
AXIOM_DATASET=my-logs

# OTLP (NUXT_OTLP_* or OTEL_*)
OTLP_ENDPOINT=https://otlp.example.com

# HyperDX (NUXT_HYPERDX_* or HYPERDX_*)
HYPERDX_API_KEY=<YOUR_HYPERDX_API_KEY_HERE>

# PostHog (NUXT_POSTHOG_* or POSTHOG_*)
POSTHOG_API_KEY=phc_xxx

# Sentry (NUXT_SENTRY_* or SENTRY_*)
SENTRY_DSN=https://key@o0.ingest.sentry.io/123

# Better Stack (NUXT_BETTER_STACK_* or BETTER_STACK_*)
BETTER_STACK_SOURCE_TOKEN=your-source-token

# Datadog (NUXT_DATADOG_* or DATADOG_* or DD_*)
DD_API_KEY=your-api-key
DD_SITE=datadoghq.eu
```

Adapters auto-read from these variables, so just call `createXDrain()` with no arguments.



---

- [Axiom](/adapters/axiom)
- [OTLP](/adapters/otlp)
- [HyperDX](/adapters/hyperdx)
- [PostHog](/adapters/posthog)
- [Sentry](/adapters/sentry)
- [Better Stack](/adapters/better-stack)
- [Datadog](/adapters/datadog)
- [File System](/adapters/fs)

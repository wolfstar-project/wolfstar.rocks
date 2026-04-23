# Sentry Adapter

> Send structured logs to Sentry Logs for high-cardinality querying and debugging. Zero-config setup with environment variables.

Sentry is an error tracking and performance monitoring platform. The evlog Sentry adapter sends your wide events as **Sentry Structured Logs**, visible in **Explore > Logs** in the Sentry dashboard with high-cardinality searchable attributes.

<code-collapse>

```txt [Prompt]
Add the Sentry drain adapter to send evlog wide events to Sentry Logs.

1. Identify which framework I'm using and follow its evlog integration pattern
2. Install evlog if not already installed
3. Import createSentryDrain from 'evlog/sentry'
4. Wire createSentryDrain() into my framework's drain configuration
5. Set SENTRY_DSN environment variable
6. Test by triggering a request and checking Sentry > Explore > Logs

Adapter docs: https://www.evlog.dev/adapters/sentry
Framework setup: https://www.evlog.dev/frameworks
```

</code-collapse>

## Installation

The Sentry adapter comes bundled with evlog:

```typescript [src/index.ts]
import { createSentryDrain } from 'evlog/sentry'
```

## Quick Start

### 1. Get your Sentry DSN

1. Create a Sentry account
2. Create a new project (Node.js or JavaScript)
3. Find your DSN in **Settings > Projects > Your Project > Client Keys (DSN)**

### 2. Set environment variables

```bash [.env]
SENTRY_DSN=https://your-public-key@o0.ingest.sentry.io/your-project-id
```

### 3. Wire the drain to your framework

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
import { createSentryDrain } from 'evlog/sentry'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createSentryDrain())
})
```

```typescript [Hono]
import { createSentryDrain } from 'evlog/sentry'

app.use(evlog({ drain: createSentryDrain() }))
```

```typescript [Express]
import { createSentryDrain } from 'evlog/sentry'

app.use(evlog({ drain: createSentryDrain() }))
```

```typescript [Fastify]
import { createSentryDrain } from 'evlog/sentry'

await app.register(evlog, { drain: createSentryDrain() })
```

```typescript [Elysia]
import { createSentryDrain } from 'evlog/sentry'

app.use(evlog({ drain: createSentryDrain() }))
```

```typescript [NestJS]
import { createSentryDrain } from 'evlog/sentry'

EvlogModule.forRoot({ drain: createSentryDrain() })
```

```typescript [Standalone]
import { createSentryDrain } from 'evlog/sentry'

initLogger({ drain: createSentryDrain() })
```

</code-group>

That's it! Your logs will now appear in **Explore > Logs** in Sentry.

## Configuration

The adapter reads configuration from multiple sources (highest priority first):

1. **Overrides** passed to `createSentryDrain()`
2. **Runtime config** at `runtimeConfig.sentry` (Nuxt/Nitro only)
3. **Environment variables** (`SENTRY_*` or `NUXT_SENTRY_*`)

### Environment Variables

<table>
<thead>
  <tr>
    <th>
      Variable
    </th>
    
    <th>
      Nuxt alias
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
        SENTRY_DSN
      </code>
    </td>
    
    <td>
      <code>
        NUXT_SENTRY_DSN
      </code>
    </td>
    
    <td>
      Sentry DSN (required)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        SENTRY_ENVIRONMENT
      </code>
    </td>
    
    <td>
      <code>
        NUXT_SENTRY_ENVIRONMENT
      </code>
    </td>
    
    <td>
      Environment name override
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        SENTRY_RELEASE
      </code>
    </td>
    
    <td>
      <code>
        NUXT_SENTRY_RELEASE
      </code>
    </td>
    
    <td>
      Release version override
    </td>
  </tr>
</tbody>
</table>

### Runtime Config (Nuxt only)

Configure via `nuxt.config.ts` for type-safe configuration:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['evlog/nuxt'],
  evlog: {
    sentry: {
      dsn: '', // Set via NUXT_SENTRY_DSN
      environment: 'production',
      release: '1.0.0',
    },
  },
})
```

### Override Options

Pass options directly to override any configuration:

```typescript [server/plugins/evlog-drain.ts]
const drain = createSentryDrain({
  dsn: 'https://key@o0.ingest.sentry.io/123',
  tags: { team: 'backend' },
  timeout: 10000,
})
```

### Full Configuration Reference

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
        dsn
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Sentry DSN (required)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        environment
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      Event environment
    </td>
    
    <td>
      Environment name
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        release
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      Event version
    </td>
    
    <td>
      Release version
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        tags
      </code>
    </td>
    
    <td>
      <code>
        Record<string, string>
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Additional attributes to attach
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
        number
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
</tbody>
</table>

## Log Transformation

evlog wide events are converted to Sentry Logs using `toSentryLog()`:

- **Level mapping**: evlog levels map directly (`debug`, `info`, `warn`, `error`)
- **Severity numbers**: Follow the OpenTelemetry spec (`debug=5`, `info=9`, `warn=13`, `error=17`)
- **Body**: Derived from the event's `message`, `action`, or `path` fields (first available)
- **Attributes**: All wide event fields are sent as typed attributes (string, integer, double, boolean). Complex objects are serialized to JSON strings.
- **Sentry attributes**: `sentry.environment` and `sentry.release` are set automatically
- **Trace ID**: Uses `event.traceId` if available, otherwise generates a random one

## Querying Logs in Sentry

evlog sends wide events as structured logs. In the Sentry dashboard:

- **Explore > Logs**: View all evlog wide events with full attribute search
- **Filter by attributes**: `service:my-app`, `level:error`, or any wide event field
- **Trace correlation**: Logs are linked to traces via `trace_id` for cross-referencing

<callout color="info" icon="i-lucide-info">

Sentry Structured Logs support high-cardinality attributes, making them a great fit for evlog's wide events. Every field in your wide event becomes a searchable attribute in Sentry.

</callout>

## Troubleshooting

### Missing DSN error

```text [Console]
[evlog/sentry] Missing DSN. Set SENTRY_DSN env var or pass to createSentryDrain()
```

Make sure your environment variable is set and the server was restarted after adding it.

### Invalid DSN

If the DSN is malformed (missing public key or project ID), the adapter will throw an error. Verify your DSN format:

```text [Sentry DSN format]
https://<public-key>@<host>/<project-id>
```

### 401 Unauthorized

Your DSN may be revoked or invalid. Generate a new DSN in **Settings > Projects > Client Keys (DSN)**.

## Direct API Usage

For advanced use cases, you can use the lower-level functions:

```typescript [server/utils/sentry.ts]
import { sendToSentry, sendBatchToSentry } from 'evlog/sentry'

// Send a single event as a Sentry log
await sendToSentry(event, {
  dsn: process.env.SENTRY_DSN!,
})

// Send multiple events in one request
await sendBatchToSentry(events, {
  dsn: process.env.SENTRY_DSN!,
})
```

## Next Steps

- [Axiom Adapter](/adapters/axiom) - Send logs to Axiom for querying and dashboards
- [OTLP Adapter](/adapters/otlp) - Send logs via OpenTelemetry Protocol
- [PostHog Adapter](/adapters/posthog) - Send logs to PostHog
- [Custom Adapters](/adapters/custom) - Build your own adapter



---

- Sentry Dashboard
- [OTLP Adapter](/adapters/otlp)

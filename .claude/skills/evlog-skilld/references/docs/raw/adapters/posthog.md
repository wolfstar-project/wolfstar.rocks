# PostHog Adapter

> Send wide events to PostHog Logs via OTLP for structured log querying, debugging, and observability in your PostHog dashboard.

PostHog is an open-source product analytics platform. The evlog PostHog adapter sends your wide events to PostHog Logs via the standard OTLP format, giving you a dedicated log viewer with filtering, search, and tail mode using your existing PostHog API key.

<code-collapse>

```txt [Prompt]
Add the PostHog drain adapter to send evlog wide events to PostHog Logs.

1. Identify which framework I'm using and follow its evlog integration pattern
2. Install evlog if not already installed
3. Import createPostHogDrain from 'evlog/posthog'
4. Wire createPostHogDrain() into my framework's drain configuration
5. Set POSTHOG_API_KEY environment variable
6. Optionally set POSTHOG_HOST for EU or self-hosted instances
7. Test by triggering a request and checking PostHog > Logs

Adapter docs: https://www.evlog.dev/adapters/posthog
Framework setup: https://www.evlog.dev/frameworks
```

</code-collapse>

## Installation

The PostHog adapter comes bundled with evlog:

```typescript [src/index.ts]
import { createPostHogDrain } from 'evlog/posthog'
```

## Quick Start

### 1. Get your PostHog project API key

1. Log in to your PostHog dashboard
2. Go to **Settings** > **Project** > **Project API Key**
3. Copy the key (starts with `phc_`)

### 2. Set environment variables

```bash [.env]
POSTHOG_API_KEY=phc_your-project-api-key
```

### 3. Wire the drain to your framework

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
import { createPostHogDrain } from 'evlog/posthog'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createPostHogDrain())
})
```

```typescript [Hono]
import { createPostHogDrain } from 'evlog/posthog'

app.use(evlog({ drain: createPostHogDrain() }))
```

```typescript [Express]
import { createPostHogDrain } from 'evlog/posthog'

app.use(evlog({ drain: createPostHogDrain() }))
```

```typescript [Fastify]
import { createPostHogDrain } from 'evlog/posthog'

await app.register(evlog, { drain: createPostHogDrain() })
```

```typescript [Elysia]
import { createPostHogDrain } from 'evlog/posthog'

app.use(evlog({ drain: createPostHogDrain() }))
```

```typescript [NestJS]
import { createPostHogDrain } from 'evlog/posthog'

EvlogModule.forRoot({ drain: createPostHogDrain() })
```

```typescript [Standalone]
import { createPostHogDrain } from 'evlog/posthog'

initLogger({ drain: createPostHogDrain() })
```

</code-group>

That's it! Your wide events will now appear in PostHog Logs with full OTLP structure including severity levels, trace context, and structured attributes.

## Configuration

The adapter reads configuration from multiple sources (highest priority first):

1. **Overrides** passed to `createPostHogDrain()`
2. **Runtime config** at `runtimeConfig.posthog` (Nuxt/Nitro only)
3. **Environment variables** (`POSTHOG_*` or `NUXT_POSTHOG_*`)

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
        POSTHOG_API_KEY
      </code>
    </td>
    
    <td>
      <code>
        NUXT_POSTHOG_API_KEY
      </code>
    </td>
    
    <td>
      Project API key (starts with <code>
        phc_
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        POSTHOG_HOST
      </code>
    </td>
    
    <td>
      <code>
        NUXT_POSTHOG_HOST
      </code>
    </td>
    
    <td>
      PostHog host URL (for EU or self-hosted)
    </td>
  </tr>
</tbody>
</table>

### Runtime Config (Nuxt only)

Configure via `nuxt.config.ts` for type-safe configuration:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  runtimeConfig: {
    posthog: {
      apiKey: '', // Set via NUXT_POSTHOG_API_KEY
      host: '', // Set via NUXT_POSTHOG_HOST
    },
  },
})
```

### Override Options

Pass options directly to override any configuration:

```typescript [server/plugins/evlog-drain.ts]
const drain = createPostHogDrain({
  host: 'https://eu.i.posthog.com',
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
        apiKey
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
      Project API key (required)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        host
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        https://us.i.posthog.com
      </code>
    </td>
    
    <td>
      PostHog host URL
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

## How It Works

Under the hood, `createPostHogDrain()` wraps the OTLP adapter's `sendBatchToOTLP()` with PostHog-specific defaults:

- **Endpoint**: `{host}/i/v1/logs` (PostHog's OTLP log ingest endpoint)
- **Auth**: `Authorization: Bearer {apiKey}` header
- **Format**: Standard OTLP `ExportLogsServiceRequest` with severity levels, trace context, and structured attributes

## Regions

PostHog offers US and EU cloud hosting. Set the `host` to match your region:

<table>
<thead>
  <tr>
    <th>
      Region
    </th>
    
    <th>
      Host
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      US (default)
    </td>
    
    <td>
      <code>
        https://us.i.posthog.com
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      EU
    </td>
    
    <td>
      <code>
        https://eu.i.posthog.com
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Self-hosted
    </td>
    
    <td>
      Your instance URL
    </td>
  </tr>
</tbody>
</table>

```bash [.env]
# EU region
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://eu.i.posthog.com
```

## Querying Logs in PostHog

Once your logs are flowing, use the **Logs** tab in PostHog to query them:

1. Go to **Logs** and filter by service, severity, or any structured attribute
2. Use the search bar to find specific log entries
3. Click on a log entry to see all structured attributes

## PostHog Events (Custom Events)

If you prefer sending logs as PostHog custom events (e.g., for product analytics, cohorts, or funnels), use `createPostHogEventsDrain()`:

```typescript [server/plugins/evlog-drain.ts]
import { createPostHogEventsDrain } from 'evlog/posthog'

const drain = createPostHogEventsDrain({
  eventName: 'server_request',
  distinctId: 'my-backend-service',
})
```

Then pass `drain` to your framework the same way as `createPostHogDrain()` (see [Quick Start](#quick-start) above).

<callout color="info" icon="i-lucide-info">

Custom events count towards your PostHog event quota. PostHog Logs (the default `createPostHogDrain()`) is significantly cheaper.

</callout>

### Events Configuration

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
        apiKey
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
      Project API key (required)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        host
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        https://us.i.posthog.com
      </code>
    </td>
    
    <td>
      PostHog host URL
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        eventName
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        evlog_wide_event
      </code>
    </td>
    
    <td>
      PostHog event name
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        distinctId
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        event.service
      </code>
    </td>
    
    <td>
      Override <code>
        distinct_id
      </code>
      
       for all events
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

### Event Format

evlog maps wide events to PostHog events:

<table>
<thead>
  <tr>
    <th>
      evlog Field
    </th>
    
    <th>
      PostHog Field
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        config.distinctId
      </code>
      
       or <code>
        userId
      </code>
      
       or <code>
        service
      </code>
    </td>
    
    <td>
      <code>
        distinct_id
      </code>
      
       (fallback chain)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        timestamp
      </code>
    </td>
    
    <td>
      <code>
        timestamp
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        level
      </code>
    </td>
    
    <td>
      <code>
        properties.level
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        service
      </code>
    </td>
    
    <td>
      <code>
        properties.service
      </code>
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
        properties.environment
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      All other fields
    </td>
    
    <td>
      <code>
        properties.*
      </code>
    </td>
  </tr>
</tbody>
</table>

### Distinct ID Resolution

The `distinct_id` follows a fallback chain:

1. **config.distinctId** - explicit override in `createPostHogEventsDrain()`
2. **event.userId** - automatically picked up if present as a string
3. **event.service** - final fallback

### Logs vs Events

<table>
<thead>
  <tr>
    <th>
      
    </th>
    
    <th>
      <code>
        createPostHogDrain()
      </code>
    </th>
    
    <th>
      <code>
        createPostHogEventsDrain()
      </code>
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <strong>
        Format
      </strong>
    </td>
    
    <td>
      OTLP Logs (<code>
        /i/v1/logs
      </code>
      
      )
    </td>
    
    <td>
      PostHog Events (<code>
        /batch/
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        PostHog UI
      </strong>
    </td>
    
    <td>
      Logs viewer
    </td>
    
    <td>
      Events explorer
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Cost
      </strong>
    </td>
    
    <td>
      Lower (dedicated logs pipeline)
    </td>
    
    <td>
      Higher (counts as events)
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Best for
      </strong>
    </td>
    
    <td>
      Debugging, log search, observability
    </td>
    
    <td>
      Product analytics, cohorts, funnels
    </td>
  </tr>
</tbody>
</table>

You can use both drains simultaneously to get the best of both worlds:

```typescript [server/plugins/evlog-drain.ts]
import { createPostHogDrain, createPostHogEventsDrain } from 'evlog/posthog'

const logs = createPostHogDrain()
const events = createPostHogEventsDrain()

const drain = async (ctx) => {
  await Promise.allSettled([logs(ctx), events(ctx)])
}
```

## Troubleshooting

### Missing apiKey error

```text [Console]
[evlog/posthog] Missing apiKey. Set POSTHOG_API_KEY env var or pass to createPostHogDrain()
```

Make sure your environment variable is set and the server was restarted after adding it.

### Events not appearing

PostHog processes events asynchronously. There may be a short delay (typically under 1 minute) before events appear in the dashboard.

1. Check the server console for `[evlog/posthog]` error messages
2. Verify your API key is correct and starts with `phc_`
3. Confirm your `host` matches your PostHog region (US vs EU)

### Wrong region

If you're on PostHog EU but using the default US host, event delivery will fail and the adapter will log errors (for example under `[evlog/posthog]`) to your server console. Set the correct host:

```bash [.env]
POSTHOG_HOST=https://eu.i.posthog.com
```

## Direct API Usage

For advanced use cases, you can use the lower-level functions:

```typescript [server/utils/posthog.ts]
import { sendToPostHog, sendBatchToPostHog } from 'evlog/posthog'

// Send a single event to PostHog Logs (OTLP)
await sendToPostHog(event, {
  apiKey: 'phc_xxx',
})

// Send multiple events in one request
await sendBatchToPostHog(events, {
  apiKey: 'phc_xxx',
})
```

For custom events, use the events-specific functions:

```typescript [server/utils/posthog.ts]
import { sendToPostHogEvents, sendBatchToPostHogEvents, toPostHogEvent } from 'evlog/posthog'

// Send a single custom event
await sendToPostHogEvents(event, {
  apiKey: 'phc_xxx',
})

// Send multiple custom events in one request
await sendBatchToPostHogEvents(events, {
  apiKey: 'phc_xxx',
})

// Convert event to PostHog format (for inspection)
const posthogEvent = toPostHogEvent(event, { apiKey: 'phc_xxx' })
```

## Next Steps

- [Axiom Adapter](/adapters/axiom) - Send logs to Axiom
- [OTLP Adapter](/adapters/otlp) - Send logs via OpenTelemetry Protocol
- [Custom Adapters](/adapters/custom) - Build your own adapter
- [Best Practices](/core-concepts/best-practices) - Security and production tips



---

- PostHog Dashboard
- [Axiom Adapter](/adapters/axiom)

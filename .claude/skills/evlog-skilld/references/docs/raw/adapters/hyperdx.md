# HyperDX Adapter

> Send wide events to HyperDX via OTLP/HTTP using HyperDX’s documented OpenTelemetry endpoint and authorization header. Zero-config setup with environment variables.

HyperDX is an open-source observability platform. The evlog HyperDX adapter sends your wide events to HyperDX using **OTLP over HTTP**, with defaults aligned to HyperDX’s OpenTelemetry documentation.

<code-collapse>

```txt [Prompt]
Add the HyperDX drain adapter to send evlog wide events to HyperDX.

1. Identify which framework I'm using and follow its evlog integration pattern
2. Install evlog if not already installed
3. Import createHyperDXDrain from 'evlog/hyperdx'
4. Wire createHyperDXDrain() into my framework's drain configuration
5. Set HYPERDX_API_KEY environment variable in .env
6. Test by triggering a request and checking HyperDX

Adapter docs: https://www.evlog.dev/adapters/hyperdx
Framework setup: https://www.evlog.dev/frameworks
```

</code-collapse>

## Installation

The HyperDX adapter comes bundled with evlog:

```typescript
import { createHyperDXDrain } from 'evlog/hyperdx'
```

## Quick Start

### 1. Get your ingestion API key

1. Open the HyperDX dashboard for your team
2. Copy your **ingestion API key** (HyperDX documents this as the value for the `authorization` header in their OpenTelemetry examples)

### 2. Set environment variables

```bash [.env]
HYPERDX_API_KEY=<YOUR_HYPERDX_API_KEY_HERE>
```

### 3. Wire the drain to your framework

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
import { createHyperDXDrain } from 'evlog/hyperdx'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createHyperDXDrain())
})
```

```typescript [Hono]
import { createHyperDXDrain } from 'evlog/hyperdx'

app.use(evlog({ drain: createHyperDXDrain() }))
```

```typescript [Express]
import { createHyperDXDrain } from 'evlog/hyperdx'

app.use(evlog({ drain: createHyperDXDrain() }))
```

```typescript [Fastify]
import { createHyperDXDrain } from 'evlog/hyperdx'

await app.register(evlog, { drain: createHyperDXDrain() })
```

```typescript [Elysia]
import { createHyperDXDrain } from 'evlog/hyperdx'

app.use(evlog({ drain: createHyperDXDrain() }))
```

```typescript [NestJS]
import { createHyperDXDrain } from 'evlog/hyperdx'

EvlogModule.forRoot({ drain: createHyperDXDrain() })
```

```typescript [Standalone]
import { createHyperDXDrain } from 'evlog/hyperdx'

initLogger({ drain: createHyperDXDrain() })
```

</code-group>

That's it! Your wide events will now appear in HyperDX.

## Configuration

The adapter reads configuration from multiple sources (highest priority first):

1. **Overrides** passed to `createHyperDXDrain()`
2. **Runtime config** at `runtimeConfig.evlog.hyperdx` or `runtimeConfig.hyperdx` (Nuxt/Nitro only)
3. **Environment variables** (`HYPERDX_*` or `NUXT_HYPERDX_*`)

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
        HYPERDX_API_KEY
      </code>
    </td>
    
    <td>
      <code>
        NUXT_HYPERDX_API_KEY
      </code>
    </td>
    
    <td>
      Ingestion API key (sent as the <code>
        authorization
      </code>
      
       header)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        HYPERDX_OTLP_ENDPOINT
      </code>
    </td>
    
    <td>
      <code>
        NUXT_HYPERDX_OTLP_ENDPOINT
      </code>
    </td>
    
    <td>
      OTLP HTTP base URL (default: <code>
        https://in-otel.hyperdx.io
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        HYPERDX_SERVICE_NAME
      </code>
    </td>
    
    <td>
      <code>
        NUXT_HYPERDX_SERVICE_NAME
      </code>
    </td>
    
    <td>
      Override <code>
        service.name
      </code>
    </td>
  </tr>
</tbody>
</table>

The following variable is also read when resolving `serviceName` (same as the OTLP adapter):

<table>
<thead>
  <tr>
    <th>
      Variable
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
        OTEL_SERVICE_NAME
      </code>
    </td>
    
    <td>
      Fallback for service name (HyperDX SDK examples use this)
    </td>
  </tr>
</tbody>
</table>

<callout color="info" icon="i-lucide-info">

In Nuxt/Nitro, use the `NUXT_` prefix so values are available via `useRuntimeConfig()`. In all other frameworks, use the unprefixed variables.

</callout>

### Runtime Config (Nuxt only)

Configure via `nuxt.config.ts` for type-safe configuration:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  runtimeConfig: {
    hyperdx: {
      apiKey: '', // Set via NUXT_HYPERDX_API_KEY
      // endpoint: '', // Set via NUXT_HYPERDX_OTLP_ENDPOINT
    },
  },
})
```

You can also nest keys under `runtimeConfig.evlog.hyperdx`; both match how the adapter resolves Nuxt runtime config.

### Override Options

Pass options directly to override any configuration:

```typescript
const drain = createHyperDXDrain({
  apiKey: process.env.HYPERDX_API_KEY!,
  endpoint: 'https://in-otel.hyperdx.io',
  timeout: 10000,
})
```

For self-hosted HyperDX, set `endpoint` to your OTLP HTTP base URL (same role as `endpoint` in HyperDX’s `otlphttp` exporter example).

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
      Ingestion API key (required). Sent as the <code>
        authorization
      </code>
      
       header value
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        endpoint
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        https://in-otel.hyperdx.io
      </code>
    </td>
    
    <td>
      OTLP HTTP base URL (evlog appends <code>
        /v1/logs
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        serviceName
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
      Override <code>
        service.name
      </code>
      
       resource attribute
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        resourceAttributes
      </code>
    </td>
    
    <td>
      <code>
        object
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Additional OTLP resource attributes
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
  
  <tr>
    <td>
      <code>
        retries
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      <code>
        2
      </code>
    </td>
    
    <td>
      Retry attempts on transient failures
    </td>
  </tr>
</tbody>
</table>

## How It Works

Under the hood, `createHyperDXDrain()` maps your HyperDX settings to the shared [OTLP adapter](/adapters/otlp) and calls `sendBatchToOTLP()`:

- **Endpoint**: OTLP HTTP base URL, defaulting to `https://in-otel.hyperdx.io` (evlog posts to `{endpoint}/v1/logs`)
- **Auth**: `authorization` header set to your API key (same as HyperDX’s documented `otlphttp` exporter)
- **Format**: Standard OTLP JSON `ExportLogsServiceRequest` with severity, trace context when present, and structured attributes

## Official HyperDX OpenTelemetry reference

From HyperDX — OpenTelemetry:

> Our OpenTelemetry HTTP endpoint is hosted at `https://in-otel.hyperdx.io` (gRPC at port 4317), and requires the `authorization` header to be set to your API key.

HyperDX documents this collector configuration (HTTP and gRPC exporters):

```yaml
exporters:
  # HTTP setup
  otlphttp/hdx:
    endpoint: 'https://in-otel.hyperdx.io'
    headers:
      authorization: <YOUR_HYPERDX_API_KEY_HERE>
    compression: gzip

  # gRPC setup (alternative)
  otlp/hdx:
    endpoint: 'in-otel.hyperdx.io:4317'
    headers:
      authorization: <YOUR_HYPERDX_API_KEY_HERE>
    compression: gzip
```

evlog uses the **HTTP** path: JSON to `{endpoint}/v1/logs` with `Content-Type: application/json` and the `authorization` header above. The collector may enable `compression: gzip`; evlog sends uncompressed JSON bodies like typical OTLP HTTP clients.

## Querying logs in HyperDX

Use the HyperDX UI to search and explore wide events:

- **Search**: Filter by fields from your wide events (level, service, path, custom attributes, etc.)
- **Live tail**: Stream incoming logs
- **Dashboards**: Build views on top of structured log data

## Troubleshooting

### Missing apiKey error

```text
[evlog/hyperdx] Missing apiKey. Set HYPERDX_API_KEY or NUXT_HYPERDX_API_KEY, or pass to createHyperDXDrain()
```

Make sure your environment variables are set and the server was restarted after adding them.

### 401 Unauthorized or ingest rejected

Your API key may be invalid or not permitted to ingest. Confirm the key in HyperDX matches the ingestion key used in their OpenTelemetry examples (`authorization: <YOUR_HYPERDX_API_KEY_HERE>`).

## Direct API Usage

For advanced use cases, you can use the lower-level functions:

```typescript [server/utils/hyperdx.ts]
import { sendToHyperDX, sendBatchToHyperDX } from 'evlog/hyperdx'

// Send a single event
await sendToHyperDX(event, {
  apiKey: process.env.HYPERDX_API_KEY!,
})

// Send multiple events in one request
await sendBatchToHyperDX(events, {
  apiKey: process.env.HYPERDX_API_KEY!,
  endpoint: 'https://in-otel.hyperdx.io',
})
```

## Next Steps

- [OTLP Adapter](/adapters/otlp) - Send logs via OpenTelemetry Protocol to any OTLP backend
- [PostHog Adapter](/adapters/posthog) - Send logs to PostHog Logs via OTLP
- [Custom Adapters](/adapters/custom) - Build your own adapter
- [Best Practices](/core-concepts/best-practices) - Security and production tips



---

- HyperDX
- [OTLP Adapter](/adapters/otlp)

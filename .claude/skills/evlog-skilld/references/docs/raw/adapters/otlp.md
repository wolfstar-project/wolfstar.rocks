# OTLP Adapter

> Send logs via OpenTelemetry Protocol (OTLP) to Grafana, Datadog, Honeycomb, and any compatible backend. Supports gRPC and HTTP transports.

The OTLP (OpenTelemetry Protocol) adapter sends logs in the standard OpenTelemetry format. This works with any OTLP-compatible backend including:

- **Grafana Cloud** (Loki)
- **Datadog**
- **Honeycomb**
- **Jaeger**
- **Splunk**
- **New Relic**
- **Self-hosted OpenTelemetry Collector**
- **HyperDX**

<code-collapse>

```txt [Prompt]
Add the OTLP drain adapter to send evlog wide events via OpenTelemetry Protocol.

1. Identify which framework I'm using and follow its evlog integration pattern
2. Install evlog if not already installed
3. Import createOTLPDrain from 'evlog/otlp'
4. Wire createOTLPDrain() into my framework's drain configuration
5. Set OTLP_ENDPOINT environment variable (collector URL)
6. Optionally set OTLP_HEADERS for authentication
7. Test by triggering a request and checking your OTLP backend (Grafana, Datadog, Honeycomb, etc.)

Adapter docs: https://www.evlog.dev/adapters/otlp
Framework setup: https://www.evlog.dev/frameworks
```

</code-collapse>

## Installation

The OTLP adapter comes bundled with evlog:

```typescript
import { createOTLPDrain } from 'evlog/otlp'
```

## Quick Start

### 1. Set your OTLP endpoint

```bash [.env]
OTLP_ENDPOINT=http://localhost:4318
```

### 2. Wire the drain to your framework

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
import { createOTLPDrain } from 'evlog/otlp'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createOTLPDrain())
})
```

```typescript [Hono]
import { createOTLPDrain } from 'evlog/otlp'

app.use(evlog({ drain: createOTLPDrain() }))
```

```typescript [Express]
import { createOTLPDrain } from 'evlog/otlp'

app.use(evlog({ drain: createOTLPDrain() }))
```

```typescript [Fastify]
import { createOTLPDrain } from 'evlog/otlp'

await app.register(evlog, { drain: createOTLPDrain() })
```

```typescript [Elysia]
import { createOTLPDrain } from 'evlog/otlp'

app.use(evlog({ drain: createOTLPDrain() }))
```

```typescript [NestJS]
import { createOTLPDrain } from 'evlog/otlp'

EvlogModule.forRoot({ drain: createOTLPDrain() })
```

```typescript [Standalone]
import { createOTLPDrain } from 'evlog/otlp'

initLogger({ drain: createOTLPDrain() })
```

</code-group>

## Configuration

The adapter reads configuration from multiple sources (highest priority first):

1. **Overrides** passed to `createOTLPDrain()`
2. **Runtime config** at `runtimeConfig.otlp` (Nuxt/Nitro only)
3. **Environment variables**

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
        OTLP_ENDPOINT
      </code>
    </td>
    
    <td>
      <code>
        NUXT_OTLP_ENDPOINT
      </code>
    </td>
    
    <td>
      OTLP HTTP endpoint (e.g., <code>
        http://localhost:4318
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        OTLP_SERVICE_NAME
      </code>
    </td>
    
    <td>
      <code>
        NUXT_OTLP_SERVICE_NAME
      </code>
    </td>
    
    <td>
      Override service name
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        OTLP_HEADERS
      </code>
    </td>
    
    <td>
      <code>
        NUXT_OTLP_HEADERS
      </code>
    </td>
    
    <td>
      Custom headers (format: <code>
        Key=Value,Key2=Value2
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        OTLP_AUTH
      </code>
    </td>
    
    <td>
      <code>
        NUXT_OTLP_AUTH
      </code>
    </td>
    
    <td>
      Shortcut for <code>
        Authorization
      </code>
      
       header
    </td>
  </tr>
</tbody>
</table>

Standard OpenTelemetry variables are also supported as fallbacks:

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
        OTEL_EXPORTER_OTLP_ENDPOINT
      </code>
    </td>
    
    <td>
      OTLP endpoint
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        OTEL_EXPORTER_OTLP_HEADERS
      </code>
    </td>
    
    <td>
      Headers in OTEL format
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        OTEL_SERVICE_NAME
      </code>
    </td>
    
    <td>
      Service name
    </td>
  </tr>
</tbody>
</table>

### Runtime Config (Nuxt only)

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  runtimeConfig: {
    otlp: {
      endpoint: '', // Set via NUXT_OTLP_ENDPOINT
    },
  },
})
```

### Override Options

```typescript
const drain = createOTLPDrain({
  endpoint: 'http://localhost:4318',
  serviceName: 'my-api',
  headers: {
    'Authorization': 'Bearer xxx',
  },
  resourceAttributes: {
    'deployment.environment': 'staging',
  },
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
        endpoint
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
      OTLP HTTP endpoint (required)
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
      From event
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
        headers
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
      Custom HTTP headers for authentication
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
</tbody>
</table>

## Provider-Specific Setup

### Grafana Cloud

1. Go to your Grafana Cloud portal
2. Navigate to **Connections** > **Collector** > **OpenTelemetry**
3. Copy your OTLP endpoint and generate credentials

```bash [.env]
OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic%20base64-encoded-credentials
```

<callout color="info" icon="i-lucide-info">

Grafana uses URL-encoded headers. The `%20` is a space character. The adapter automatically decodes this format.

</callout>

### Datadog

```bash [.env]
OTLP_ENDPOINT=https://http-intake.logs.datadoghq.com
OTLP_HEADERS=DD-API-KEY=your-api-key
```

### Local OpenTelemetry Collector

For development and testing, run a local collector:

```yaml [otel-collector.yaml]
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  debug:
    verbosity: detailed

service:
  pipelines:
    logs:
      receivers: [otlp]
      exporters: [debug]
```

```bash
docker run --rm -p 4318:4318 \
  -v $(pwd)/otel-collector.yaml:/etc/otelcol/config.yaml \
  otel/opentelemetry-collector:latest
```

```bash [.env]
OTLP_ENDPOINT=http://localhost:4318
```

## OTLP Log Format

evlog maps wide events to the OTLP log format:

<table>
<thead>
  <tr>
    <th>
      evlog Field
    </th>
    
    <th>
      OTLP Field
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        level
      </code>
    </td>
    
    <td>
      <code>
        severityNumber
      </code>
      
       / <code>
        severityText
      </code>
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
        timeUnixNano
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
      Resource attribute <code>
        service.name
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
      Resource attribute <code>
        deployment.environment
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        version
      </code>
    </td>
    
    <td>
      Resource attribute <code>
        service.version
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        region
      </code>
    </td>
    
    <td>
      Resource attribute <code>
        cloud.region
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        traceId
      </code>
    </td>
    
    <td>
      <code>
        traceId
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        spanId
      </code>
    </td>
    
    <td>
      <code>
        spanId
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      All other fields
    </td>
    
    <td>
      Log attributes
    </td>
  </tr>
</tbody>
</table>

### Severity Mapping

<table>
<thead>
  <tr>
    <th>
      evlog Level
    </th>
    
    <th>
      OTLP Severity Number
    </th>
    
    <th>
      OTLP Severity Text
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        debug
      </code>
    </td>
    
    <td>
      5
    </td>
    
    <td>
      DEBUG
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        info
      </code>
    </td>
    
    <td>
      9
    </td>
    
    <td>
      INFO
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        warn
      </code>
    </td>
    
    <td>
      13
    </td>
    
    <td>
      WARN
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        error
      </code>
    </td>
    
    <td>
      17
    </td>
    
    <td>
      ERROR
    </td>
  </tr>
</tbody>
</table>

## Troubleshooting

### Missing endpoint error

```text
[evlog/otlp] Missing endpoint. Set OTLP_ENDPOINT or OTEL_EXPORTER_OTLP_ENDPOINT
```

Make sure your endpoint environment variable is set and the server was restarted.

### 401 Unauthorized

Your authentication headers may be missing or incorrect. Check:

1. The `OTEL_EXPORTER_OTLP_HEADERS` format is correct
2. Credentials are valid and not expired
3. The endpoint URL is correct

### 404 Not Found

The adapter sends to `/v1/logs`. Make sure your endpoint:

- Supports OTLP HTTP (not gRPC)
- Is the base URL without `/v1/logs` suffix

### Logs not appearing

1. Check the server console for `[evlog/otlp]` error messages
2. Test with a local collector first to verify the format
3. Check your backend's ingestion delay (some have 1-2 minute delays)

## Direct API Usage

For advanced use cases:

```typescript [server/utils/otlp.ts]
import { sendToOTLP, sendBatchToOTLP, toOTLPLogRecord } from 'evlog/otlp'

// Send a single event
await sendToOTLP(event, {
  endpoint: 'http://localhost:4318',
})

// Send multiple events
await sendBatchToOTLP(events, {
  endpoint: 'http://localhost:4318',
})

// Convert event to OTLP format (for inspection)
const otlpRecord = toOTLPLogRecord(event)
```

## Next Steps

- [Axiom Adapter](/adapters/axiom) - Send logs to Axiom
- [PostHog Adapter](/adapters/posthog) - Send logs to PostHog
- [Custom Adapters](/adapters/custom) - Build your own adapter
- [Best Practices](/core-concepts/best-practices) - Security and production tips



---

- OpenTelemetry Docs
- [Custom Adapters](/adapters/custom)

# Datadog Adapter

> Send wide events to Datadog Logs via the native HTTP intake API. Supports all Datadog sites and DD_* environment variables.

Datadog is a monitoring and security platform. The evlog Datadog adapter sends your wide events to Datadog Logs using the **HTTP Logs intake API (v2)** with the `DD-API-KEY` header.

For OpenTelemetry-based ingestion instead, see the [OTLP adapter](/adapters/otlp).

<code-collapse>

```txt [Prompt]
Add the Datadog drain adapter to send evlog wide events to Datadog Logs.

1. Identify which framework I'm using and follow its evlog integration pattern
2. Install evlog if not already installed
3. Import createDatadogDrain from 'evlog/datadog'
4. Wire createDatadogDrain() into my framework's drain configuration
5. Set DD_API_KEY (or DATADOG_API_KEY) and optionally DD_SITE in .env
6. Test by triggering a request and checking Log Explorer in Datadog

Adapter docs: https://www.evlog.dev/adapters/datadog
Framework setup: https://www.evlog.dev/frameworks
```

</code-collapse>

## Installation

The Datadog adapter comes bundled with evlog:

```typescript [src/index.ts]
import { createDatadogDrain } from 'evlog/datadog'
```

## Quick Start

### 1. Get your API key

1. Open Datadog Organization Settings → API Keys
2. Create or copy an API key with permission to submit logs

### 2. Set environment variables

```bash [.env]
DD_API_KEY=your-api-key
# Optional — defaults to datadoghq.com (US1)
DD_SITE=datadoghq.eu
```

### 3. Wire the drain to your framework

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
import { createDatadogDrain } from 'evlog/datadog'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createDatadogDrain())
})
```

```typescript [Hono]
import { createDatadogDrain } from 'evlog/datadog'

app.use(evlog({ drain: createDatadogDrain() }))
```

```typescript [Express]
import { createDatadogDrain } from 'evlog/datadog'

app.use(evlog({ drain: createDatadogDrain() }))
```

```typescript [Fastify]
import { createDatadogDrain } from 'evlog/datadog'

await app.register(evlog, { drain: createDatadogDrain() })
```

```typescript [Elysia]
import { createDatadogDrain } from 'evlog/datadog'

app.use(evlog({ drain: createDatadogDrain() }))
```

```typescript [NestJS]
import { createDatadogDrain } from 'evlog/datadog'

EvlogModule.forRoot({ drain: createDatadogDrain() })
```

```typescript [Standalone]
import { createDatadogDrain } from 'evlog/datadog'

initLogger({ drain: createDatadogDrain() })
```

</code-group>

Wide events appear in **Logs → Explorer**. The adapter sets `ddsource` to `evlog` and `message` to a JSON string of the full wide event for easy JSON parsing in pipelines.

## Configuration

The adapter reads configuration from multiple sources (highest priority first):

1. **Overrides** passed to `createDatadogDrain()`
2. **Runtime config** at `runtimeConfig.datadog` or `runtimeConfig.evlog.datadog` (Nuxt/Nitro)
3. **Environment variables** — see table below

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
        DD_API_KEY
      </code>
    </td>
    
    <td>
      <code>
        NUXT_DATADOG_API_KEY
      </code>
    </td>
    
    <td>
      Datadog API key (required). Also: <code>
        DATADOG_API_KEY
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        DD_SITE
      </code>
    </td>
    
    <td>
      <code>
        NUXT_DATADOG_SITE
      </code>
    </td>
    
    <td>
      Site hostname (e.g. <code>
        datadoghq.com
      </code>
      
      , <code>
        datadoghq.eu
      </code>
      
      , <code>
        us3.datadoghq.com
      </code>
      
      ). Also: <code>
        DATADOG_SITE
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        DATADOG_LOGS_URL
      </code>
    </td>
    
    <td>
      <code>
        NUXT_DATADOG_LOGS_URL
      </code>
    </td>
    
    <td>
      Full intake URL — overrides URL derived from <code>
        site
      </code>
    </td>
  </tr>
</tbody>
</table>

### Runtime Config (Nuxt only)

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  runtimeConfig: {
    datadog: {
      apiKey: '', // Set via NUXT_DATADOG_API_KEY or DD_API_KEY
      site: 'datadoghq.eu',
    },
  },
})
```

### Override Options

```typescript [server/plugins/evlog-drain.ts]
const drain = createDatadogDrain({
  apiKey: '***',
  site: 'us5.datadoghq.com',
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
      —
    </td>
    
    <td>
      Datadog API key (required)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        site
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        datadoghq.com
      </code>
    </td>
    
    <td>
      Site for intake host <code>
        http-intake.logs.${site}
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        intakeUrl
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      from <code>
        site
      </code>
    </td>
    
    <td>
      Full <code>
        POST
      </code>
      
       URL for <code>
        /api/v2/logs
      </code>
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
      Request timeout (ms)
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
      Retries on transient failures
    </td>
  </tr>
</tbody>
</table>

## Log shape

Each wide event becomes one Datadog log with:

- **message** — short one-line summary for the list view (e.g. `ERROR GET /api/checkout (400)`), built with `formatDatadogMessageLine`. Easier to scan than a full JSON blob in Live Tail.
- **evlog** — full wide event as a **JSON object** (not a string). Numeric HTTP **status** fields anywhere in the tree are renamed to **httpStatusCode** so they never clash with Datadog’s reserved severity `status`.
- **service**, **status** (Datadog severity — drives Live Tail color), **ddsource**: `evlog`, **ddtags**: `env:…` and optional `version:…`
- **timestamp**: Unix milliseconds from `WideEvent.timestamp`

**Severity (status)** at intake root is computed by the adapter from the wide event’s **level** and HTTP **status** (`resolveDatadogLogStatus` in `evlog/datadog`). Business-only fields on **HTTP 200** stay **info** unless you call **log.error()**.

For advanced use, `sanitizeWideEventForDatadog(event)` returns only the sanitized object you would store under `evlog`.

## Querying in Datadog

- **Log Explorer**: `source:evlog`, `service:your-app`, `status:error`
- **Facets**: prefer `@evlog.path`, `@evlog.requestId`, `@evlog.level`, etc. — core fields are under **evlog**, not a JSON string in `message`
- **Metrics**: log-based metrics on `@evlog.*` attributes
- **Pipelines**: if you previously parsed a full JSON **string** inside `message`, move those facets to **@evlog.***. The `message` field is now a short summary line only.

## Simple logs vs wide events

Plain-text lines in Live Tail (e.g. “Form field is empty”) usually come from **log.info('tag', 'msg')** or similar, not from the **wide event** sent on **emit()**. Those lines go to the console (and any Agent-based log stream), while the Datadog drain sends one structured log per wide event under **source:evlog**.

## Troubleshooting

### Missing API key

```text [Console]
[evlog/datadog] Missing API key. Set NUXT_DATADOG_API_KEY, DATADOG_API_KEY, or DD_API_KEY...
```

Set `DD_API_KEY` (or unprefixed `DATADOG_API_KEY`) and restart the process.

### 403 Forbidden

The API key may lack log ingestion permission or belong to the wrong organization. Verify the key in Datadog and try a new key.

### Wrong region / site

If logs never appear, confirm `DD_SITE` matches your Datadog account (e.g. EU: `datadoghq.eu`). For a custom intake URL, set `DATADOG_LOGS_URL` / `NUXT_DATADOG_LOGS_URL`.

## Direct API usage

```typescript [server/utils/datadog.ts]
import { sendToDatadog, sendBatchToDatadog } from 'evlog/datadog'

await sendToDatadog(event, {
  apiKey: process.env.DD_API_KEY!,
  site: process.env.DD_SITE,
})

await sendBatchToDatadog(events, {
  apiKey: process.env.DD_API_KEY!,
})
```

## Next Steps

- [OTLP Adapter](/adapters/otlp) — Send logs via OpenTelemetry (works with Datadog Agent / OTLP endpoint)
- [Custom Adapters](/adapters/custom) — Build your own destination



---

- Datadog Logs
- [OTLP Adapter](/adapters/otlp)

# Built-in Enrichers

> Reference for all built-in evlog enrichers. Parse user agents, extract geo data, measure request sizes, and capture trace context automatically.

All built-in enrichers are exported from `evlog/enrichers`. Each enricher is a factory function that returns an `(ctx: EnrichContext) => void` callback.

<code-collapse>

```txt [Prompt]
Add all built-in enrichers to my evlog setup.

1. Identify which framework I'm using and follow its evlog integration pattern
2. Import createUserAgentEnricher, createGeoEnricher, createRequestSizeEnricher, and createTraceContextEnricher from 'evlog/enrichers'
3. Wire the enrichers into my framework's enrich configuration
4. Enrichers add userAgent, geo, requestSize, and traceContext fields to wide events
5. All enrichers accept { overwrite?: boolean } - defaults to false to preserve user-set data

Enricher docs: https://www.evlog.dev/enrichers/built-in
Framework setup: https://www.evlog.dev/frameworks
```

</code-collapse>

```typescript
import {
  createUserAgentEnricher,
  createGeoEnricher,
  createRequestSizeEnricher,
  createTraceContextEnricher,
} from 'evlog/enrichers'
```

## User Agent

Parse browser, OS, and device type from the `User-Agent` header.

**Sets:** `event.userAgent`

```typescript
const enrich = createUserAgentEnricher()
```

**Output shape:**

```typescript
interface UserAgentInfo {
  raw: string                                      // Original User-Agent string
  browser?: { name: string; version?: string }     // Chrome, Firefox, Safari, Edge
  os?: { name: string; version?: string }          // Windows, macOS, iOS, Android, Linux
  device?: { type: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown' }
}
```

**Example output:**

```json
{
  "userAgent": {
    "raw": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0",
    "browser": { "name": "Chrome", "version": "120.0.0.0" },
    "os": { "name": "macOS", "version": "10.15.7" },
    "device": { "type": "desktop" }
  }
}
```

**Detected browsers:** Edge, Chrome, Firefox, Safari (checked in order, Edge before Chrome to avoid false matches).

**Detected devices:** Bot (crawlers, spiders), Tablet (iPad), Mobile (iPhone, Android phones), Desktop (fallback).

## Geo

Extract geographic data from platform-injected headers.

**Sets:** `event.geo`

```typescript
const enrich = createGeoEnricher()
```

**Output shape:**

```typescript
interface GeoInfo {
  country?: string      // ISO country code (e.g., "US", "FR")
  region?: string       // Region/state name
  regionCode?: string   // Region code
  city?: string         // City name
  latitude?: number     // Decimal latitude
  longitude?: number    // Decimal longitude
}
```

**Supported platforms:**

<table>
<thead>
  <tr>
    <th>
      Platform
    </th>
    
    <th>
      Headers
    </th>
    
    <th>
      Coverage
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Vercel
    </td>
    
    <td>
      <code>
        x-vercel-ip-country
      </code>
      
      , <code>
        x-vercel-ip-country-region
      </code>
      
      , <code>
        x-vercel-ip-city
      </code>
      
      , <code>
        x-vercel-ip-latitude
      </code>
      
      , <code>
        x-vercel-ip-longitude
      </code>
    </td>
    
    <td>
      Full
    </td>
  </tr>
  
  <tr>
    <td>
      Cloudflare
    </td>
    
    <td>
      <code>
        cf-ipcountry
      </code>
    </td>
    
    <td>
      Country only
    </td>
  </tr>
</tbody>
</table>

<callout color="info" icon="i-lucide-info">

**Cloudflare note:** Only `cf-ipcountry` is a standard Cloudflare HTTP header. Other geo fields (`city`, `region`, `latitude`, etc.) are properties of `request.cf`, which is not exposed as headers. For full Cloudflare geo data, write a [custom enricher](/enrichers/custom) that reads `request.cf`, or use a Workers middleware to copy `cf` properties into custom headers.

</callout>

## Request Size

Capture request and response payload sizes from `Content-Length` headers.

**Sets:** `event.requestSize`

```typescript
const enrich = createRequestSizeEnricher()
```

**Output shape:**

```typescript
interface RequestSizeInfo {
  requestBytes?: number    // Request Content-Length
  responseBytes?: number   // Response Content-Length
}
```

**Example output:**

```json
{
  "requestSize": {
    "requestBytes": 1234,
    "responseBytes": 5678
  }
}
```

<callout color="info" icon="i-lucide-info">

This enricher reads the `Content-Length` header from both the request and response. If the header is missing (e.g., for chunked transfer encoding), the corresponding field will be `undefined`.

</callout>

## Trace Context

Extract W3C trace context from the `traceparent` and `tracestate` headers.

**Sets:** `event.traceContext`, `event.traceId`, `event.spanId`

```typescript
const enrich = createTraceContextEnricher()
```

**Output shape:**

```typescript
interface TraceContextInfo {
  traceparent?: string   // Full traceparent header value
  tracestate?: string    // Full tracestate header value
  traceId?: string       // 32-char hex trace ID (parsed from traceparent)
  spanId?: string        // 16-char hex span ID (parsed from traceparent)
}
```

**Example output:**

```json
{
  "traceContext": {
    "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
    "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
    "spanId": "00f067aa0ba902b7"
  },
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7"
}
```

`traceId` and `spanId` are also set at the top level of the event for easy querying and correlation.

<callout color="info" icon="i-lucide-info">

The traceparent format follows the W3C Trace Context specification: `{version}-{traceId}-{spanId}-{flags}`.

</callout>

## Full Setup Example

Use all built-in enrichers together:

```typescript [server/plugins/evlog-enrich.ts]
import {
  createUserAgentEnricher,
  createGeoEnricher,
  createRequestSizeEnricher,
  createTraceContextEnricher,
} from 'evlog/enrichers'

export default defineNitroPlugin((nitroApp) => {
  const enrichers = [
    createUserAgentEnricher(),
    createGeoEnricher(),
    createRequestSizeEnricher(),
    createTraceContextEnricher(),
  ]

  nitroApp.hooks.hook('evlog:enrich', (ctx) => {
    for (const enricher of enrichers) enricher(ctx)
  })
})
```

## Next Steps

- [Custom Enrichers](/enrichers/custom) - Write your own enricher
- [Adapters](/adapters/overview) - Send enriched events to external services



---

- [Custom Enrichers](/enrichers/custom)
- [Enrichers Overview](/enrichers/overview)

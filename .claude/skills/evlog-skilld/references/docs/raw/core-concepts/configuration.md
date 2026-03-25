# Configuration

> Complete reference for all evlog configuration options including global logger settings, middleware options, environment context, and framework-specific overrides.

evlog has two configuration surfaces: **global options** set once at startup, and **middleware options** set per-framework integration. This page documents both.

## Global Options (`initLogger`)

These options apply to all frameworks. Call `initLogger()` once at application startup for standalone frameworks (Hono, Express, Fastify, Elysia, NestJS, SvelteKit, Cloudflare Workers). For Nuxt and Nitro, these are set via module config and passed through automatically.

```typescript
import { initLogger } from 'evlog'

initLogger({
  enabled: true,
  env: { service: 'my-api', environment: 'production' },
  pretty: false,
  silent: false,
  stringify: true,
  sampling: { rates: { info: 10 }, keep: [{ status: 400 }] },
  drain: createAxiomDrain(),
})
```

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
        enabled
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Enable/disable all logging globally. When <code>
        false
      </code>
      
      , all operations become no-ops
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        env
      </code>
    </td>
    
    <td>
      <code>
        Partial<EnvironmentContext>
      </code>
    </td>
    
    <td>
      Auto-detected
    </td>
    
    <td>
      Environment context overrides (see below)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pretty
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
      
       in dev
    </td>
    
    <td>
      Pretty print with tree formatting. Auto-detected based on <code>
        NODE_ENV
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        silent
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      Suppress console output. Events are still built, sampled, and passed to drains
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        stringify
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Emit JSON strings when <code>
        pretty
      </code>
      
       is disabled. Set to <code>
        false
      </code>
      
       for Cloudflare Workers
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        sampling
      </code>
    </td>
    
    <td>
      <code>
        SamplingConfig
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Head and tail sampling configuration. See <a href="/core-concepts/sampling">
        Sampling
      </a>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        drain
      </code>
    </td>
    
    <td>
      <code>
        (ctx: DrainContext) => void
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Drain callback for sending events to external services
    </td>
  </tr>
</tbody>
</table>

### Environment Context

The `env` option controls the fields included in every log event. Most values are auto-detected from environment variables and `package.json`.

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
      Default
    </th>
    
    <th>
      Auto-detected from
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        service
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        'app'
      </code>
    </td>
    
    <td>
      <code>
        SERVICE_NAME
      </code>
      
      , <code>
        package.json
      </code>
      
       name
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
      <code>
        'development'
      </code>
    </td>
    
    <td>
      <code>
        NODE_ENV
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
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      <code>
        APP_VERSION
      </code>
      
      , <code>
        package.json
      </code>
      
       version
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        commitHash
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      <code>
        COMMIT_SHA
      </code>
      
      , <code>
        GIT_COMMIT
      </code>
      
      , <code>
        VERCEL_GIT_COMMIT_SHA
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
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      <code>
        FLY_REGION
      </code>
      
      , <code>
        AWS_REGION
      </code>
      
      , <code>
        VERCEL_REGION
      </code>
    </td>
  </tr>
</tbody>
</table>

### Silent Mode

Use `silent` when your deployment platform captures stdout as its primary log ingestion (GCP Cloud Run, AWS Lambda, Fly.io, Railway, etc.) and you want a drain adapter to control the output format.

```typescript
initLogger({
  silent: process.env.NODE_ENV === 'production',
  drain: createCloudLoggingDrain(),
})
```

<callout color="warning" icon="i-lucide-alert-triangle">

If `silent` is enabled without a drain, events are built and sampled but never output anywhere. evlog will warn you about this at startup.

</callout>

## Middleware Options

These options are passed to the framework middleware/plugin. They control per-request behavior: which routes to log, how to drain and enrich events, and custom tail sampling logic.

<code-group>

```typescript [Hono]
app.use(evlog({
  include: ['/api/**'],
  exclude: ['/api/health'],
  routes: { '/api/auth/**': { service: 'auth' } },
  drain: createAxiomDrain(),
  enrich: (ctx) => { ctx.event.region = process.env.FLY_REGION },
  keep: (ctx) => { if (ctx.duration > 2000) ctx.shouldKeep = true },
}))
```

```typescript [Express]
app.use(evlog({
  include: ['/api/**'],
  drain: createAxiomDrain(),
  enrich: (ctx) => { ctx.event.region = process.env.FLY_REGION },
}))
```

```typescript [Fastify]
await app.register(evlog, {
  include: ['/api/**'],
  drain: createAxiomDrain(),
})
```

</code-group>

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
        include
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Route glob patterns to log. If not set, all routes are logged
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        exclude
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Route patterns to exclude. Exclusions take precedence over inclusions
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        routes
      </code>
    </td>
    
    <td>
      <code>
        Record<string, { service: string }>
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Route-specific service name overrides
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        drain
      </code>
    </td>
    
    <td>
      <code>
        (ctx: DrainContext) => void
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Drain callback called with every emitted event
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        enrich
      </code>
    </td>
    
    <td>
      <code>
        (ctx: EnrichContext) => void
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Enrich callback called after emit, before drain
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        keep
      </code>
    </td>
    
    <td>
      <code>
        (ctx: TailSamplingContext) => void
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Custom tail sampling callback
    </td>
  </tr>
</tbody>
</table>

<callout color="info" icon="i-lucide-info">

**Nuxt and Nitro** use module config and Nitro hooks (`evlog:drain`, `evlog:enrich`, `evlog:emit:keep`) instead of middleware options. See the [Nuxt](/frameworks/nuxt) and [Nitro](/frameworks/nitro) pages.

</callout>

### Middleware drain vs global drain

When a middleware `drain` is set, it takes precedence over the global drain from `initLogger()`. If no middleware drain is set, the global drain is used as fallback, with the benefit of receiving the full enriched event with request context (method, path, headers).

```typescript
import { initLogger } from 'evlog'
import { createAxiomDrain } from 'evlog/axiom'

initLogger({
  env: { service: 'my-api' },
  drain: createAxiomDrain(), // fallback: used by singleton log API AND middleware (if no middleware drain)
})

app.use(evlog({
  // no drain here - falls back to globalDrain from initLogger, with full request context
}))
```

## Framework-Specific Options

Some frameworks have additional options beyond the shared config:

### Nuxt

The Nuxt module accepts all global options and middleware options in `nuxt.config.ts` under the `evlog` key, plus:

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
        console
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Enable/disable browser console output (client-side only)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        transport.enabled
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      Send client logs to the server via API endpoint
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        transport.endpoint
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        '/api/_evlog/ingest'
      </code>
    </td>
    
    <td>
      Custom transport endpoint
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        transport.credentials
      </code>
    </td>
    
    <td>
      <code>
        RequestCredentials
      </code>
    </td>
    
    <td>
      <code>
        'same-origin'
      </code>
    </td>
    
    <td>
      Fetch credentials mode (<code>
        'include'
      </code>
      
       for cross-origin endpoints)
    </td>
  </tr>
</tbody>
</table>

See the full [Nuxt configuration](/frameworks/nuxt#configuration).

### Nitro

The Nitro module accepts `enabled`, `env`, `pretty`, `silent`, `sampling`, `include`, `exclude`, and `routes` in `nitro.config.ts`. Drain and enrichment are done via Nitro hooks.

See [Nitro drain & enrichers](/frameworks/nitro#drain--enrichers).



---

- [Sampling](/core-concepts/sampling)
- [Drain Adapters](/adapters/overview)

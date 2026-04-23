# Performance

> evlog adds ~3µs per request. Faster than pino, consola, and winston in most scenarios while emitting richer, more useful events.

evlog adds **~3µs of overhead per request**, that's 0.003ms, orders of magnitude below any HTTP framework or database call. Performance is tracked on every pull request via CodSpeed.

## evlog vs alternatives

All benchmarks run with JSON output to no-op destinations. pino writes to `/dev/null` (sync), winston writes to a no-op stream, consola uses a no-op reporter, evlog uses silent mode.

### Results

<table>
<thead>
  <tr>
    <th>
      Scenario
    </th>
    
    <th align="right">
      evlog
    </th>
    
    <th align="right">
      pino
    </th>
    
    <th align="right">
      consola
    </th>
    
    <th align="right">
      winston
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Simple string log
    </td>
    
    <td align="right">
      1.96M ops/s
    </td>
    
    <td align="right">
      1.06M
    </td>
    
    <td align="right">
      <strong>
        2.67M
      </strong>
    </td>
    
    <td align="right">
      977.6K
    </td>
  </tr>
  
  <tr>
    <td>
      Structured (5 fields)
    </td>
    
    <td align="right">
      1.74M ops/s
    </td>
    
    <td align="right">
      705.6K
    </td>
    
    <td align="right">
      <strong>
        1.75M
      </strong>
    </td>
    
    <td align="right">
      440.6K
    </td>
  </tr>
  
  <tr>
    <td>
      Deep nested log
    </td>
    
    <td align="right">
      <strong>
        1.75M
      </strong>
      
       ops/s
    </td>
    
    <td align="right">
      507.8K
    </td>
    
    <td align="right">
      1.04M
    </td>
    
    <td align="right">
      202.5K
    </td>
  </tr>
  
  <tr>
    <td>
      Child / scoped logger
    </td>
    
    <td align="right">
      <strong>
        1.85M
      </strong>
      
       ops/s
    </td>
    
    <td align="right">
      871.0K
    </td>
    
    <td align="right">
      272.2K
    </td>
    
    <td align="right">
      568.5K
    </td>
  </tr>
  
  <tr>
    <td>
      Wide event lifecycle
    </td>
    
    <td align="right">
      <strong>
        1.68M
      </strong>
      
       ops/s
    </td>
    
    <td align="right">
      209.0K
    </td>
    
    <td align="right">
      —
    </td>
    
    <td align="right">
      114.6K
    </td>
  </tr>
  
  <tr>
    <td>
      Burst (100 logs)
    </td>
    
    <td align="right">
      19.1K ops/s
    </td>
    
    <td align="right">
      10.0K
    </td>
    
    <td align="right">
      <strong>
        40.8K
      </strong>
    </td>
    
    <td align="right">
      7.6K
    </td>
  </tr>
  
  <tr>
    <td>
      Logger creation
    </td>
    
    <td align="right">
      <strong>
        20.52M
      </strong>
      
       ops/s
    </td>
    
    <td align="right">
      7.36M
    </td>
    
    <td align="right">
      299.3K
    </td>
    
    <td align="right">
      5.43M
    </td>
  </tr>
</tbody>
</table>

evlog wins **4 out of 7** head-to-head comparisons, and the wins that matter most are decisive: **8x faster** than pino in the wide event lifecycle, **2.8x faster** logger creation, and **3.5x faster** deep nested logging. consola edges ahead on simple strings and burst (it uses a no-op reporter with no serialization), but evlog produces a single correlated event per request where traditional loggers emit N separate lines.

<callout color="info" icon="i-lucide-info">

**Why this matters**: in the wide event lifecycle (the real-world pattern), evlog is 8x faster than pino and 14.7x faster than winston while sending 75% less data to your log drain and giving you one queryable event instead of 4 disconnected lines.

</callout>

### What is the "wide event lifecycle"?

This benchmark simulates a real API request:

<code-group>

```typescript [evlog (1 event)]
const log = createLogger({ method: 'POST', path: '/api/checkout', requestId: 'req_abc' })
log.set({ user: { id: 'usr_123', plan: 'pro' } })
log.set({ cart: { items: 3, total: 9999 } })
log.set({ payment: { method: 'card', last4: '4242' } })
log.emit({ status: 200 })
```

```typescript [pino (4 log lines)]
const child = pinoLogger.child({ method: 'POST', path: '/api/checkout', requestId: 'req_abc' })
child.info({ user: { id: 'usr_123', plan: 'pro' } }, 'user context')
child.info({ cart: { items: 3, total: 9999 } }, 'cart context')
child.info({ payment: { method: 'card', last4: '4242' } }, 'payment context')
child.info({ status: 200 }, 'request complete')
```

</code-group>

Same CPU cost, but evlog gives you everything in one place.

## Why is evlog faster?

The numbers above aren't magic, they come from deliberate architectural choices:

**In-place mutations, not copies.** `log.set()` writes directly into the context object via a recursive `mergeInto` function. Other loggers clone objects on every call (object spread, `Object.assign`). evlog never allocates intermediate objects during context accumulation.

**No serialization until drain.** Context stays as plain JavaScript objects throughout the request lifecycle. `JSON.stringify` runs exactly once, at emit time. Traditional loggers serialize on every `.info()` call, that's 4x serialization for 4 log lines.

**Lazy allocation.** Timestamps, sampling context, and override objects are only created when actually needed. If tail sampling is disabled (the common case), its context object is never allocated. The `Date` instance used for ISO timestamps is reused across calls.

**One event, not N lines.** For a typical request, pino emits 4+ JSON lines that all need serializing, transporting, and indexing. evlog emits one. That's 75% less work for your log drain, fewer bytes on the wire, and one row to query instead of four.

**RegExp caching.** Glob patterns (used in sampling and route matching) are compiled once and cached. Repeated evaluations hit the cache instead of recompiling.

## Real-world overhead

For a typical API request:

<table>
<thead>
  <tr>
    <th>
      Component
    </th>
    
    <th align="right">
      Cost
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Logger creation
    </td>
    
    <td align="right">
      49ns
    </td>
  </tr>
  
  <tr>
    <td>
      3x <code>
        set()
      </code>
      
       calls
    </td>
    
    <td align="right">
      63ns
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        emit()
      </code>
    </td>
    
    <td align="right">
      570ns
    </td>
  </tr>
  
  <tr>
    <td>
      Sampling
    </td>
    
    <td align="right">
      23ns
    </td>
  </tr>
  
  <tr>
    <td>
      Enricher pipeline
    </td>
    
    <td align="right">
      2.05µs
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        Total
      </strong>
    </td>
    
    <td align="right">
      <strong>
        ~2.8µs
      </strong>
    </td>
  </tr>
</tbody>
</table>

For context, a database query takes 1-50ms, an HTTP call takes 10-500ms. evlog's overhead is **invisible**.

## Bundle size

Every entry point is tree-shakeable. You only pay for what you import.

<table>
<thead>
  <tr>
    <th>
      Entry
    </th>
    
    <th align="right">
      Gzip
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      logger
    </td>
    
    <td align="right">
      3.78 kB
    </td>
  </tr>
  
  <tr>
    <td>
      utils
    </td>
    
    <td align="right">
      1.41 kB
    </td>
  </tr>
  
  <tr>
    <td>
      error
    </td>
    
    <td align="right">
      1.21 kB
    </td>
  </tr>
  
  <tr>
    <td>
      enrichers
    </td>
    
    <td align="right">
      1.92 kB
    </td>
  </tr>
  
  <tr>
    <td>
      pipeline
    </td>
    
    <td align="right">
      1.35 kB
    </td>
  </tr>
  
  <tr>
    <td>
      http
    </td>
    
    <td align="right">
      1.21 kB
    </td>
  </tr>
</tbody>
</table>

A typical Nuxt setup loads `logger` + `utils`, about **5.2 kB gzip**. Bundle size is tracked on every PR and compared against the `main` baseline.

## Detailed benchmarks

### Logger creation

<table>
<thead>
  <tr>
    <th>
      Operation
    </th>
    
    <th align="right">
      ops/sec
    </th>
    
    <th align="right">
      Mean
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        createLogger()
      </code>
      
       (no context)
    </td>
    
    <td align="right">
      19.35M
    </td>
    
    <td align="right">
      52ns
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createLogger()
      </code>
      
       (shallow context)
    </td>
    
    <td align="right">
      20.38M
    </td>
    
    <td align="right">
      49ns
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createLogger()
      </code>
      
       (nested context)
    </td>
    
    <td align="right">
      19.10M
    </td>
    
    <td align="right">
      52ns
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createRequestLogger()
      </code>
    </td>
    
    <td align="right">
      19.27M
    </td>
    
    <td align="right">
      52ns
    </td>
  </tr>
</tbody>
</table>

### Context accumulation (`log.set()`)

<table>
<thead>
  <tr>
    <th>
      Operation
    </th>
    
    <th align="right">
      ops/sec
    </th>
    
    <th align="right">
      Mean
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Shallow merge (3 fields)
    </td>
    
    <td align="right">
      9.54M
    </td>
    
    <td align="right">
      105ns
    </td>
  </tr>
  
  <tr>
    <td>
      Shallow merge (10 fields)
    </td>
    
    <td align="right">
      4.78M
    </td>
    
    <td align="right">
      209ns
    </td>
  </tr>
  
  <tr>
    <td>
      Deep nested merge
    </td>
    
    <td align="right">
      8.40M
    </td>
    
    <td align="right">
      119ns
    </td>
  </tr>
  
  <tr>
    <td>
      4 sequential calls
    </td>
    
    <td align="right">
      7.53M
    </td>
    
    <td align="right">
      133ns
    </td>
  </tr>
</tbody>
</table>

### Event emission (`log.emit()`)

<table>
<thead>
  <tr>
    <th>
      Operation
    </th>
    
    <th align="right">
      ops/sec
    </th>
    
    <th align="right">
      Mean
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Emit minimal event
    </td>
    
    <td align="right">
      1.75M
    </td>
    
    <td align="right">
      570ns
    </td>
  </tr>
  
  <tr>
    <td>
      Emit with context
    </td>
    
    <td align="right">
      1.76M
    </td>
    
    <td align="right">
      569ns
    </td>
  </tr>
  
  <tr>
    <td>
      Full lifecycle (create + 3 sets + emit)
    </td>
    
    <td align="right">
      1.69M
    </td>
    
    <td align="right">
      592ns
    </td>
  </tr>
  
  <tr>
    <td>
      Emit with error
    </td>
    
    <td align="right">
      66.1K
    </td>
    
    <td align="right">
      15.13µs
    </td>
  </tr>
</tbody>
</table>

<callout color="amber" icon="i-lucide-triangle-alert">

`emit with error` is slower because `Error.captureStackTrace()` is an expensive V8 operation (~15µs). This only triggers when errors are thrown.

</callout>

### Payload scaling

<table>
<thead>
  <tr>
    <th>
      Payload
    </th>
    
    <th align="right">
      ops/sec
    </th>
    
    <th align="right">
      Mean
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Small (2 fields)
    </td>
    
    <td align="right">
      1.76M
    </td>
    
    <td align="right">
      567ns
    </td>
  </tr>
  
  <tr>
    <td>
      Medium (50 fields)
    </td>
    
    <td align="right">
      555.5K
    </td>
    
    <td align="right">
      1.80µs
    </td>
  </tr>
  
  <tr>
    <td>
      Large (200 nested fields)
    </td>
    
    <td align="right">
      115.7K
    </td>
    
    <td align="right">
      8.65µs
    </td>
  </tr>
</tbody>
</table>

### Sampling

<table>
<thead>
  <tr>
    <th>
      Operation
    </th>
    
    <th align="right">
      ops/sec
    </th>
    
    <th align="right">
      Mean
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Tail sampling (shouldKeep)
    </td>
    
    <td align="right">
      43.76M
    </td>
    
    <td align="right">
      23ns
    </td>
  </tr>
  
  <tr>
    <td>
      Full emit with head + tail
    </td>
    
    <td align="right">
      7.57M
    </td>
    
    <td align="right">
      132ns
    </td>
  </tr>
</tbody>
</table>

### Enrichers

<table>
<thead>
  <tr>
    <th>
      Enricher
    </th>
    
    <th align="right">
      ops/sec
    </th>
    
    <th align="right">
      Mean
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      User Agent (Chrome)
    </td>
    
    <td align="right">
      2.57M
    </td>
    
    <td align="right">
      389ns
    </td>
  </tr>
  
  <tr>
    <td>
      Geo (Vercel)
    </td>
    
    <td align="right">
      5.32M
    </td>
    
    <td align="right">
      188ns
    </td>
  </tr>
  
  <tr>
    <td>
      Request Size
    </td>
    
    <td align="right">
      24.16M
    </td>
    
    <td align="right">
      41ns
    </td>
  </tr>
  
  <tr>
    <td>
      Trace Context
    </td>
    
    <td align="right">
      4.86M
    </td>
    
    <td align="right">
      206ns
    </td>
  </tr>
  
  <tr>
    <td>
      <strong>
        All combined
      </strong>
    </td>
    
    <td align="right">
      <strong>
        487.2K
      </strong>
    </td>
    
    <td align="right">
      <strong>
        2.05µs
      </strong>
    </td>
  </tr>
</tbody>
</table>

### Error handling

<table>
<thead>
  <tr>
    <th>
      Operation
    </th>
    
    <th align="right">
      ops/sec
    </th>
    
    <th align="right">
      Mean
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        createError()
      </code>
    </td>
    
    <td align="right">
      226.9K
    </td>
    
    <td align="right">
      4.41µs
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        parseError()
      </code>
    </td>
    
    <td align="right">
      43.92M
    </td>
    
    <td align="right">
      23ns
    </td>
  </tr>
  
  <tr>
    <td>
      Round-trip (create + parse)
    </td>
    
    <td align="right">
      227.6K
    </td>
    
    <td align="right">
      4.39µs
    </td>
  </tr>
</tbody>
</table>

## Methodology & trust

### Can you trust these numbers?

Every benchmark in this page is **open source** and **reproducible**. The benchmark files live in `packages/evlog/bench/`. You can read the exact code, run it on your machine, and verify the results.

All libraries are tested under the same conditions:

- **Same output mode**: JSON to a no-op destination (no disk or network I/O measured)
- **Same warmup**: each benchmark runs for 500ms after JIT stabilization
- **Same tooling**: Vitest bench powered by tinybench
- **Same machine**: when comparing libraries, all benchmarks run in the same process on the same hardware

### CI regression tracking

Performance regressions are tracked on every pull request via two systems:

- **CodSpeed** runs all benchmarks using CPU instruction counting (not wall-clock timing). This eliminates noise from shared CI runners and produces deterministic, reproducible results. Regressions are flagged directly on the PR.
- **Bundle size comparison** measures all entry points against the `main` baseline and posts a size delta report as a PR comment.

### Run it yourself

```bash [Terminal]
cd packages/evlog

bun run bench                          # all benchmarks
bunx vitest bench bench/comparison/    # vs alternatives only
bun bench/scripts/size.ts              # bundle size
```



---

- [Sampling](/core-concepts/sampling)
- [Configuration](/core-concepts/configuration)

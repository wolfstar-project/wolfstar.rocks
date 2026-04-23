# File System Adapter

> Write wide events to the local file system as NDJSON for local debugging, AI agent integration, and production backup.

The File System adapter writes your wide events to local NDJSON files (one JSON object per line, one file per day). This enables:

- **AI agent integration** - point a skill to `.evlog/logs/` to parse structured logs for debugging and pattern analysis
- **Local dev debugging** - persistent log history without scrolling the terminal (`tail -f .evlog/logs/2026-03-14.jsonl`)
- **Production backup** - combine with a network drain (Axiom, OTLP) for local fallback

<code-collapse>

```txt [Prompt]
Add the file system drain adapter to write evlog wide events locally as NDJSON files.

1. Identify which framework I'm using and follow its evlog integration pattern
2. Install evlog if not already installed
3. Import createFsDrain from 'evlog/fs'
4. Wire createFsDrain() into my framework's drain configuration
5. Logs are written to .evlog/logs/ by default (one file per day, auto .gitignore)
6. Optionally configure dir, maxFiles, maxSizePerFile, or pretty options
7. Test by triggering a request and checking .evlog/logs/*.jsonl

Adapter docs: https://www.evlog.dev/adapters/fs
Framework setup: https://www.evlog.dev/frameworks
```

</code-collapse>

## Installation

The File System adapter comes bundled with evlog:

```typescript [src/index.ts]
import { createFsDrain } from 'evlog/fs'
```

## Quick Start

No credentials or environment variables needed. Just wire the drain to your framework:

<code-group>

```typescript [Nuxt / Nitro]
// server/plugins/evlog-drain.ts
import { createFsDrain } from 'evlog/fs'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('evlog:drain', createFsDrain())
})
```

```typescript [Hono]
import { createFsDrain } from 'evlog/fs'

app.use(evlog({ drain: createFsDrain() }))
```

```typescript [Express]
import { createFsDrain } from 'evlog/fs'

app.use(evlog({ drain: createFsDrain() }))
```

```typescript [Fastify]
import { createFsDrain } from 'evlog/fs'

await app.register(evlog, { drain: createFsDrain() })
```

```typescript [Elysia]
import { createFsDrain } from 'evlog/fs'

app.use(evlog({ drain: createFsDrain() }))
```

```typescript [NestJS]
import { createFsDrain } from 'evlog/fs'

EvlogModule.forRoot({ drain: createFsDrain() })
```

```typescript [Standalone]
import { createFsDrain } from 'evlog/fs'

initLogger({ drain: createFsDrain() })
```

</code-group>

Logs start appearing in `.evlog/logs/` immediately.

## File Structure

```text [.evlog/logs directory layout]
.evlog/
  logs/
    2026-03-14.jsonl    ← one file per day
    2026-03-13.jsonl
    2026-03-12.jsonl
```

Each `.jsonl` file contains one JSON object per line (NDJSON format), making it easy to parse, grep, and stream.

<callout color="success" icon="i-lucide-git-branch">

A `.gitignore` is automatically created on first write, inside the `.evlog/` ancestor directory when present or in the configured `dir` otherwise. Log files are never committed to version control.

</callout>

## Configuration

### Options

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
        dir
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        '.evlog/logs'
      </code>
    </td>
    
    <td>
      Directory for log files
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        maxFiles
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Max files to keep (auto-deletes oldest)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        maxSizePerFile
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Max bytes per file before rotating
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
        false
      </code>
    </td>
    
    <td>
      Pretty-print JSON (multi-line, readable)
    </td>
  </tr>
</tbody>
</table>

### Examples

```typescript [server/plugins/evlog-drain.ts]
// Keep only the last 7 days of logs
createFsDrain({ maxFiles: 7 })

// Rotate files at 10MB, keep 30 files
createFsDrain({
  maxSizePerFile: 10 * 1024 * 1024,
  maxFiles: 30,
})

// Pretty-print for human reading
createFsDrain({ pretty: true })

// Custom directory
createFsDrain({ dir: '/var/log/myapp' })
```

### File Rotation

By default, a new file is created each day (`2026-03-14.jsonl`). When `maxSizePerFile` is set, the adapter creates suffixed files when the current file exceeds the limit:

```text [Rotated log files]
.evlog/logs/
  2026-03-14.jsonl      ← base file (full)
  2026-03-14.1.jsonl    ← first rotation
  2026-03-14.2.jsonl    ← second rotation
```

### Cleanup

When `maxFiles` is set, the adapter automatically deletes the oldest `.jsonl` files after each write, keeping only the most recent files.

## Combining with Network Drains

Use the FS adapter alongside a network drain for local backup:

```typescript [server/plugins/evlog-drain.ts]
import { createFsDrain } from 'evlog/fs'
import { createAxiomDrain } from 'evlog/axiom'

const fs = createFsDrain({ maxFiles: 7 })
const axiom = createAxiomDrain()

const drain = async (ctx) => {
  await Promise.allSettled([fs(ctx), axiom(ctx)])
}
```

## Querying Logs

### Stream in real-time

```bash [Terminal]
tail -f .evlog/logs/2026-03-14.jsonl
```

### Search with jq

```bash [Terminal]
# Find errors
cat .evlog/logs/2026-03-14.jsonl | jq 'select(.level == "error")'

# Slow requests (duration is a formatted string like "706ms" or "1.23s")
cat .evlog/logs/2026-03-14.jsonl | jq 'select(.duration | test("^[0-9.]+s"))'

# Requests by path
cat .evlog/logs/2026-03-14.jsonl | jq 'select(.path == "/api/checkout")'
```

### Search with grep

```bash [Terminal]
# Find all errors
grep '"level":"error"' .evlog/logs/2026-03-14.jsonl

# Find by request ID
grep 'req_abc123' .evlog/logs/*.jsonl
```

## Direct API Usage

For advanced use cases, use the lower-level write functions:

```typescript [src/index.ts]
import { writeToFs, writeBatchToFs } from 'evlog/fs'

await writeToFs(event, {
  dir: '.evlog/logs',
  pretty: false,
})

await writeBatchToFs(events, {
  dir: '.evlog/logs',
  pretty: false,
})
```

## AI Log Analysis

The file system drain pairs with the [`analyze-logs` agent skill](/getting-started/agent-skills). When installed, your AI assistant can read the NDJSON logs directly to debug errors, trace requests, and investigate performance without any external tools.

## Next Steps

- [Agent Skills](/getting-started/agent-skills) - Let AI analyze your logs
- [Axiom Adapter](/adapters/axiom) - Send logs to Axiom for querying and dashboards
- [Pipeline](/adapters/pipeline) - Add batching and retry to any drain
- [Custom Adapters](/adapters/custom) - Build your own adapter



---

- NDJSON Format
- [Axiom Adapter](/adapters/axiom)

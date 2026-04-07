# NuxtHub Storage

> Self-hosted log retention for evlog using NuxtHub database storage. Store, query, and automatically clean up your structured logs with zero external dependencies.

`@evlog/nuxthub` stores your evlog wide events directly in your NuxtHub database. No external logging service needed. Your logs live next to your data, with automatic cleanup based on a retention policy.

## Why Self-Hosted Logs?

External logging services (Axiom, Datadog, etc.) are great for production at scale. But sometimes you want:

- **Zero external dependencies** - logs stored in the same database as your app
- **Full data ownership** - no third-party access to your log data
- **Free tier friendly** - no per-event pricing, just your existing database
- **Development & staging** - full log visibility without paying for a service

`@evlog/nuxthub` works as a drop-in drain. Your existing evlog setup stays the same, you just get a database-backed storage layer on top.

## Install

<code-group>

```bash [pnpm]
pnpm add @nuxthub/core @evlog/nuxthub
```

```bash [npm]
npm install @nuxthub/core @evlog/nuxthub
```

```bash [yarn]
yarn add @nuxthub/core @evlog/nuxthub
```

```bash [bun]
bun add @nuxthub/core @evlog/nuxthub
```

</code-group>

Or with `nuxi`:

```bash
npx nuxi module add @nuxthub/core @evlog/nuxthub
```

## Setup

Add the module to your `nuxt.config.ts`:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@evlog/nuxthub'],

  evlog: {
    retention: '7d',
  },
})
```

Even if `@evlog/nuxthub` can auto-register missing modules, we recommend explicitly installing `@nuxthub/core` and registering it in `modules` for a clearer and more predictable setup.

That's it. The module automatically:

1. Installs `evlog/nuxt` and `@nuxthub/core` if not already registered
2. Registers the `evlog_events` database schema with NuxtHub
3. Hooks into `evlog:drain` to store every event in the database
4. Schedules a cleanup task based on your retention policy

<callout color="info" icon="i-lucide-info">

**Prerequisites:** Your project must use NuxtHub with a database configured. `@evlog/nuxthub` uses Drizzle ORM to interact with the database.

</callout>

## How It Works

```text
Request → evlog wide event → evlog:drain hook → INSERT into evlog_events table
                                                          ↓
                          Cron task (automatic) → DELETE events older than retention
```

Every wide event emitted by evlog is stored as a row in the `evlog_events` table. The drain plugin handles both single events and batches (when used with the [pipeline](/adapters/pipeline)).

### Database Schema

The `evlog_events` table stores indexed columns for fast querying and a `data` JSON column for all remaining fields:

<table>
<thead>
  <tr>
    <th>
      Column
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
        id
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      UUID primary key
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
        text
      </code>
    </td>
    
    <td>
      Event timestamp
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
        text
      </code>
    </td>
    
    <td>
      Log level (info, warn, error, debug)
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
        text
      </code>
    </td>
    
    <td>
      Service name
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
        text
      </code>
    </td>
    
    <td>
      Environment (production, staging, etc.)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        method
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      HTTP method
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        path
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      Request path
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        status
      </code>
    </td>
    
    <td>
      <code>
        integer
      </code>
    </td>
    
    <td>
      HTTP status code
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        duration_ms
      </code>
    </td>
    
    <td>
      <code>
        integer
      </code>
    </td>
    
    <td>
      Request duration in milliseconds
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        request_id
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      Request correlation ID
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        source
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      Event source (server, client)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        error
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      Error details (JSON string)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        data
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      All remaining event fields (JSON)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        created_at
      </code>
    </td>
    
    <td>
      <code>
        text
      </code>
    </td>
    
    <td>
      Row insertion timestamp
    </td>
  </tr>
</tbody>
</table>

Indexed columns: `timestamp`, `level`, `service`, `status`, `request_id`, `created_at`.

### Dialect Support

The schema is automatically registered for your NuxtHub database dialect:

- **SQLite** (default for Cloudflare D1)
- **MySQL**
- **PostgreSQL**

The correct schema is selected via the `hub:db:schema:extend` hook based on your NuxtHub configuration.

## Combining with External Adapters

`@evlog/nuxthub` doesn't replace external adapters, you can use both. The module registers its own `evlog:drain` hook, so any other drain plugins you have will still work:

```typescript [server/plugins/evlog-drain.ts]
import { createAxiomDrain } from 'evlog/axiom'

export default defineNitroPlugin((nitroApp) => {
  // This runs alongside @evlog/nuxthub's built-in drain
  nitroApp.hooks.hook('evlog:drain', createAxiomDrain())
})
```

## Next Steps

- [Retention & Cleanup](/nuxthub/retention) - Configure retention policy and cleanup scheduling



---

- NuxtHub
- [Adapters](/adapters/overview)

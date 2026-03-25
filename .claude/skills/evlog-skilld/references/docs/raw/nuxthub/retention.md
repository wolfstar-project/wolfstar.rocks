# Retention & Cleanup

> Configure how long logs are kept in NuxtHub and how they are automatically cleaned up with scheduled tasks, cron jobs, and retention policies.

`@evlog/nuxthub` automatically deletes old events based on your retention policy. No manual cleanup needed.

## Configuration

Set the retention period in your `nuxt.config.ts`:

```typescript [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@evlog/nuxthub'],

  evlog: {
    retention: '7d', // default
  },
})
```

### Retention Format

The retention value is a number followed by a unit:

<table>
<thead>
  <tr>
    <th>
      Unit
    </th>
    
    <th>
      Description
    </th>
    
    <th>
      Example
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        d
      </code>
    </td>
    
    <td>
      Days
    </td>
    
    <td>
      <code>
        7d
      </code>
      
       = 7 days
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        h
      </code>
    </td>
    
    <td>
      Hours
    </td>
    
    <td>
      <code>
        24h
      </code>
      
       = 24 hours
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        m
      </code>
    </td>
    
    <td>
      Minutes
    </td>
    
    <td>
      <code>
        60m
      </code>
      
       = 60 minutes
    </td>
  </tr>
</tbody>
</table>

## How Cleanup Works

The module registers a Nitro scheduled task (`evlog:cleanup`) that runs on a cron schedule derived from your retention value. The cron frequency is set to roughly half the retention period:

<table>
<thead>
  <tr>
    <th>
      Retention
    </th>
    
    <th>
      Cron Schedule
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
        60m
      </code>
    </td>
    
    <td>
      <code>
        */30 * * * *
      </code>
    </td>
    
    <td>
      Every 30 minutes
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        24h
      </code>
    </td>
    
    <td>
      <code>
        0 */12 * * *
      </code>
    </td>
    
    <td>
      Every 12 hours
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        7d
      </code>
    </td>
    
    <td>
      <code>
        0 3 * * *
      </code>
    </td>
    
    <td>
      Daily at 3:00 AM
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        30d
      </code>
    </td>
    
    <td>
      <code>
        0 3 * * *
      </code>
    </td>
    
    <td>
      Daily at 3:00 AM
    </td>
  </tr>
</tbody>
</table>

The cleanup task deletes all rows in `evlog_events` where `created_at` is older than the retention period.

## Manual Cleanup

You can trigger cleanup manually via the API endpoint:

```bash
curl https://your-app.com/api/_cron/evlog-cleanup
```

### Cron Secret Protection

If the `CRON_SECRET` environment variable is set, the endpoint requires a Bearer token:

```bash
curl -H "Authorization: Bearer your-secret" \
  https://your-app.com/api/_cron/evlog-cleanup
```

This is recommended for production deployments to prevent unauthorized cleanup triggers.

## Vercel Cron

When installing the module with `nuxi module add`, you'll be prompted to create a `vercel.json` with the appropriate cron schedule:

```json [vercel.json]
{
  "crons": [
    {
      "path": "/api/_cron/evlog-cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

On Vercel, the `CRON_SECRET` environment variable is automatically set and validated.

## Cloudflare & Other Platforms

On Cloudflare Workers and other platforms, the Nitro scheduled task handles cleanup automatically without any additional cron configuration. The task is registered with `experimental.tasks` enabled in the Nitro config.

## Next Steps

- [Overview](/nuxthub/overview) - Installation and setup
- [Adapters](/adapters/overview) - Send logs to external services alongside NuxtHub storage
- [Pipeline](/adapters/pipeline) - Batch events for better database performance



---

- [Overview](/nuxthub/overview)

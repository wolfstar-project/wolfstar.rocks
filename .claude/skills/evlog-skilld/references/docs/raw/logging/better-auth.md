# Better Auth Integration

> Automatically identify users on every request. Every wide event includes who made the request — userId, user profile, and session metadata — with zero manual work.

`evlog/better-auth` turns anonymous wide events into identified ones. Every request automatically includes who made it — no manual `log.set({ user })` needed.

<code-collapse>

```txt [Prompt]
Add Better Auth user identification to my app with evlog.

- Import createAuthMiddleware from 'evlog/better-auth'
- Call createAuthMiddleware(auth) to get an identify function
- Call identify(log, headers, path) in your middleware/hook to auto-identify users on every request
- Safe by default — only extracts whitelisted fields, never logs passwords or tokens
- Supports include/exclude route patterns, lifecycle hooks, and Better Auth plugin fields
- Works with all frameworks: Nuxt, Next.js, Express, Hono, Fastify, NestJS, Elysia, standalone

Docs: https://www.evlog.dev/logging/better-auth
Adapters: https://www.evlog.dev/adapters
```

</code-collapse>

## Quick Start

One middleware, all requests identified:

<code-group>

```typescript [server/middleware/auth-identify.ts (Nuxt)]
import { createAuthMiddleware } from 'evlog/better-auth'

const identify = createAuthMiddleware(auth, {
  exclude: ['/api/auth/**'],
})

export default defineEventHandler(async (event) => {
  if (!event.context.log) return
  await identify(event.context.log, event.headers, event.path)
})
```

```typescript [app/api/checkout/route.ts (Next.js)]
import { withEvlog, useLogger } from '@/lib/evlog'
import { createAuthMiddleware } from 'evlog/better-auth'
import { auth } from '@/lib/auth'

const identify = createAuthMiddleware(auth)

export const POST = withEvlog(async (request: Request) => {
  const log = useLogger()
  await identify(log, request.headers)
  log.set({ action: 'checkout' })
  return Response.json({ success: true })
})
```

```typescript [src/index.ts (Express)]
import { createAuthMiddleware } from 'evlog/better-auth'

const identify = createAuthMiddleware(auth, {
  exclude: ['/api/auth/**'],
})

app.use(async (req, res, next) => {
  await identify(req.log, req.headers, req.path)
  next()
})
```

```typescript [src/index.ts (Hono)]
import { createAuthMiddleware } from 'evlog/better-auth'

const identify = createAuthMiddleware(auth, {
  exclude: ['/api/auth/**'],
})

app.use(async (c, next) => {
  await identify(c.get('log'), c.req.raw.headers, c.req.path)
  await next()
})
```

```typescript [src/index.ts (Fastify)]
import { createAuthMiddleware } from 'evlog/better-auth'

const identify = createAuthMiddleware(auth, {
  exclude: ['/api/auth/**'],
})

app.addHook('onRequest', async (request) => {
  await identify(request.log, request.headers, request.url)
})
```

```typescript [src/index.ts (Elysia)]
import { createAuthMiddleware } from 'evlog/better-auth'

const identify = createAuthMiddleware(auth, {
  exclude: ['/api/auth/**'],
})

app.derive(async ({ log, request }) => {
  await identify(log, request.headers, new URL(request.url).pathname)
  return {}
})
```

```typescript [src/auth-identify.middleware.ts (NestJS)]
import { createAuthMiddleware } from 'evlog/better-auth'
import { useLogger } from 'evlog/nestjs'

const identify = createAuthMiddleware(auth, {
  exclude: ['/api/auth/**'],
})

@Injectable()
export class AuthIdentifyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    await identify(useLogger(), req.headers, req.path)
    next()
  }
}
```

```typescript [scripts/sync-job.ts (Standalone)]
import { identifyUser } from 'evlog/better-auth'
import { createLogger } from 'evlog'

const log = createLogger()
const session = await auth.api.getSession({ headers })
if (session) identifyUser(log, session)
log.emit()
```

</code-group>

Your wide event now includes the user:

<code-group>

```json [Before — anonymous]
{
  "level": "info",
  "method": "POST",
  "path": "/api/checkout",
  "status": 200,
  "duration": "120ms",
  "requestId": "a5669202-7765-4f59-b6f0-b9f40ce71599",
  "cart": { "items": 3, "total": 9999 }
}
```

```json [After — identified]
{
  "level": "info",
  "method": "POST",
  "path": "/api/checkout",
  "status": 200,
  "duration": "120ms",
  "requestId": "a5669202-7765-4f59-b6f0-b9f40ce71599",
  "userId": "QBX9tPjJQExWawAbNll75",
  "user": {
    "id": "QBX9tPjJQExWawAbNll75",
    "name": "Hugo Richard",
    "email": "hugo@example.com",
    "emailVerified": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "session": {
    "id": "Xhmh6TxKJQrVKFX0Y0II",
    "expiresAt": "2024-01-22T10:00:00.000Z",
    "ipAddress": "192.168.1.42",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "auth": {
    "resolvedIn": 12,
    "identified": true
  },
  "cart": { "items": 3, "total": 9999 }
}
```

</code-group>

## How It Works

The integration resolves the Better Auth session from request cookies, extracts safe user and session fields, and sets them on the logger. Auth routes are skipped by default.

`Request` → `Middleware` → `Better Auth` → `Logger` → `Drain`

1. Incoming request hits your middleware
2. Middleware checks `include`/`exclude` patterns — skips if route doesn't match
3. `getSession(headers)` resolves the session via Better Auth (timing is captured)
4. `identifyUser(log, session)` sets `userId`, `user`, and `session` on the logger
5. `onIdentify` or `onAnonymous` hook fires based on session result
6. At request end, the wide event is emitted with full user context to your drain

<table>
<thead>
  <tr>
    <th>
      Export
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
        identifyUser(log, session)
      </code>
    </td>
    
    <td>
      Core helper — extracts safe fields from a session and sets them on the logger. Returns <code>
        true
      </code>
      
       if identified
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createAuthMiddleware(auth)
      </code>
    </td>
    
    <td>
      Returns an async <code>
        (log, headers, path?) => Promise<boolean>
      </code>
      
       function with route filtering, timing, and hooks
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createAuthIdentifier(auth)
      </code>
    </td>
    
    <td>
      Nitro <code>
        request
      </code>
      
       hook factory for standalone Nitro apps
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        maskEmail(email)
      </code>
    </td>
    
    <td>
      Mask an email: <code>
        hugo@example.com
      </code>
      
       → <code>
        h***@example.com
      </code>
    </td>
  </tr>
</tbody>
</table>

## identifyUser

The core building block. Takes a `RequestLogger` and a Better Auth session, extracts safe fields, and calls `log.set()`. Returns `true` if the user was identified, `false` otherwise:

```typescript [server/api/checkout.post.ts]
import { identifyUser } from 'evlog/better-auth'

const session = await auth.api.getSession({ headers: event.headers })
if (session) {
  const identified = identifyUser(log, session)
  if (identified) {
    log.set({ subscription: 'premium' })
  }
}
```

Safe by default — only extracts whitelisted fields. Passwords, tokens, and secrets are never included.

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
        maskEmail
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
      Mask emails as <code>
        h***@example.com
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        session
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
      Include session metadata (<code>
        session.id
      </code>
      
      , <code>
        session.expiresAt
      </code>
      
      , <code>
        session.ipAddress
      </code>
      
      , <code>
        session.userAgent
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fields
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      <code>
        ['id', 'name', 'email', 'image', 'emailVerified', 'createdAt']
      </code>
    </td>
    
    <td>
      User fields to extract
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        extend
      </code>
    </td>
    
    <td>
      <code>
        (session) => Record<string, unknown>
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Add custom fields from Better Auth plugins (organizations, roles, etc.)
    </td>
  </tr>
</tbody>
</table>

```typescript [server/api/checkout.post.ts]
identifyUser(log, session, {
  maskEmail: true,
  fields: ['id', 'name'],
  session: false,
})
```

### extend

Use `extend` to capture fields added by Better Auth plugins (organizations, 2FA, roles, etc.):

```typescript [server/middleware/auth-identify.ts]
import { createAuthMiddleware } from 'evlog/better-auth'

const identify = createAuthMiddleware(auth, {
  extend: (session) => ({
    organization: session.user.activeOrganization,
    role: session.user.role,
  }),
})
```

Wide event with plugin fields:

```json [Wide Event]
{
  "userId": "QBX9tPjJQExWawAbNll75",
  "user": { "id": "QBX9tPjJQExWawAbNll75", "name": "Hugo Richard" },
  "organization": { "id": "org_42", "name": "Acme" },
  "role": "admin"
}
```

## createAuthMiddleware

Framework-agnostic factory. Call it once at startup, then use the returned function in your middleware. The third argument `path` enables built-in route filtering:

```typescript [server/middleware/auth-identify.ts]
import { createAuthMiddleware } from 'evlog/better-auth'

const identify = createAuthMiddleware(auth, {
  exclude: ['/api/auth/**', '/api/public/**'],
  include: ['/api/**'],
  maskEmail: true,
})
```

The function signature is `(log, headers, path?) => Promise<boolean>`. It resolves the session, calls `identifyUser`, captures timing, fires lifecycle hooks, and silently catches errors so session resolution never breaks a request.

### Options

Inherits all `identifyUser` options, plus:

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
        ['/api/auth/**']
      </code>
    </td>
    
    <td>
      Route patterns to skip (glob)
    </td>
  </tr>
  
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
      If set, only matching routes are resolved
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        onIdentify
      </code>
    </td>
    
    <td>
      <code>
        (log, session) => void
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Called after successful identification
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        onAnonymous
      </code>
    </td>
    
    <td>
      <code>
        (log) => void
      </code>
    </td>
    
    <td>
      <code>
        undefined
      </code>
    </td>
    
    <td>
      Called when no session is found
    </td>
  </tr>
</tbody>
</table>

### Lifecycle Hooks

Use `onIdentify` to react to user identification — for example, force-keep logs for premium users via tail sampling:

```typescript [server/middleware/auth-identify.ts]
const identify = createAuthMiddleware(auth, {
  onIdentify: (log, session) => {
    if (session.user.plan === 'enterprise') {
      log.set({ _forceKeep: true })
    }
  },
  onAnonymous: (log) => {
    log.set({ anonymous: true })
  },
})
```

## createAuthIdentifier (Standalone Nitro)

A factory that creates a Nitro `request` hook. Designed for standalone Nitro apps where the evlog Nitro module handles hook ordering.

<note>

For **Nuxt**, use `createAuthMiddleware` in a server middleware instead — Nitro plugin hook ordering can cause the logger to not be available yet in the `request` hook.

</note>

```typescript [server/plugins/evlog-auth.ts]
import { createAuthIdentifier } from 'evlog/better-auth'
import { auth } from './lib/auth'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', createAuthIdentifier(auth, {
    exclude: ['/api/auth/**', '/api/public/**'],
  }))
})
```

## Performance

`getSession()` costs a database query on every request. The `auth.resolvedIn` field in your wide event tells you exactly how long each resolution takes. For high-traffic apps:

1. **Enable session caching** in Better Auth to avoid hitting the database on every request
2. **Use exclude** to skip public routes that don't need user context
3. **Use include** to limit resolution to specific route patterns

```json [Wide Event — slow session resolution]
{
  "auth": { "resolvedIn": 245, "identified": true },
  "duration": "312ms"
}
```

When `auth.resolvedIn` is high relative to `duration`, enable session caching in Better Auth.

## Client Identity Sync

On the client side, watch the Better Auth session and call `setIdentity()` to include user context in client-side logs:

```typescript [composables/useAuthIdentity.ts]
import { authClient } from '~/lib/auth-client'

export function useAuthIdentity() {
  const session = authClient.useSession()

  watch(() => session.value?.data?.user, (user) => {
    if (user) {
      setIdentity({ userId: user.id, userName: user.name })
    } else {
      clearIdentity()
    }
  }, { immediate: true })
}
```

Call it once in your root layout:

```vue [app.vue]
<script setup>
useAuthIdentity()
</script>
```

Client-side logs now include the user identity:

```json [Client Log]
{
  "level": "info",
  "tag": "checkout",
  "message": "User clicked checkout",
  "userId": "QBX9tPjJQExWawAbNll75",
  "userName": "Hugo Richard"
}
```

## Wide Event Fields

<table>
<thead>
  <tr>
    <th>
      Field
    </th>
    
    <th>
      Source
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
        userId
      </code>
    </td>
    
    <td>
      <code>
        session.user.id
      </code>
    </td>
    
    <td>
      Top-level user ID (used by PostHog adapter as <code>
        distinct_id
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        user.id
      </code>
    </td>
    
    <td>
      <code>
        session.user.id
      </code>
    </td>
    
    <td>
      User ID
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        user.name
      </code>
    </td>
    
    <td>
      <code>
        session.user.name
      </code>
    </td>
    
    <td>
      Display name
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        user.email
      </code>
    </td>
    
    <td>
      <code>
        session.user.email
      </code>
    </td>
    
    <td>
      Email (maskable with <code>
        maskEmail: true
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        user.image
      </code>
    </td>
    
    <td>
      <code>
        session.user.image
      </code>
    </td>
    
    <td>
      Avatar URL
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        user.emailVerified
      </code>
    </td>
    
    <td>
      <code>
        session.user.emailVerified
      </code>
    </td>
    
    <td>
      Email verification status
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        user.createdAt
      </code>
    </td>
    
    <td>
      <code>
        session.user.createdAt
      </code>
    </td>
    
    <td>
      Account creation date (ISO string)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        session.id
      </code>
    </td>
    
    <td>
      <code>
        session.session.id
      </code>
    </td>
    
    <td>
      Session ID
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        session.expiresAt
      </code>
    </td>
    
    <td>
      <code>
        session.session.expiresAt
      </code>
    </td>
    
    <td>
      Session expiry (ISO string)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        session.ipAddress
      </code>
    </td>
    
    <td>
      <code>
        session.session.ipAddress
      </code>
    </td>
    
    <td>
      Client IP from the session
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        session.userAgent
      </code>
    </td>
    
    <td>
      <code>
        session.session.userAgent
      </code>
    </td>
    
    <td>
      User agent string from the session
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        session.createdAt
      </code>
    </td>
    
    <td>
      <code>
        session.session.createdAt
      </code>
    </td>
    
    <td>
      Session creation date (ISO string)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        auth.resolvedIn
      </code>
    </td>
    
    <td>
      Measured
    </td>
    
    <td>
      Session resolution time in ms
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        auth.identified
      </code>
    </td>
    
    <td>
      Computed
    </td>
    
    <td>
      Whether the request was identified
    </td>
  </tr>
</tbody>
</table>

## Works With the AI SDK

When combined with `evlog/ai`, your wide events include both user identity and AI metrics in a single event:

```json [Wide Event — AI + User]
{
  "method": "POST",
  "path": "/api/chat",
  "status": 200,
  "duration": "4.5s",
  "userId": "QBX9tPjJQExWawAbNll75",
  "user": {
    "id": "QBX9tPjJQExWawAbNll75",
    "name": "Hugo Richard",
    "email": "hugo@example.com"
  },
  "auth": { "resolvedIn": 8, "identified": true },
  "ai": {
    "calls": 1,
    "model": "claude-sonnet-4.6",
    "provider": "anthropic",
    "inputTokens": 3312,
    "outputTokens": 814,
    "totalTokens": 4126,
    "msToFirstChunk": 234,
    "msToFinish": 4500,
    "tokensPerSecond": 180
  }
}
```

This is the power of wide events — one event per request, all context in one place: who made the request, what they did, how the AI responded, and how it performed.



---

- [Wide Events](/logging/wide-events)
- [Adapters](/adapters/overview)

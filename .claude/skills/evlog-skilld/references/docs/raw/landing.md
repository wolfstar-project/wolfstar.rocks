# evlog - Stop grepping through chaos

> Wide events and structured errors for TypeScript. One log per request, full context, errors that explain why and how to fix.

<landing-hero>
<template v-slot:title="">

Stop grepping <br />

 through chaos

</template>

<template v-slot:description="">

Wide events and structured errors for TypeScript. One log per request, full context, errors that explain why and how to fix.

</template>
</landing-hero>

<landing-features>
<template v-slot:body="">
<features-feature-simple-api link="/getting-started/quick-start" link-label="Quick start guide">
<template v-slot:headline="">

Simple API

</template>

<template v-slot:title="">

Set context. <br />

 Get answers

</template>

<template v-slot:description="">

Accumulate context with log.set, throw structured errors with why and fix. One wide event captures everything, whether the request succeeds or fails.

</template>
</features-feature-simple-api>

<features-feature-agent-ready link="/getting-started/agent-skills" link-label="Agent skills setup">
<template v-slot:headline="">

Agent Ready

</template>

<template v-slot:title="">

Built for agents

</template>

<template v-slot:description="">

Structured fields, machine-readable context, and actionable metadata that give AI agents everything they need to diagnose and resolve issues on their own. Enable the file system drain to write NDJSON logs locally and let agents read them directly.

</template>
</features-feature-agent-ready>

<features-feature-adapters link="/adapters/overview" link-label="Explore adapters">
<template v-slot:headline="">

Drain Pipeline

</template>

<template v-slot:title="">

Send everywhere

</template>

<template v-slot:description="">

Batched writes, automatic retries with backoff, and fan-out to multiple destinations. Your logs flow through a pipeline that never blocks your response.

</template>
</features-feature-adapters>

<features-feature-client-drain link="/logging/client-logging" link-label="Client logging guide">
<template v-slot:headline="">

Client Logs

</template>

<template v-slot:title="">

See the full picture

</template>

<template v-slot:description="">

Capture browser events and drain them to your server. Automatic batching, retries, and page-aware flushing with the same pipeline from client to server.

</template>
</features-feature-client-drain>

<features-feature-sampling link="/core-concepts/sampling" link-label="Sampling guide">
<template v-slot:headline="">

Sampling

</template>

<template v-slot:title="">

Keep what matters

</template>

<template v-slot:description="">

Two-tier filtering: head sampling drops noise by level, tail sampling rescues critical events. Never miss errors, slow requests, or critical paths.

</template>
</features-feature-sampling>

<features-feature-ai-sdk link="/logging/ai-sdk" link-label="AI SDK integration">
<template v-slot:headline="">

AI Observability

</template>

<template v-slot:title="">

Make AI calls <br />

 observable

</template>

<template v-slot:description="">

Your AI endpoints are black boxes. You don't know how many tokens each request burns, which tools the model called, or how fast the stream was. Wrap your model with one line and every call is captured into the wide event. Cost estimation, tool execution timing, streaming performance, cache hits, reasoning tokens, and multi-step agent breakdowns.

</template>
</features-feature-ai-sdk>

<features-feature-performance link="/core-concepts/performance" link-label="Benchmark results">
<template v-slot:headline="">

Performance

</template>

<template v-slot:title="">

Add logging, <br />

 not overhead

</template>

<template v-slot:description="">

Zero dependencies, 5.2 kB gzip, ~3µs per request. Benchmarked against pino, consola, and winston. 8x faster than pino in wide event scenarios while producing richer, more useful output.

</template>
</features-feature-performance>

<features-feature-frameworks link="/frameworks/overview" link-label="Framework integrations">
<template v-slot:headline="">

Frameworks

</template>

<template v-slot:title="">

Your stack. Covered

</template>

<template v-slot:description="">

Native integrations for every major framework. One import, zero config, same API everywhere. The Vite plugin adds auto-init, debug stripping, and source location to any Vite-based stack.

</template>

<template v-slot:nuxt="">

```ts [server/api/checkout.post.ts]
export default defineEventHandler(async (event) => {
  const log = useLogger(event)
  const { cartId } = await readBody(event)

  const cart = await db.findCart(cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  log.set({ stripe: { chargeId: charge.id } })

  if (!charge.success) {
    throw createError({
      status: 402,
      message: 'Payment failed',
      why: charge.decline_reason,
      fix: 'Try a different payment method',
    })
  }

  return { orderId: charge.id }
})
```

</template>

<template v-slot:nextjs="">

```ts [app/api/checkout/route.ts]
import { withEvlog, useLogger } from '@/lib/evlog'
import { createError } from 'evlog'

export const POST = withEvlog(async (req) => {
  const log = useLogger()
  const { cartId } = await req.json()

  const cart = await db.findCart(cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  log.set({ stripe: { chargeId: charge.id } })

  if (!charge.success) {
    throw createError({
      status: 402,
      message: 'Payment failed',
      why: charge.decline_reason,
      fix: 'Try a different payment method',
    })
  }

  return Response.json({ orderId: charge.id })
})
```

</template>

<template v-slot:sveltekit="">

```ts [src/routes/api/checkout/+server.ts]
import { json } from '@sveltejs/kit'
import { createError } from 'evlog'
import { useLogger } from 'evlog/sveltekit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const log = useLogger()
  const { cartId } = await request.json()

  const cart = await db.findCart(cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  log.set({ stripe: { chargeId: charge.id } })

  if (!charge.success) {
    throw createError({
      status: 402,
      message: 'Payment failed',
      why: charge.decline_reason,
      fix: 'Try a different payment method',
    })
  }

  return json({ orderId: charge.id })
}
```

</template>

<template v-slot:nitro="">

```ts [routes/api/checkout.post.ts]
import { defineHandler, readBody } from 'nitro/h3'
import { useLogger, createError } from 'evlog/nitro/v3'

export default defineHandler(async (event) => {
  const log = useLogger(event)
  const { cartId } = await readBody(event)

  const cart = await db.findCart(cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  log.set({ stripe: { chargeId: charge.id } })

  if (!charge.success) {
    throw createError({
      status: 402,
      message: 'Payment failed',
      why: charge.decline_reason,
      fix: 'Try a different payment method',
    })
  }

  return { orderId: charge.id }
})
```

</template>

<template v-slot:tanstack-start="">

```ts [src/routes/api/checkout.ts]
import { createFileRoute } from '@tanstack/react-router'
import { useRequest } from 'nitro/context'
import { createError } from 'evlog'
import type { RequestLogger } from 'evlog'

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const req = useRequest()
        const log = req.context.log as RequestLogger
        const { cartId } = await request.json()

        const cart = await db.findCart(cartId)
        log.set({ cart: { items: cart.items.length, total: cart.total } })

        const charge = await stripe.charge(cart.total)
        log.set({ stripe: { chargeId: charge.id } })

        if (!charge.success) {
          throw createError({
            status: 402,
            message: 'Payment failed',
            why: charge.decline_reason,
            fix: 'Try a different payment method',
          })
        }

        return Response.json({ orderId: charge.id })
      },
    },
  },
})
```

</template>

<template v-slot:react-router="">

```ts [app/routes/api.checkout.tsx]
import { loggerContext } from 'evlog/react-router'
import { createError } from 'evlog'

export async function action({ request, context }: Route.ActionArgs) {
  const log = context.get(loggerContext)
  const { cartId } = await request.json()

  const cart = await db.findCart(cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  log.set({ stripe: { chargeId: charge.id } })

  if (!charge.success) {
    throw createError({
      status: 402,
      message: 'Payment failed',
      why: charge.decline_reason,
      fix: 'Try a different payment method',
    })
  }

  return Response.json({ orderId: charge.id })
}
```

</template>

<template v-slot:nestjs="">

```ts [app.module.ts]
import { Module } from '@nestjs/common'
import { EvlogModule } from 'evlog/nestjs'
import { createAxiomDrain } from 'evlog/axiom'

@Module({
  imports: [
    EvlogModule.forRoot({
      drain: createAxiomDrain(),
    }),
  ],
})
export class AppModule {}
```

</template>

<template v-slot:express="">

```ts [src/index.ts]
import { evlog, useLogger } from 'evlog/express'
import { createAxiomDrain } from 'evlog/axiom'

const app = express()
app.use(evlog({ drain: createAxiomDrain() }))

app.post('/checkout', async (req, res) => {
  const log = useLogger()
  const { cartId } = req.body

  const cart = await db.findCart(cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  log.set({ stripe: { chargeId: charge.id } })

  res.json({ orderId: charge.id })
})
```

</template>

<template v-slot:hono="">

```ts [src/index.ts]
import { evlog, type EvlogVariables } from 'evlog/hono'
import { createAxiomDrain } from 'evlog/axiom'

const app = new Hono<EvlogVariables>()
app.use(evlog({ drain: createAxiomDrain() }))

app.post('/checkout', async (c) => {
  const log = c.get('log')
  const { cartId } = await c.req.json()

  const cart = await db.findCart(cartId)
  log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  log.set({ stripe: { chargeId: charge.id } })

  return c.json({ orderId: charge.id })
})
```

</template>

<template v-slot:fastify="">

```ts [src/index.ts]
import { evlog } from 'evlog/fastify'
import { createAxiomDrain } from 'evlog/axiom'

const app = Fastify({ logger: false })
await app.register(evlog, { drain: createAxiomDrain() })

app.post('/checkout', async (request) => {
  const { cartId } = request.body

  const cart = await db.findCart(cartId)
  request.log.set({ cart: { items: cart.items.length, total: cart.total } })

  const charge = await stripe.charge(cart.total)
  request.log.set({ stripe: { chargeId: charge.id } })

  return { orderId: charge.id }
})
```

</template>

<template v-slot:elysia="">

```ts [src/index.ts]
import { evlog } from 'evlog/elysia'
import { createAxiomDrain } from 'evlog/axiom'

const app = new Elysia()
  .use(evlog({ drain: createAxiomDrain() }))
  .post('/checkout', async ({ log, body }) => {
    const { cartId } = body

    const cart = await db.findCart(cartId)
    log.set({ cart: { items: cart.items.length, total: cart.total } })

    const charge = await stripe.charge(cart.total)
    log.set({ stripe: { chargeId: charge.id } })

    return { orderId: charge.id }
  })
```

</template>

<template v-slot:cloudflare="">

```ts [src/worker.ts]
import { initWorkersLogger, createWorkersLogger } from 'evlog/workers'

initWorkersLogger({ env: { service: 'checkout-worker' } })

export default {
  async fetch(request, env) {
    const log = createWorkersLogger(request)

    const { cartId } = await request.json()
    const cart = await env.DB.findCart(cartId)
    log.set({ cart: { items: cart.items.length, total: cart.total } })

    log.emit()
    return Response.json({ orderId: cart.id })
  },
}
```

</template>

<template v-slot:bun="">

```ts [scripts/migrate-users.ts]
import { initLogger, createLogger } from 'evlog'

initLogger({ env: { service: 'migrate' } })

const log = createLogger({ task: 'user-migration' })

const users = await db.query('SELECT * FROM legacy_users')
log.set({ found: users.length })

for (const user of users) {
  await newDb.upsert({ id: user.id, email: user.email, plan: user.plan })
}

log.set({ migrated: users.length, status: 'complete' })
log.emit()
```

</template>
</features-feature-frameworks>
</template>
</landing-features>

<landing-cta>
<template v-slot:description="">

Wide events, structured errors, dead simple setup. Set up evlog in 10 minutes. Your future self will thank you.

</template>
</landing-cta>

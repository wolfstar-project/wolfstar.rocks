# Structured Errors

> Create errors that explain why they occurred and how to fix them. Add actionable context with why, fix, and link fields for humans and AI agents.

evlog provides a `createError()` function that creates errors with rich, actionable context.

## Why Structured Errors?

Traditional errors are often unhelpful:

```typescript [server/api/checkout.post.ts]
// Unhelpful error
throw new Error('Payment failed')
```

This tells you *what* happened, but not *why* or *how to fix it*.

Structured errors provide context:

<code-group>

```typescript [server/api/checkout.post.ts]
import { createError } from 'evlog'

throw createError({
  message: 'Payment failed',
  status: 402,
  why: 'Card declined by issuer (insufficient funds)',
  fix: 'Try a different payment method or contact your bank',
  link: 'https://docs.example.com/payments/declined',
})
```

```json [Response]
{
  "statusCode": 402,
  "message": "Payment failed",
  "data": {
    "why": "Card declined by issuer (insufficient funds)",
    "fix": "Try a different payment method or contact your bank",
    "link": "https://docs.example.com/payments/declined"
  }
}
```

</code-group>

## Error Fields

<table>
<thead>
  <tr>
    <th>
      Field
    </th>
    
    <th>
      Required
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
        message
      </code>
    </td>
    
    <td>
      Yes
    </td>
    
    <td>
      What happened (shown to users)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        status
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      HTTP status code (default: 500)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        why
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Technical reason (for debugging)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fix
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Actionable solution
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        link
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Documentation URL
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cause
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Original error (for error chaining)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        internal
      </code>
    </td>
    
    <td>
      No
    </td>
    
    <td>
      Backend-only context (see below)
    </td>
  </tr>
</tbody>
</table>

## Backend-only context (`internal`)

Use `internal` when you need extra fields for logs, drains, or support tools, but **must not** expose them in API responses or to `parseError()` on the client.

```typescript
throw createError({
  message: 'Payment could not be completed',
  status: 402,
  why: 'Your card was declined',
  fix: 'Try another payment method',
  internal: {
    correlationId: 'pay_8x2k',
    processorCode: 'insufficient_funds',
    rawIssuerResponse: '…', // never sent to the client
  },
})
```

- **HTTP responses** (Nuxt/Nitro error handler, Next.js, SvelteKit, etc.) and **toJSON()** omit `internal`.
- **parseError()** does not surface `internal` for UI; the thrown error may still carry it server-side on `raw` when debugging.
- **Wide events**: when the framework records the error (e.g. `log.error(err)` or automatic capture on thrown `EvlogError`), the emitted payload includes `error.internal`.

In debuggers, the payload may appear under a symbol key; in code, always use **error.internal**.

## Basic Usage

### Simple Error

<code-group>

```typescript [server/api/users/[id].get.ts]
import { createError } from 'evlog'

throw createError({
  message: 'User not found',
  status: 404,
})
```

```json [Response]
{
  "statusCode": 404,
  "message": "User not found"
}
```

</code-group>

### Error with Full Context

<code-group>

```typescript [server/api/checkout.post.ts]
import { createError } from 'evlog'

throw createError({
  message: 'Payment failed',
  status: 402,
  why: 'Card declined by issuer',
  fix: 'Try a different payment method',
  link: 'https://docs.example.com/payments/declined',
})
```

```json [Response]
{
  "statusCode": 402,
  "message": "Payment failed",
  "data": {
    "why": "Card declined by issuer",
    "fix": "Try a different payment method",
    "link": "https://docs.example.com/payments/declined"
  }
}
```

</code-group>

### Error Chaining

Wrap underlying errors while preserving the original:

```typescript [server/api/checkout.post.ts]
import { createError } from 'evlog'

try {
  await stripe.charges.create(charge)
} catch (err) {
  throw createError({
    message: 'Payment processing failed',
    status: 500,
    why: 'Stripe API returned an error',
    cause: err, // Original error preserved
  })
}
```

## Frontend Error Handling

Use `parseError()` to extract all fields from caught errors:

<code-group>

```typescript [composables/useCheckout.ts]
import { parseError } from 'evlog'

try {
  await $fetch('/api/checkout', { method: 'POST', body: cart })
} catch (err) {
  const error = parseError(err)

  console.log(error.message)  // "Payment failed"
  console.log(error.status)   // 402
  console.log(error.why)      // "Card declined"
  console.log(error.fix)      // "Try another card"
}
```

```typescript [composables/useCheckout.ts (Nuxt UI)]
import { parseError } from 'evlog'

const toast = useToast()

try {
  await $fetch('/api/checkout', { method: 'POST', body: cart })
} catch (err) {
  const error = parseError(err)

  toast.add({
    title: error.message,
    description: error.why,
    color: 'error',
    actions: error.link
      ? [{ label: 'Learn more', onClick: () => window.open(error.link) }]
      : undefined,
  })
}
```

</code-group>

### Error Display Component

Create a reusable error display:

```vue [components/ErrorAlert.vue]
<script setup lang="ts">
import { parseError } from 'evlog'

const { error } = defineProps<{
  error: unknown
}>()

const parsed = computed(() => parseError(error))
</script>

<template>
  <UAlert
    :title="parsed.message"
    :description="parsed.why"
    color="error"
    icon="i-lucide-alert-circle"
  >
    <template v-if="parsed.fix" #description>
      <p>{{ parsed.why }}</p>
      <p class="mt-2 font-medium">{{ parsed.fix }}</p>
    </template>
  </UAlert>
</template>
```

## Best Practices

### Use Appropriate Status Codes

<code-group>

```typescript [400 - Bad Request]
// Client error - user can fix
throw createError({
  message: 'Invalid email format',
  status: 400,
  fix: 'Please enter a valid email address',
})
```

```typescript [401 - Unauthorized]
// Authentication required
throw createError({
  message: 'Please log in to continue',
  status: 401,
  fix: 'Sign in to your account',
  link: '/login',
})
```

```typescript [404 - Not Found]
// Resource not found
throw createError({
  message: 'Order not found',
  status: 404,
})
```

```typescript [500 - Server Error]
// Server error - not user's fault
throw createError({
  message: 'Something went wrong',
  status: 500,
  why: 'Database connection timeout',
  // No 'fix' - user can't fix server errors
})
```

</code-group>

### Provide Actionable Fixes

<code-group>

```typescript [Bad]
// Unhelpful fix
throw createError({
  message: 'Upload failed',
  fix: 'Try again',
})
```

```typescript [Good]
// Actionable fix
throw createError({
  message: 'Upload failed',
  status: 413,
  why: 'File exceeds maximum size (10MB)',
  fix: 'Reduce the file size or compress the image before uploading',
  link: '/docs/upload-limits',
})
```

</code-group>

## Error Categories

Consider creating factory functions for common error types:

<code-group>

```typescript [Definition]
// server/utils/errors.ts
import { createError } from 'evlog'

export const errors = {
  notFound: (resource: string) =>
    createError({
      message: `${resource} not found`,
      status: 404,
    }),

  unauthorized: () =>
    createError({
      message: 'Please log in to continue',
      status: 401,
      fix: 'Sign in to your account',
    }),

  validation: (field: string, issue: string) =>
    createError({
      message: `Invalid ${field}`,
      status: 400,
      why: issue,
      fix: `Please provide a valid ${field}`,
    }),
}
```

```typescript [Usage]
// server/api/orders/[id].get.ts
import { errors } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const order = await getOrder(event.context.params.id)

  if (!order) {
    throw errors.notFound('Order')
  }

  return order
})
```

</code-group>

<callout color="neutral" icon="i-lucide-code">

See the [Next.js guide](/frameworks/nextjs) for a working implementation.

</callout>

## Next Steps

- [Wide Events](/logging/wide-events): Accumulate context and emit comprehensive events
- [Adapters](/adapters/overview): Send errors and events to Axiom, Sentry, PostHog, and more
- [Frameworks](/frameworks/overview): Auto-managed request logging per framework
- [Quick Start](/getting-started/quick-start): See all evlog APIs in action



---

- [Wide Events](/logging/wide-events)
- [Best Practices](/core-concepts/best-practices)

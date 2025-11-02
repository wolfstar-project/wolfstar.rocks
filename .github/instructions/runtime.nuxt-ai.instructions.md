---
applyTo: **/*.{ts,js}
---

# Nuxt Runtime Configuration

## Context

Rules for implementing runtime configuration in Nuxt applications.

- Use runtimeConfig for environment variables
- Separate public and private keys
- Handle server-side configuration properly
- Implement proper type safety

## Requirements

- Use runtimeConfig for environment variables
- Keep sensitive data server-side only
- Use proper TypeScript types
- Implement proper error handling
- Use environment variables for configuration
- Handle both development and production environments
- Implement proper security measures
- Use proper naming conventions
- Document configuration options
- Validate configuration values

## Examples

<example>
// Define runtime config
export default defineNuxtConfig({
  runtimeConfig: {
    // Private keys only available server-side
    apiSecret: '',
    stripe: {
      secretKey: '',
      webhookSecret: '',
    },
    // Public keys available client-side
    public: {
      apiBase: 'https://api.example.com',
      websocketUrl: 'wss://ws.example.com',
      stripe: {
        publishableKey: '',
      },
    },
  },
})

// Usage in component
export default defineComponent({
setup() {
// Access runtime config
const config = useRuntimeConfig()

    // Use in composable
    const { initializeStripe } = useStripe(config.public.stripe.publishableKey)

    // Use in API call
    const { data } = useFetch('/api/data', {
      baseURL: config.public.apiBase,
    })

    return {
      data,
      initializeStripe,
    }

},
})

</example>

<example>
// Server runtime handler
export default defineEventHandler(async (event) => {
  // Access runtime config in server
  const config = useRuntimeConfig()

// Initialize services with private keys
const stripe = new Stripe(config.stripe.secretKey, {
apiVersion: '2023-10-16',
})

// Handle webhook events
const signature = getHeader(event, 'stripe-signature')
const rawBody = await readBody(event)

try {
const webhookEvent = stripe.webhooks.constructEvent(
rawBody,
signature,
config.stripe.webhookSecret,
)

    // Process webhook
    switch (webhookEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(webhookEvent.data.object)
        break
      case 'payment_intent.failed':
        await handlePaymentFailure(webhookEvent.data.object)
        break
      default:
        console.log(`Unhandled event type ${webhookEvent.type}`)
    }

    return { received: true }

}
catch (err) {
throw createError({
statusCode: 400,
message: `Webhook Error: ${err.message}`,
})
}
})

</example>

<example type="invalid">
// ❌ Wrong: Hardcoding sensitive information
const STRIPE_SECRET_KEY = 'sk_test_123456789'
const API_SECRET = 'my_super_secret_key'

// ❌ Wrong: Not using runtime config
export default {
// ❌ Wrong: Exposing secrets in client-side code
stripeConfig: {
secretKey: STRIPE_SECRET_KEY,
publishableKey: 'pk_test_987654321',
},

// ❌ Wrong: Not using environment variables
api: {
baseUrl: 'http://localhost:3000',
secret: API_SECRET,
},
}

// ❌ Wrong: Global state for configuration
if (process.client) {
window.**APP_CONFIG** = {
// ❌ Wrong: Mixing client/server concerns
apiSecret: API_SECRET,
stripeKey: STRIPE_SECRET_KEY,
}
}

// ❌ Wrong: Not using proper typing
export function getConfig() {
// ❌ Wrong: Accessing window directly
return process.client
? window.**APP_CONFIG**
: {
apiSecret: API_SECRET,
stripeKey: STRIPE_SECRET_KEY,
}
}

</example>

## Critical Rules

- NEVER expose sensitive data client-side
- Use runtimeConfig for environment variables
- Keep sensitive data server-side only
- Use proper TypeScript types
- Implement proper security measures
- Validate configuration values

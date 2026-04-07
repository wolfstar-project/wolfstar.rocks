# Install evlog

> Install evlog in your TypeScript project.

evlog supports Nuxt, Next.js, SvelteKit, Nitro, NestJS, and any TypeScript server framework.

## Install

<code-group>

```bash [pnpm]
pnpm add evlog
```

```bash [npm]
npm install evlog
```

```bash [yarn]
yarn add evlog
```

```bash [bun]
bun add evlog
```

</code-group>

### Using Agent Skills

If you use an AI assistant (Claude Code, Cursor, etc.), install the evlog skill for guided setup and code review:

```bash [Terminal]
npx skills add hugorcd/evlog
```

Your AI assistant can then help you set up evlog, review your logging patterns, and migrate existing code to wide events. See [Agent Skills](/getting-started/agent-skills) for details.

## Choose Your Framework

After installing the package, follow the setup guide for your framework:

<card-group>
<card color="neutral" icon="i-simple-icons-nuxtdotjs" title="Nuxt" to="/frameworks/nuxt">

Module with auto-imported `useLogger`, `createError`, and `parseError`.

</card>

<card color="neutral" icon="i-simple-icons-nextdotjs" title="Next.js" to="/frameworks/nextjs">

`createEvlog()` factory with `withEvlog()` handler wrapper.

</card>

<card color="neutral" icon="i-simple-icons-svelte" title="SvelteKit" to="/frameworks/sveltekit">

Handle and handleError hooks with `event.locals.log`.

</card>

<card color="neutral" icon="i-custom-nitro" title="Nitro" to="/frameworks/nitro">

Module for Nitro v2 and v3 with plugin-based hooks.

</card>

<card color="neutral" icon="i-custom-tanstack" title="TanStack Start" to="/frameworks/tanstack-start">

Uses Nitro v3 module with async context.

</card>

<card color="neutral" icon="i-simple-icons-reactrouter" title="React Router" to="/frameworks/react-router">

Middleware with `context.get(loggerContext)`.

</card>

<card color="neutral" icon="i-simple-icons-nestjs" title="NestJS" to="/frameworks/nestjs">

`EvlogModule.forRoot()` with global middleware.

</card>

<card color="neutral" icon="i-simple-icons-express" title="Express" to="/frameworks/express">

Middleware with `req.log`.

</card>

<card color="neutral" icon="i-simple-icons-hono" title="Hono" to="/frameworks/hono">

Middleware with `c.get('log')`.

</card>

<card color="neutral" icon="i-simple-icons-fastify" title="Fastify" to="/frameworks/fastify">

Plugin with `request.log`.

</card>

<card color="neutral" icon="i-custom-elysia" title="Elysia" to="/frameworks/elysia">

Plugin with `log` in route context.

</card>

<card color="neutral" icon="i-simple-icons-cloudflare" title="Cloudflare Workers" to="/frameworks/cloudflare-workers">

Factory for request-scoped loggers.

</card>
</card-group>

<callout color="neutral" icon="i-lucide-arrow-right">

See the full [Framework Integrations](/frameworks/overview) page for a comparison table and all available integrations including [Standalone TypeScript](/frameworks/standalone), [Astro](/frameworks/astro), and [Custom Integration](/frameworks/custom-integration).

</callout>

## TypeScript Configuration

evlog ships with full TypeScript type definitions. No additional configuration is required.

<callout color="success" icon="i-lucide-check">

evlog requires TypeScript 5.0 or higher for optimal type inference.

</callout>

## Next Steps

- [Quick Start](/getting-started/quick-start) - Learn the core concepts and start using evlog
- [Wide Events](/core-concepts/wide-events) - Understand the wide event pattern
- [Adapters](/adapters/overview) - Send logs to Axiom, PostHog, Sentry, and more



---

- [Frameworks](/frameworks/overview)

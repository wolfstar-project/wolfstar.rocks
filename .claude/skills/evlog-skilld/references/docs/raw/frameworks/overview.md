# Framework Integrations

> evlog supports every major TypeScript framework. Choose your stack and get started in minutes.

evlog provides native integrations for every major TypeScript framework. The same core API (`log.set()`, `createError()`, `parseError()`) works identically everywhere. Only the setup differs.

## Overview

<table>
<thead>
  <tr>
    <th>
      Framework
    </th>
    
    <th>
      Import
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Logger Access
    </th>
    
    <th>
      Status
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <a href="/frameworks/nuxt">
        Nuxt
      </a>
    </td>
    
    <td>
      <code>
        evlog/nuxt
      </code>
    </td>
    
    <td>
      Module
    </td>
    
    <td>
      <code>
        useLogger(event)
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/nextjs">
        Next.js
      </a>
    </td>
    
    <td>
      <code>
        evlog/next
      </code>
    </td>
    
    <td>
      Factory
    </td>
    
    <td>
      <code>
        useLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/sveltekit">
        SvelteKit
      </a>
    </td>
    
    <td>
      <code>
        evlog/sveltekit
      </code>
    </td>
    
    <td>
      Hooks
    </td>
    
    <td>
      <code>
        event.locals.log
      </code>
      
       / <code>
        useLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/nitro">
        Nitro
      </a>
    </td>
    
    <td>
      <code>
        evlog/nitro
      </code>
    </td>
    
    <td>
      Module
    </td>
    
    <td>
      <code>
        useLogger(event)
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/tanstack-start">
        TanStack Start
      </a>
    </td>
    
    <td>
      <code>
        evlog/nitro/v3
      </code>
    </td>
    
    <td>
      Module
    </td>
    
    <td>
      <code>
        useRequest().context.log
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/tanstack-start">
        TanStack Router
      </a>
    </td>
    
    <td>
      <code>
        evlog/nitro/v3
      </code>
    </td>
    
    <td>
      Module
    </td>
    
    <td>
      Via TanStack Start (uses Nitro v3)
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/react-router">
        React Router
      </a>
    </td>
    
    <td>
      <code>
        evlog/react-router
      </code>
    </td>
    
    <td>
      Middleware
    </td>
    
    <td>
      <code>
        context.get(loggerContext)
      </code>
      
       / <code>
        useLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/nestjs">
        NestJS
      </a>
    </td>
    
    <td>
      <code>
        evlog/nestjs
      </code>
    </td>
    
    <td>
      Module
    </td>
    
    <td>
      <code>
        useLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/express">
        Express
      </a>
    </td>
    
    <td>
      <code>
        evlog/express
      </code>
    </td>
    
    <td>
      Middleware
    </td>
    
    <td>
      <code>
        req.log
      </code>
      
       / <code>
        useLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/hono">
        Hono
      </a>
    </td>
    
    <td>
      <code>
        evlog/hono
      </code>
    </td>
    
    <td>
      Middleware
    </td>
    
    <td>
      <code>
        c.get('log')
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/fastify">
        Fastify
      </a>
    </td>
    
    <td>
      <code>
        evlog/fastify
      </code>
    </td>
    
    <td>
      Plugin
    </td>
    
    <td>
      <code>
        request.log
      </code>
      
       / <code>
        useLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/elysia">
        Elysia
      </a>
    </td>
    
    <td>
      <code>
        evlog/elysia
      </code>
    </td>
    
    <td>
      Plugin
    </td>
    
    <td>
      <code>
        log
      </code>
      
       (context) / <code>
        useLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/cloudflare-workers">
        Cloudflare Workers
      </a>
    </td>
    
    <td>
      <code>
        evlog/workers
      </code>
    </td>
    
    <td>
      Factory
    </td>
    
    <td>
      <code>
        createWorkersLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/standalone">
        Standalone
      </a>
    </td>
    
    <td>
      <code>
        evlog
      </code>
    </td>
    
    <td>
      Manual
    </td>
    
    <td>
      <code>
        createLogger()
      </code>
      
       / <code>
        createRequestLogger()
      </code>
    </td>
    
    <td>
      Stable
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/astro">
        Astro
      </a>
    </td>
    
    <td>
      <code>
        evlog
      </code>
    </td>
    
    <td>
      Manual
    </td>
    
    <td>
      <code>
        createRequestLogger()
      </code>
    </td>
    
    <td>
      Guide
    </td>
  </tr>
  
  <tr>
    <td>
      <a href="/frameworks/custom-integration">
        Custom
      </a>
    </td>
    
    <td>
      <code>
        evlog/toolkit
      </code>
    </td>
    
    <td>
      Build your own
    </td>
    
    <td>
      <code>
        createMiddlewareLogger()
      </code>
    </td>
    
    <td>
      Beta
    </td>
  </tr>
</tbody>
</table>

## Full-Stack Frameworks

<card-group>
<card color="neutral" icon="i-simple-icons-nuxtdotjs" title="Nuxt" to="/frameworks/nuxt">

Auto-imported `useLogger`, `createError`, and `parseError`. Zero config.

</card>

<card color="neutral" icon="i-simple-icons-nextdotjs" title="Next.js" to="/frameworks/nextjs">

`createEvlog()` factory with `withEvlog()` handler wrapper and client provider.

</card>

<card color="neutral" icon="i-simple-icons-svelte" title="SvelteKit" to="/frameworks/sveltekit">

Handle and handleError hooks with request-scoped logger on `event.locals.log`.

</card>

<card color="neutral" icon="i-custom-nitro" title="Nitro" to="/frameworks/nitro">

Module for both Nitro v2 and v3 with plugin-based drain and enrichment hooks.

</card>

<card color="neutral" icon="i-custom-tanstack" title="TanStack Start" to="/frameworks/tanstack-start">

Uses Nitro v3 module with async context for seamless logging in server functions. Also covers TanStack Router (full-stack mode).

</card>

<card color="neutral" icon="i-simple-icons-reactrouter" title="React Router" to="/frameworks/react-router">

Middleware with `context.get(loggerContext)` and `useLogger()` for loaders and services.

</card>

<card color="neutral" icon="i-simple-icons-nestjs" title="NestJS" to="/frameworks/nestjs">

`EvlogModule.forRoot()` with global middleware, exception filter, and async config.

</card>
</card-group>

## Server Frameworks

<card-group>
<card color="neutral" icon="i-simple-icons-express" title="Express" to="/frameworks/express">

Middleware with `req.log` and 4-argument error handler.

</card>

<card color="neutral" icon="i-simple-icons-hono" title="Hono" to="/frameworks/hono">

Middleware with typed `c.get('log')` via `EvlogVariables`.

</card>

<card color="neutral" icon="i-simple-icons-fastify" title="Fastify" to="/frameworks/fastify">

Plugin with `request.log` that shadows Fastify's built-in pino logger.

</card>

<card color="neutral" icon="i-custom-elysia" title="Elysia" to="/frameworks/elysia">

Plugin with `log` in route context via Elysia's `derive`.

</card>

<card color="neutral" icon="i-simple-icons-cloudflare" title="Cloudflare Workers" to="/frameworks/cloudflare-workers">

Factory for creating request-scoped loggers with Cloudflare-specific context.

</card>

<card color="neutral" icon="i-simple-icons-typescript" title="Standalone" to="/frameworks/standalone">

For scripts, CLI tools, queues, and any TypeScript process.

</card>

<card color="neutral" icon="i-lucide-puzzle" title="Custom Integration" to="/frameworks/custom-integration">

Build your own middleware with the evlog toolkit API.

</card>
</card-group>

<callout color="info" icon="i-lucide-info">

All frameworks support the same features: [wide events](/core-concepts/wide-events), [structured errors](/core-concepts/structured-errors), [drain adapters](/adapters/overview), [enrichers](/enrichers/overview), [sampling](/core-concepts/best-practices), and [AI SDK integration](/core-concepts/ai-sdk).

</callout>

## Vite Plugin

For any Vite-based project, the [`evlog/vite` plugin](/core-concepts/vite-plugin) adds build-time optimizations:

- **Auto-initialization** — no `initLogger()` call needed
- **Debug stripping** — `log.debug()` removed from production builds
- **Source location** — inject `__source: 'file:line'` into log calls

Works with SvelteKit, Hono (via vite-node), and any Vite-powered setup. Nuxt users get these features via the `evlog/nuxt` module options.

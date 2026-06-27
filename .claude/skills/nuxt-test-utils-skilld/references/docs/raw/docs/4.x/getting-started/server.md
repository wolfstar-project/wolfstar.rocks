# Server

> Build full-stack applications with Nuxt's server framework. You can fetch data from your database or another server, create APIs, or even generate static server-side content like a sitemap or a RSS feed - all from a single codebase.

<read-more to="/docs/4.x/directory-structure/server">



</read-more>

## Powered by Nitro

![Server engine](/assets/docs/getting-started/server.svg)

Nuxt's server is Nitro. It was originally created for Nuxt but is now part of UnJS and open for other frameworks - and can even be used on its own.

Using Nitro gives Nuxt superpowers:

- Full control of the server-side part of your app
- Universal deployment on any provider (many zero-config)
- Hybrid rendering

Nitro is internally using h3, a minimal H(TTP) framework built for high performance and portability.

<video-accordion title="Watch a video from Alexander Lichter to understand the responsibilities of Nuxt and Nitro in your application" video-id="DkvgJa-X31k">



</video-accordion>

## Server Endpoints & Middleware

You can easily manage the server-only part of your Nuxt app, from API endpoints to middleware.

Both endpoints and middleware can be defined like this:

```ts [server/api/test.ts]twoslash
export default defineEventHandler(async (event) => {
  // ... Do whatever you want here
})
```

And you can directly return `text`, `json`, `html` or even a `stream`.

Out-of-the-box, it supports **hot module replacement** and **auto-import** like the other parts of your Nuxt application.

<read-more to="/docs/4.x/directory-structure/server">



</read-more>

## Universal Deployment

Nitro offers the ability to deploy your Nuxt app anywhere, from a bare metal server to the edge network, with a start time of just a few milliseconds. That's fast!

<read-more to="/blog/nuxt-on-the-edge">



</read-more>

There are more than 15 presets to build your Nuxt app for different cloud providers and servers, including:

- Cloudflare Workers
- Netlify Functions
- Vercel Cloud

Or for other runtimes:

<card-group>
<card icon="i-logos-deno" target="_blank" title="Deno" to="https://deno.com">



</card>

<card icon="i-logos-bun" target="_blank" title="Bun" to="https://bun.com">



</card>
</card-group>

<read-more to="/docs/4.x/getting-started/deployment">



</read-more>

## Hybrid Rendering

Nitro has a powerful feature called `routeRules` which allows you to define a set of rules to customize how each route of your Nuxt app is rendered (and more).

```ts [nuxt.config.ts]twoslash
export default defineNuxtConfig({
  routeRules: {
    // Generated at build time for SEO purpose
    '/': { prerender: true },
    // Cached for 1 hour
    '/api/*': { cache: { maxAge: 60 * 60 } },
    // Redirection to avoid 404
    '/old-page': {
      redirect: { to: '/new-page', statusCode: 302 },
    },
    // ...
  },
})
```

<read-more to="/docs/4.x/guide/concepts/rendering#hybrid-rendering">

Learn about all available route rules are available to customize the rendering mode of your routes.

</read-more>

In addition, there are some route rules (for example, `ssr`, `appMiddleware`, and `noScripts`) that are Nuxt specific to change the behavior when rendering your pages to HTML.

Some route rules (`appMiddleware`, `redirect` and `prerender`) also affect client-side behavior.

Nitro is used to build the app for server side rendering, as well as pre-rendering.

<read-more to="/docs/4.x/guide/concepts/rendering">



</read-more>

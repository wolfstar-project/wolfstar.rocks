---
number: 8105
title: Next.js Turbopack Support
type: other
state: closed
created: 2023-05-11
url: "https://github.com/getsentry/sentry-javascript/issues/8105"
reactions: 244
comments: 92
labels: "[Improvement, Next.js, Tracking Issue]"
---

# Next.js Turbopack Support

>  This original post has been edited by @lforst to reflect the current status of Turbopack Support 
> [!IMPORTANT]
> This issue is tracking progress on Turbopack Support. **If you find bugs or problems with the Sentry SDK in combination with Turbopack please open a separate issue**. Thank you!
## Problem Statement
Sentry should work in combination with Turbopack with all of its features.
## Current Status (Last Update May 5, 2025)
| Feature | Support | Notes |
|---|:---:|---|
| Next.js app compiles and runs without issues |  | |
| Server-side instrumentation |  | |
| Client-side instrumentation |  | - Upgrade to SDK version `9.9.0` or greater<br>- Upgrade to Next.js canary `15.3.0-canary.8` or greater<br>- Add `instrumentation-client.ts` file with `Sentry.init()` call. (`sentry.client.config.ts` can be replaced with `instrumentation-client.ts`. It serves the same purpose.) |
| Release Injection |  | - Upgrade SDK to version `9.11.0` |
| Source Maps |  | - Needs `runAfterProductionCompile` hook implemented in Next.js (done in Next.js `15.4.0-canary.19`)<br>- Needs way to inject debug IDs into bundles implemented in Next.js |
| React Component Name Annotations |  | - Needs way to transform code in Next.js<br>- Will likely not be possible for the forseeable future |

---

## Top Comments

**@lforst** (+23):

I would love to get rid of the Sentry SDK's dependency on build tooling (i.e. Webpack and Turbopack) entirely. The reason we need to rely on Webpack at the moment is that Next.js lacks options to instrument Next.js apps. Webpack was the next entry point higher up in the chain of abstraction that allowed the SDK to do the stuff it needed to do.

Newer versions of Next.js already have the `instrumentation.ts` hook and OTEL support. This is very good. The only thing we lack now is a central hook that reports all errors inside a Next.js application (with metadata (!), eg. what route the error wa...

**@fromthemills** (+15):

For people looking to use turbo locally you can only use `withSentryConfig` when building.

```js
/** @type {import('next').NextConfig} */
let nextConfig = {}

if (process.env.NODE_ENV === 'production') {
    const { withSentryConfig } = await import('@sentry/nextjs')
    nextConfig = withSentryConfig(nextConfig, {})
}

export default nextConfig
``` 

**@smeubank** (+21):

> any news on this?

Fwiw I would also encourage you to upvote and comment on this issue which wr could also use to provide support similar to webpack, vite, esbuild and rollup


https://github.com/unjs/unplugin/issues/302

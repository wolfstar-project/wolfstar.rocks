---
number: 481
title: "Tailwind CSS v4: `No loadModule function provided to compile` error"
type: other
state: closed
created: 2026-02-14
url: "https://github.com/nuxt-modules/og-image/issues/481"
reactions: 1
comments: 0
---

# Tailwind CSS v4: `No loadModule function provided to compile` error

### Environment

- **nuxt-og-image**: 6.0.0-beta.29
- **tailwindcss**: 4.1.18
- **nuxt**: 4.3.1
- **Deployment**: Cloudflare Workers

### Describe the bug

During build, the following errors appear:

```
[warn] [@nuxtjs/og-image] CSS metadata extraction failed: No `loadModule` function provided to `compile`
[error] [unhandledRejection] No `loadModule` function provided to `compile`
  at Ya (node_modules/tailwindcss/dist/chunk-CT46QCH7.mjs:32:1889)
  ...
  at async node_modules/nuxt-og-image/dist/chunks/tw4.mjs:138:22
```

### Root Cause

In `tw4.ts`, the `compile()` function is called with only `loadStylesheet`:

...
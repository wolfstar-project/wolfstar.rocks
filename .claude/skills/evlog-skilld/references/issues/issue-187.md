---
number: 187
title: "[feature] Next.js: instrumentation.ts support"
type: feature
state: open
created: 2026-03-15
url: "https://github.com/HugoRCD/evlog/issues/187"
reactions: 0
comments: 2
labels: "[enhancement]"
---

# [feature] Next.js: instrumentation.ts support

### Description

Hey! I recently added evlog in a side project - it was great, the wide events approach is great

One thing I ran into: there's no way to integrate with Next.js's instrumentation.ts. This file is how Next exposes two server-level hooks:

- `register()`: runs once at server startup, before any requests
- `onRequestError()`: called on every unhandled error across all routes, including SSR pages, RSC and middleware (now is proxy)

Right now `withEvlog()` only covers route handlers you explicitly wrap. Errors that happen outside that scope (SSR rendering failures, RSC errors, middleware crashes) are invisible to evlog -> never hit the drain

I ended up wiring this up manually in my project:

...
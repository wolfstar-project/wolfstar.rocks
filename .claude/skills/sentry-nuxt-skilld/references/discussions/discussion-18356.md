---
number: 18356
title: Tanstack Start deployed to Vercel integration
category: "Q&A"
created: 2025-11-29
url: "https://github.com/getsentry/sentry-javascript/discussions/18356"
upvotes: 1
comments: 2
answered: true
---

# Tanstack Start deployed to Vercel integration

Hey I'm not getting any server logs in my Tanstack Start deployed to Vercel. I've tried following the tutorial and setting NODE_OPTIONS but then then i found in other framework docs that Vercel doesn't support NODE_OPTIONS so I needed to import the instrument file directly in the server entry point:

`src/server.ts`
```ts
import 'instrument.server.mjs'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request)
  },
})
```

Despite this I'm still not getting any logs from my server functions. I think we need to update the docs as well for this.

---

## Accepted Answer

**@nicohrubec** [maintainer]:

Thanks for providing the instrumentation file. You are definitely missing `enableLogs: true` in your init to enable the logs feature. For more information you can have a look at the logs setup page.

Our Tanstack Start SDK is in alpha and still very much a work in progress. We are working closely with Tanstack maintainers to improve support. Server-side error monitoring is of course very high on our priority list. You can check out the Tanstack Start SDK tracking issue to follow progress.
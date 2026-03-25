---
number: 16571
title: "Next.js: How to export onRouterTransitionStart from instrumentation-client in case of tree-shaking?"
category: "Q&A"
created: 2025-06-12
url: "https://github.com/getsentry/sentry-javascript/discussions/16571"
upvotes: 2
comments: 1
answered: false
---

# Next.js: How to export onRouterTransitionStart from instrumentation-client in case of tree-shaking?

https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/ has no information regarding exporting the `captureRouterTransitionStart` in case of tree-shaking

Also file is called main.js not `instrumentation-client.ts` (js) - why?

Should it be like this? Not clear

```
import { captureRouterTransitionStart } from "@sentry/nextjs";

// ...

export const onRouterTransitionStart = captureRouterTransitionStart;
```

---

## Top Comments

**@mydea** [maintainer]:

What exactly is the problem? If you do not use this function it should not be included anyhow, no need to manually tree-shake anything?
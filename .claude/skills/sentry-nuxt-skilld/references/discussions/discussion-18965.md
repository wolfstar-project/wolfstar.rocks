---
number: 18965
title: How to confirm that manual tree shaking variables are taking full effect?
category: "Q&A"
created: 2026-01-24
url: "https://github.com/getsentry/sentry-javascript/discussions/18965"
upvotes: 1
comments: 0
answered: false
---

# How to confirm that manual tree shaking variables are taking full effect?

I recently came across this page that talks about tree shaking in Sentry:
https://docs.sentry.io/platforms/javascript/configuration/tree-shaking/

I'm using Webpack with Sentry 8.55.0 and I tried to set the recommended variables in my build, as it shows on the page:

```plugins: [
    new webpack.DefinePlugin({
      __SENTRY_DEBUG__: false,
      __SENTRY_TRACING__: false,
      __RRWEB_EXCLUDE_IFRAME__: true,
      __RRWEB_EXCLUDE_SHADOW_DOM__: true,
      __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
    }),
    // ... other plugins
```
But I don't see almost any difference in the build output.  What should I look for to validate that these variables are taking effect?  Should entire internal Sentry modules get removed from the build?

One thing I should mention is that I've ...
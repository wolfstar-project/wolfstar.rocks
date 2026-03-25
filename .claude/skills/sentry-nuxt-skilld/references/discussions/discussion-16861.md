---
number: 16861
title: "setting up `@sentry/nextjs` with `@vercel/otel`"
category: "Q&A"
created: 2025-07-09
url: "https://github.com/getsentry/sentry-javascript/discussions/16861"
upvotes: 3
comments: 1
answered: false
---

# setting up `@sentry/nextjs` with `@vercel/otel`

could anybody share an example setup combining `@sentry/nextjs` with a opentelemetry collector config as described in the nextjs docs. thanks!

---

## Top Comments

**@mydea** [maintainer] (+1):

Hey, as of now you need to follow our docs on this here: https://docs.sentry.io/platforms/javascript/guides/nextjs/opentelemetry/custom-setup/ or e.g. here: https://docs.sentry.io/platforms/javascript/guides/nextjs/opentelemetry/using-opentelemetry-apis/#adding-additional-span-processors

If all you want is to also export traces to some other place, you can add a custom span processor to the sentry setup.
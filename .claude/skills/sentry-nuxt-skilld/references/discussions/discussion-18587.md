---
number: 18587
title: How to use captureException in Nuxt on Cloudflare
category: "Q&A"
created: 2025-12-19
url: "https://github.com/getsentry/sentry-javascript/discussions/18587"
upvotes: 1
comments: 2
answered: true
---

# How to use captureException in Nuxt on Cloudflare

Very happy with the Cloudflare Nitro plugin as introduced in https://github.com/getsentry/sentry-javascript/pull/15597, that captures unhandled errors 

But I'm not clear on how we can use Sentry.captureException (or other methods for that matter)... The docs show this example, but that will not work

```ts
import * as Sentry from "@sentry/nuxt";
try {
  aFunctionThatMightFail();
} catch (err) {
  Sentry.captureException(err);
}
```

Ive tried this approach but with explicitly initializing sentry, but that does not work either, at least not is a cloudfalre environment (it does work on node)

...

---

## Accepted Answer

**@s1gr1d** [maintainer]:

I created a minimal reproduction here (it's very minimal, I'm not using a lot of settings here): https://github.com/s1gr1d/nuxt-cloudflare-18587
Maybe you can use this as a base for your reproduction. However, `captureException` works in this case.

And regarding `useSentry()`: Is there a specific reason you want to use it like this and not with a regular import from `@sentry/nuxt`?
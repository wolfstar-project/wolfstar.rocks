---
number: 16758
title: Setup for Remix with custom express server
category: "Q&A"
created: 2025-06-27
url: "https://github.com/getsentry/sentry-javascript/discussions/16758"
upvotes: 2
comments: 1
answered: false
---

# Setup for Remix with custom express server

What's the ideal setup for Sentry within a remix app with a custom express server? I am using `"@sentry/remix": "9.24.0"` and `"@sentry/node": "9.24.0"`

# Original setup
Before I had the custom express server, I had the `@sentry/remix` package set up in both `entry.client` and `entry.server` which seemed to work well.

# New setup
Now that I have the custom express server, I want to have Sentry still catch errors from custom middleware or other things generated within the express server. I added a `instrument.ts` file with a `Sentry.init` from `@sentry/node` and changed my `start` script in `package.json` to `npx tsx --import server/utils/instrument.ts server/index.ts",`. I also added `Sentry.setupExpressErrorHandler(app);` to the end of my server index file. 

This seems correct ...

---

## Top Comments

**@mydea** [maintainer]:

hey, can you clarify what did not work with the regular remix setup you had (in entry.server) once you started to use a custom express server? Were express errors/middlewares not captured?
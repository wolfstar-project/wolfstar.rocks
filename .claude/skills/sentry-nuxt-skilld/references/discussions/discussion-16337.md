---
number: 16337
title: How to opt out of error reporting while keeping tracing?
category: "Q&A"
created: 2025-05-20
url: "https://github.com/getsentry/sentry-javascript/discussions/16337"
upvotes: 1
comments: 1
answered: true
---

# How to opt out of error reporting while keeping tracing?

 I’m having a difficult time figuring from the JS sdk docs if it’s possible to disable Sentry’s error reporting functionality while keeping tracing functionality. Is this possible?

---

## Accepted Answer

**@mydea** [maintainer]:

Hey, you can set `sampleRate: 0` to not capture any errors - is this good enough for what you want to achieve?
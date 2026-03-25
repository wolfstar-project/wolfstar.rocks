---
number: 16188
title: Why is my code getting instrumented?
category: "Q&A"
created: 2025-05-02
url: "https://github.com/getsentry/sentry-javascript/discussions/16188"
upvotes: 4
comments: 1
answered: false
---

# Why is my code getting instrumented?

We are debugging performance issues that suddenly appeared in production, and I was surprised to see `@opentelemetry/instrumentation-pg` in our stack trace.

...

---

## Top Comments

**@gajus**:

Turns out `skipOtenTelemetrySetup` is super misleading because the individual integrations (like Postgres) will still initialize the associated OTEL plugins.

This is how we fixed it:

...
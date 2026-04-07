---
number: 19116
title: "Does `gen_ai.usage.input_tokens` from Vercel AI instrumentation include cached tokens?"
category: "Q&A"
created: 2026-02-02
url: "https://github.com/getsentry/sentry-javascript/discussions/19116"
upvotes: 1
comments: 0
answered: false
---

# Does `gen_ai.usage.input_tokens` from Vercel AI instrumentation include cached tokens?

Since `@sentry/node` `10.35.0`, we saw the `input_tokens` on the usage field change dramatically. We're uncertain if it includes cached input tokens or not in the dashboard. Anyone know if it does and if there's a way to independently get uncached input token count? Thanks!
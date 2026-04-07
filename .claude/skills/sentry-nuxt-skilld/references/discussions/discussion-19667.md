---
number: 19667
title: What could be performance impact with Sentry on Cloudflare Workers?
category: "Q&A"
created: 2026-03-06
url: "https://github.com/getsentry/sentry-javascript/discussions/19667"
upvotes: 1
comments: 0
answered: false
---

# What could be performance impact with Sentry on Cloudflare Workers?

The worker should return the result to the client as soon as possible, and logging/tracing can increase response time. But how does Sentry work in that case? Will it run all the logic within the main request context, and the response will be delayed, or delay requests to Sentry inside `waitUntil`, for example?
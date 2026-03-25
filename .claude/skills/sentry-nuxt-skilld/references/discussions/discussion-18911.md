---
number: 18911
title: "How do you use @sentry/cloudflare with Custom Managed Components?"
category: "Q&A"
created: 2026-01-20
url: "https://github.com/getsentry/sentry-javascript/discussions/18911"
upvotes: 1
comments: 0
answered: false
---

# How do you use @sentry/cloudflare with Custom Managed Components?

I'm excited that Sentry now has an official Cloudflare Workers integration from #13007. I see there is support for various parts of the Cloudflare ecosystem, but didn't see any suggestions for using with a Custom Managed Component - used with Cloudflare Zaraz.

The tricky part here is that you essentially build a specialized worker via managed-component-to-cloudflare-worker. Your code exports a special handler, rather than the `fetch` that `withSentry` would typically instrument. Since you don't have access to `fetch`, it seems like you can't follow the typical integration pattern.

**I'm looking for any suggestions or guidance, but ...
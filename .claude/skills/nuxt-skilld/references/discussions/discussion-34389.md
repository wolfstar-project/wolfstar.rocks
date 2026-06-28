---
number: 34389
title: Runing plugin with $fetch serverside - crashes app under load
category: Questions
created: 2026-02-25
url: "https://github.com/nuxt/nuxt/discussions/34389"
upvotes: 1
comments: 2
answered: true
---

# Runing plugin with $fetch serverside - crashes app under load

Hello,

I encountered an issue while using a server-side plugin in Nuxt, and I would like to share my experience in hopes that someone can help clarify what might be wrong.

I implemented a `fetchAdsConfig.server.ts` plugin with the intention of fetching data from APIs on the server side and populating the store before the page is created. The goal was to ensure that the store is fully prepared with the required data when the page is rendered and loaded.

Based on my understanding, a `.server.ts` plugin should run on the server before the page is created. I initially assumed that it would execute once during the server-side rendering process.

However, after implementing this solution, our application began crashing under load. The errors suggest that something in this approach may...

---

## Accepted Answer

I'm typing from mobile, so forgive any typos.

`.server.ts` plugins run once per SSR request, not once on server start.

The `isFetching` flag (from your initial implementation) is shared across all concurrent requests in the same Node.js process (you set it as a module scope). Request A sets it to true, requests B–N skip the fetch entirely, and render with an empty store. I think this may cause an SSR race condition.

For the max stack error, could it be that your store's reactive proxy is wrapping deeply nested data?

By the way, are you using Nuxt's server api?
If yes, I'll recommend you delegate external calls to a server route so that you can cache the response, then simplify your composable to just retrieve the data. This way, your external api calls are not hammered on every request. 

This is hypothetically how I'd do it (I haven't tested this code), but I think a repro from you would have been more helpful too.

...
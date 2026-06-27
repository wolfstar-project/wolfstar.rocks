---
number: 809
title: "`msw`: No known conditions for \"./browser\" specifier in \"msw\" package.."
category: "Q&A"
created: 2024-04-07
url: "https://github.com/nuxt/test-utils/discussions/809"
upvotes: 2
comments: 0
answered: false
---

# `msw`: No known conditions for "./browser" specifier in "msw" package..

Hey guys! Did anyone try to setup msw to mock api? I'm setting it up inside `plugins`:

```ts
// ~/plugins/msw.ts

export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.server) {
    console.log('setting up msw server...')
    const server = (await import('~/mocks/node')).server
    server.listen()
    console.log('msw server listening...')
  }
  if (import.meta.client) {
    console.log('setting up msw worker...')
    const { worker } = await import('~/mocks/browser')
    await worker.start()
    console.log('msw worker started...')
  }
})
```

**In `dev` enviroment (`npm run dev`) it works just fine*. I'm receiving mocked data without a problem on the server and on the client (when navigating between the routes)

But it doesn't...
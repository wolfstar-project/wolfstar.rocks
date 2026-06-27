---
number: 862
title: Testing code inside onNuxtReady callback
category: "Q&A"
created: 2024-05-31
url: "https://github.com/nuxt/test-utils/discussions/862"
upvotes: 1
comments: 1
answered: true
---

# Testing code inside onNuxtReady callback

Hi, I have a component which is loading some data in a Pinia store (via an API call) and I need it to run on the client side, so I put the call inside `onNuxtReady`. The functionality works as I expect, but now I'm trying to write tests for it and I've run into an unexpected issue.

It seems that the `onNuxtReady` callback is only being run _after_ the test suite has finished running. I've managed to work around it by putting my `expect()` assertions inside a `setTimeout()` callback, which seems to run after `onNuxtReady`, but this has some drawbacks because it only runs after _all_ the tests have run and the spies aren't reset properly. I've prepared a minimal reproduction of the situation here: https://stackblitz.com/edit/nuxt-starter-bkcq7q?file=app.nuxt.test.ts&file=app.vue&view=edit...

---

## Accepted Answer

Ah, I tried asking ChatGPT, and while it didn't give me a useful answer, it pointed me in the right direction of mocking the `onNuxtReady` function itself. Just putting this modification of my reproduction here in case anyone else encounters the same issue: https://stackblitz.com/edit/nuxt-starter-haepuw?file=app.nuxt.test.ts&view=editor
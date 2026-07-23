---
number: 1446
title: Why test with setup nuxt is so slow and start many server and get error
category: "Q&A"
created: 2025-10-15
url: "https://github.com/nuxt/test-utils/discussions/1446"
upvotes: 1
comments: 0
answered: false
---

# Why test with setup nuxt is so slow and start many server and get error

I have a test dire like this:

test/nuxt/server
* test1
* test2
i want to test the api

and when run vitest is very slow on setup.

`Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "planeat_manager", schema "public" at "localhost:33052"

  Your database is now in sync with your Prisma schema. Done in 1.49s

Listening on http://127.0.0.1:55593
[error] [nuxt] error caught during app initialization Context conflict
  at checkConflict (node_modules/unctx/dist/index.mjs:6:13)
  at Object.set (node_modules/unctx/dist/index.mjs:40:9)
  at callWithNuxt (node_modules/nuxt/dist/app/nuxt.js:221:16)
  at node_modules/nuxt/dist/app/nuxt.js:38:41
  at EffectScope.run (node_modules/@vue/reactivity/dist/react...
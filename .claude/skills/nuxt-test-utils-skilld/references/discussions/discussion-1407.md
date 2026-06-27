---
number: 1407
title: Correct Vitest environment for server tests
category: "Q&A"
created: 2025-09-07
url: "https://github.com/nuxt/test-utils/discussions/1407"
upvotes: 1
comments: 1
answered: true
---

# Correct Vitest environment for server tests

I just found out about test-utils' support for Vitest projects from the updated testing setup documentation at https://nuxt.com/docs/4.x/getting-started/testing#setup. The sample test organisation structure only covers stuff inside the `app` folder of Nuxt, where components and composables should be run in the `nuxt` environment, and utils tests should be run in the `node` environment. If we have server tests, should these be run inside the `nuxt` or `node` environment? Or is there a `nitro` environment or something similar that we should use?

Note, I consider end-to-end tests separate from all of these, as they test the application as a whole, and should assume no knowledge of the application internals, so a `no...

---

## Accepted Answer

Hi @benedictleejh, 

For anything in your `server/` dir, you'll want the `nuxt` environment. The `node` env is totally separate, knows nothing about Nuxt/Nitro. It's just for plain utils. And nope, there's no separate `nitro` env, as far as I know. It's all part of the `nuxt` one.

I usually structure it like this:
```bash
test/
├── nuxt/
│   └── server/
│       └── my-api.spec.ts   # <-- 'nuxt' env
└── unit/
    └── some-util.spec.ts  # <-- 'node' env
```

So for testing an API route, you can just do:

```ts
// test/nuxt/server/my-api.spec.ts
import { describe, it, expect } from 'vitest'

it('works', async () => {
  const result = await $fetch('/api/my-route')
  expect(result).toBeDefined()
})
```

Basically, if the code needs any Nuxt magic (auto-imports, composables, etc.), it needs the `nuxt` env.
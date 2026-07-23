---
number: 909
title: "\"setup\" is not exported by \"node_modules/unenv/runtime/mock/proxy.mjs\""
category: "Q&A"
created: 2024-08-05
url: "https://github.com/nuxt/test-utils/discussions/909"
upvotes: 1
comments: 3
answered: false
---

# "setup" is not exported by "node_modules/unenv/runtime/mock/proxy.mjs"

I have the following Nuxt 3 server api test, sat alongside the endpoint file:

```
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('signed-url.post', async () => {
  await setup()

  it('should return signed upload url', async () => {
    const response = await fetch('/api/file/v1/signed-url', {
      method: 'POST',
      body: JSON.stringify({
        category: 'profile',
        name: 'test.jpg',
        sizeBytes: 1000,
        mimeType: 'image/jpeg'
      })
    })
 ```
 
 and the following vitest config:
 
 ```
 import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    include: ['./**/*.test.ts'],
    exclude: [
      './node_modules',
      './dist',
      './automation',
      './.wrangler',
      './.nuxt',
      './coverage',
      './playwright-report',
      './tests/e2e',
      './**/*.e2e.spec.ts'
    ]
  }
})
```...

---

## Top Comments

**@dosubot** (+2):


Hey there, @alexcroox! I'm here to assist you with any bugs, questions, or contributions you have. Let's dive in and see how I can help you out!


The error you're encountering is due to the `setup` function not being exported correctly from the `@nuxt/test-utils/e2e` module. To resolve this, you should move the `await setup()` call outside of the `describe` block. Here is the corrected version of your test file:

```typescript
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
  dev: true,
})

...

**@alexcroox** (+1):

Afraid not, I gave up trying to unit test the server side of Nuxt a while ago :(

**@paambaati**:

@alexcroox Were you able to get this working? I'm stuck with this same issue and nothing has worked so far.
---
number: 9232
title: "Why using JSON.stringify({}) syntax as a workaround?"
category: "Q&A"
created: 2025-12-11
url: "https://github.com/vitest-dev/vitest/discussions/9232"
upvotes: 1
comments: 1
answered: true
---

# Why using JSON.stringify({}) syntax as a workaround?

About this one: Vitest Browser Mode 2.1.4 regression: `ReferenceError: process is not defined` #6872. Unfortunately, that 'conversation has been locked and limited to collaborators.' Thus asking here.

The suggested workaround is to add the following to your `vitest.config.js`/`.ts`:

```js
export default mergeConfig(
  viteConfig,
  defineConfig({
    define: {
      'process.env': JSON.stringify({}),
    },
  }),
)
```

Why are we using `JSON.stringify({})` here? Looks needlessly complex. Am I missing something? Can't it be simply written as `"{}"`?

@hi-ogawa

---

## Accepted Answer

**@hi-ogawa** [maintainer]:

> Can't it be simply written as `"{}"`?

Yes. `define: { someKey: JSON.stringify(someValue) }` is sort of a convention about "define" feature in general, so that's why I wrote it so. https://vite.dev/config/shared-options#define
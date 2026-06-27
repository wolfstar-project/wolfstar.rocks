---
number: 1040
title: Nuxt 3 unit testing is a hassle
category: "Q&A"
created: 2024-12-11
url: "https://github.com/nuxt/test-utils/discussions/1040"
upvotes: 2
comments: 0
answered: false
---

# Nuxt 3 unit testing is a hassle

My Problem with nuxt 3 test utils are mainly mocks.

I want to test my reposutory as a basic example.
There is nothing special, its like an composable, which auto imports an other composable "useHttpClient".

As outlined in the docs, I tried it with mockNuxtImport. But with that I get the error, that the composable import was not found. But actually it its in the .nuxt/imports.d.ts
https://nuxt.com/docs/getting-started/testing#mocknuxtimport

also mockNuxtImport lacks of using the real import functionality like 
```
vi.mock(import('./path/to/module.js'), async (importOriginal) => {
  const mod = await importOriginal() // type is inferred
  return {
    ...mod,
    // replace some exports
    total: vi.fn(),
  }
})
```

I also tried it with basic vitest vi mocks. there t...
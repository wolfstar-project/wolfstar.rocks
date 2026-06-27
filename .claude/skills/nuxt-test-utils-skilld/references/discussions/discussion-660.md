---
number: 660
title: mockNuxtImport modify original
category: "Q&A"
created: 2023-12-19
url: "https://github.com/nuxt/test-utils/discussions/660"
upvotes: 3
comments: 0
answered: false
---

# mockNuxtImport modify original

Using vi.mock (https://vitest.dev/api/vi.html#vi-mock) we still import the original module, modify it and return it. How would we go about doing that with mockNuxtImport?

I'm trying to do something like this. But currently it causes an infinite loop:
````

mockNuxtImport<typeof useMyComposable>('useMyComposable', () => {
  return () => useMyComposable('differentParam')
})

````
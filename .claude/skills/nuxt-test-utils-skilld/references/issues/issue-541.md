---
number: 541
title: "Expose mocks directly with `mockNuxtImport`"
type: feature
state: open
created: 2023-08-18
url: "https://github.com/nuxt/test-utils/issues/541"
reactions: 9
comments: 1
labels: "[enhancement, good first issue, vitest-environment]"
---

# Expose mocks directly with `mockNuxtImport`

Currently, it's possible to mock a Nuxt import:

```js
mockNuxtImport('useStorage', () => {
    return vi.fn()
})
```

When we want to access this mock in our test, to run an assertion or to change the implementation, we can use `vi.hoisted`:

```js
const { useStorageMock } = vi.hoisted(() => {
  return {
    useStorageMock: vi.fn()
  }
})

mockNuxtImport('useStorage', () => {
  return useStorageMock
})

// now we can change the implementation of useStorageMock between tests
```

This is a lot of code just to define and expose a single mock. Would it be possible to make mocking Nuxt imports easier by returning the mocks directly in `mockNuxtImport`? 

I propose something like this:

```js
const useStorageMock = mockNuxtImport('useStorage', () => {
    return vi.fn()
})

// now we can change the implementation of useStorageMock between tests
```

I'm down to have a look at this if this is possible.

---

## Top Comments

**@danielroe** [maintainer] (+4):

It seems this should be possible to implement in the same plugin that processes/handles `mockNuxtImport`.
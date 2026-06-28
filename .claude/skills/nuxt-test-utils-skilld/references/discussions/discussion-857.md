---
number: 857
title: MockNuxtImport huge module graph on vitest
category: "Q&A"
created: 2024-05-21
url: "https://github.com/nuxt/test-utils/discussions/857"
upvotes: 3
comments: 0
answered: false
---

# MockNuxtImport huge module graph on vitest

Hi, 
We have a big project here using layers and an internal component library (150+ components). When we use the helper `mockNuxtImport` our module graph on vitest explode.  We only mock two composables, but the module graph is huge, vitest ui struggles to render everything.

```
const { mockNavigateTo, mockUseRouter } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
  mockUseRouter: vi.fn(),
}));
mockNuxtImport('navigateTo', () => {
  return mockNavigateTo;
});

mockNuxtImport('useRouter', () => {
  return mockUseRouter;
});
```


If I change the `mockNuxtImport` to a `vi.mock` we have a smaller module graph. 
```
const { mockNavigateTo, mockUseRouter } = vi.hoisted(() => ({
  mockNavigateTo: vi.fn(),
  mockUseRouter: vi.fn(),
}));

vi.mock('#app/composables/router', () => {
  return {
    navigateTo: mockNavigateTo,
    useRouter: mockUseRouter,
  };
});
```...
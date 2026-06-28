---
number: 1580
title: "mockNuxtImport: `original` parameter typed as `string` when using string target"
type: other
state: closed
created: 2026-02-09
url: "https://github.com/nuxt/test-utils/issues/1580"
reactions: 0
comments: 1
---

# mockNuxtImport: `original` parameter typed as `string` when using string target

### Environment

- `@nuxt/test-utils`: v4.0.0
- `vitest`: ^4.0.18
- `typescript`: ~5.7.3

### Describe the bug

The v4.0.0 `(original)` factory parameter for `mockNuxtImport` has a type inference issue. When passing a string as the first argument (the documented and most common pattern), TypeScript infers `T = string` from the union `string | T`, making `original` typed as `string` instead of the actual function.

**Current signature** (`src/runtime-utils/mock.ts`):
```typescript
export function mockNuxtImport<T = unknown>(
  _target: string | T,
  _factory: (original: T) => T | Promise<T>,
): void
```

**What happens:**

...
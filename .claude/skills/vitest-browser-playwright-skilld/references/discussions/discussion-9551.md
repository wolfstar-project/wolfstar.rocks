---
number: 9551
title: "@nx/enforce-module-boundaries ESLint Rule"
category: "Q&A"
created: 2026-01-29
url: "https://github.com/vitest-dev/vitest/discussions/9551"
upvotes: 1
comments: 2
answered: true
---

# @nx/enforce-module-boundaries ESLint Rule

I am running into an Nx-specific issue where code following the below pattern, established in the `vitest` module mocking guide, is triggering the `@nx/enforce-module-boundaries` ESLint rule.

```javascript
import { expect, vi } from 'vitest'
import { answer } from './example.js'

vi.mock(import('./example.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    answer: vi.fn(originalModule.answer),
    variable: 'mock',
  }
})

expect(answer()).toBe(42)

expect(answer).toHaveBeenCalled()
expect(answer).toHaveReturned(42)
```

The error message from the rule is "Static imports of lazy-loaded libraries are forbidden." It would be triggered in the above example at the `import { answer...

---

## Accepted Answer

**@AriPerkkio** [maintainer]:

The `vi.mock(import('./example.js')` is just syntax sugar for typescript. You can write the same code without `import()` as:

```diff
- vi.mock(import('./example.js'), async (importOriginal) => {
-  const originalModule = await importOriginal()
+ vi.mock('./example.js', async (importOriginal) => {
+  const originalModule: typeof import('./example.js') = await importOriginal()
  return {
    answer: vi.fn(originalModule.answer),
    variable: 'mock',
  }
})
```

Though personally I would just disable that ESLint rule from any test files. 
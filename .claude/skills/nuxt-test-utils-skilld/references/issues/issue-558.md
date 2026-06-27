---
number: 558
title: useAsyncData in combination with --coverage (istanbul) causes syntax error
type: other
state: open
created: 2023-08-29
url: "https://github.com/nuxt/test-utils/issues/558"
reactions: 4
comments: 4
labels: "[vitest-environment]"
---

# useAsyncData in combination with --coverage (istanbul) causes syntax error

Error: ``SyntaxError: Expecting Unicode escape sequence \uXXXX (1:1)``

Happens when using the @vitest/coverage-istanbul coverage provider. V8 Does work (but i have never been able to create accurate coverage reports with that)

Even when using ``useLazyAsyncData`` or ``// useAsyncData ``

reproduction: https://stackblitz.com/edit/nuxt-starter-1ens2b 

run ``pnpm run test``

I hope I did this correctly, but for me it seems with latest version & latest nuxt you can reproduce this anywhere if you just add ``// useAsyncData`` I guess that is because of the auto imports. 

Stacktrace example: 

...

---

## Top Comments

**@rubennaatje** (+5):

My workaround for now to get past the CI checks is to make a wrapper composable 

```ts
import { AsyncDataOptions } from "nuxt/app";

export const useWrapperAsyncData = <T = any>(
  ...args: [string, () => Promise<T>, AsyncDataOptions<T>]
) => useAsyncData(...args);
```
Somehow this fixes my issue :/ 

Hope to find a real fix soon though!


**@rafadpedrosa** (+3):

Sorry for the long delay.

I hope we can give this issue more attention. Using @rubennaatje's solution seems to be the way to go for now, but it feels a bit weird to use it as a final solution.

Here is the project In case someone wants to see the error happening. 

In my opinion, this issue causes significant confusion, making it difficult to test the code and reducing confidence in the libraries/frameworks. If a company relies on testing as part of its workflow, it could face major setbacks because of this issue.


...

**@rafadpedrosa** (+1):

Do we have any updates, workarounds, or fixes planned? 

I'm facing the same error. 



I could make it fail with a small project. I'll push it tomorrow just in case someone wants an easy way to reproduce it  

@rubennaatje, I did not use any useAsyncData on my test project, do you have any other tips? 
---
number: 124
title: "Add detection for tests runners ? (Jest, Vitest, Playwright, etc...)"
type: other
state: open
created: 2024-03-18
url: "https://github.com/unjs/std-env/issues/124"
reactions: 0
comments: 0
---

# Add detection for tests runners ? (Jest, Vitest, Playwright, etc...)

### Describe the feature

Most test framework sets a couple of env variables that we could use to detect them.

We could have a similar API here to the provider detection : 

```ts
import { isTest, testRunner, testRunnerInfo } from "std-env";

console.log({
  isCI, // true
  provider, // "vitest"
  providerInfo, // { name: "vitest", isTest: true, ...etc }
});
```



### Additional information

- [X] Would you be willing to help implement this feature?
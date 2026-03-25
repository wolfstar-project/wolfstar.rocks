---
number: 9246
title: "How to make vitest exit non-zero, when there are hanging processes?"
category: "Q&A"
created: 2025-12-13
url: "https://github.com/vitest-dev/vitest/discussions/9246"
upvotes: 1
comments: 1
answered: true
---

# How to make vitest exit non-zero, when there are hanging processes?

I see that:

> close timed out after 10000ms
Tests closed successfully but something prevents the main process from exiting
You can try to identify the cause by enabling "hanging-process" reporter. See https://vitest.dev/config/#reporters

But vitest exists with `0`.

Is there a way to make it exit non-zero, if there are processes hanging?

I know, I could write a wrapper which checks the output, but this feels very ugly.

---

## Accepted Answer

**@AriPerkkio** [maintainer]:

Does this help?

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: [
      "default",
      {
        // undocumented internal reporter lifecycle
        onProcessTimeout() {
          process.exitCode = 1;
        },
      },
    ],
  },
});
```

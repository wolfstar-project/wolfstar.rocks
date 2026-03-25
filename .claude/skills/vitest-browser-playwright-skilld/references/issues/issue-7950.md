---
number: 7950
title: Error with server.deps.inline and coverage
type: bug
state: open
created: 2025-05-09
url: "https://github.com/vitest-dev/vitest/issues/7950"
reactions: 6
comments: 6
labels: "[p3-minor-bug]"
---

# Error with server.deps.inline and coverage

### Describe the bug

Config:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    server: {
      deps: {
        inline: true,
      },
    },
    coverage: {
      provider: 'v8',
      enabled: true,
    },
  }
});
```

Log:

...
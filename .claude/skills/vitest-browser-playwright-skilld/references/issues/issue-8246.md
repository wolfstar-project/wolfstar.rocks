---
number: 8246
title: "`vi.mock()` doesn't work if module is already imported"
type: docs
state: open
created: 2025-07-02
url: "https://github.com/vitest-dev/vitest/issues/8246"
reactions: 2
comments: 12
labels: "[documentation, feat: browser]"
---

# `vi.mock()` doesn't work if module is already imported

### Describe the bug

When I run a test using the following mock code:

```ts
import { vi } from "vitest";

vi.mock("./random", () => {
  return {
    randomString: () => "__MOCK__",
  };
});
```

Vitest in browser mode isn't functioning properly.

I found a section in the documentation discussing Spying on browser mode, but I'm still unsure how to resolve my use case after reading it.

### Reproduction

Git repo: https://github.com/issueset/vitest-mock-browser-mode

Reproduction steps:

...
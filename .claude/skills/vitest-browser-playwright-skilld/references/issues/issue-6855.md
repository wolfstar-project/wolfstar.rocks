---
number: 6855
title: "vite config `root` is ignored on workspace"
type: bug
state: open
created: 2024-11-05
url: "https://github.com/vitest-dev/vitest/issues/6855"
reactions: 3
comments: 4
labels: "[p3-minor-bug, feat: workspace]"
---

# vite config `root` is ignored on workspace

### Describe the bug

Though we know maintaining `cwd` is tricky, can we respect explicit `root` config such as this? 

```ts
// packages/client/vite.config.ts

import { defineConfig } from 'vitest/config';
import { join } from 'node:path';

export default defineConfig({
  // neither works
  root: './dir',
  // root: join(import.meta.dirname, './dir'),

  plugins: [
    {
      name: 'dump-root',
      configResolved(config) {
        // this is always "/abs-path-to/packages/client"
        // regardless of `root` config
        console.log('[dump-root]', config.root);
      },
    },
  ],
});
```

For example, this can affect Vite's project absolute path resolution as in the reproduction below.

### Reproduction

...
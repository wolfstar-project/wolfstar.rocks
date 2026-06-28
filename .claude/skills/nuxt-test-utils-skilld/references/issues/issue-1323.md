---
number: 1323
title: "[chore] happy-dom v18 peerDependency update"
type: other
state: closed
created: 2025-06-12
url: "https://github.com/nuxt/test-utils/issues/1323"
reactions: 1
comments: 2
---

# [chore] happy-dom v18 peerDependency update

Any chance we can expand the peerDependency range for happy-dom to include ^18.0.0 now?

```
.
└─┬ @nuxt/test-utils 3.19.1
  ├── ✕ unmet peer happy-dom@"^9.10.9 || ^10.0.0 || ^11.0.0 || ^12.0.0 || ^13.0.0 || ^14.0.0 || ^15.0.0 || ^16.0.0 || ^17.0.0": found 18.0.1
  └─┬ vitest-environment-nuxt 1.0.1
    └─┬ @nuxt/test-utils 3.19.1
      └── ✕ unmet peer happy-dom@"^9.10.9 || ^10.0.0 || ^11.0.0 || ^12.0.0 || ^13.0.0 || ^14.0.0 || ^15.0.0 || ^16.0.0 || ^17.0.0": found 18.0.1
```
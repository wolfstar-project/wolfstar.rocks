---
number: 7692
title: "Dual package hazard with `module-sync` condition in Node v22.12+"
type: bug
state: open
created: 2025-03-18
url: "https://github.com/vitest-dev/vitest/issues/7692"
reactions: 3
comments: 1
labels: "[p3-minor-bug]"
---

# Dual package hazard with `module-sync` condition in Node v22.12+

### Describe the bug

Vitest doesn't honour the `module-sync` condition that Node v22.12+ uses, leading to a dual package hazard.

This issue came up in the context of React Router when testing alongside a library with a peer dependency on React Router. Original issue is here: https://github.com/remix-run/react-router/issues/12785

React Router's `exports` field looks like this:

```json
"exports": {
  ".": {
    "node": {
      "types": "./dist/development/index.d.ts",      
      "module-sync": "./dist/development/index.mjs",
      "default": "./dist/development/index.js"
    },
    "import": {
      "types": "./dist/development/index.d.mts",
      "default": "./dist/development/index.mjs"
    },
    "default": {
      "types": "./dist/development/index.d.ts",
      "default": "./dist/development/index.js"
    }
  },
}
```...
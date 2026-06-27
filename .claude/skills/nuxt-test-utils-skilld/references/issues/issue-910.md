---
number: 910
title: Testing components that use CSS modules is failing
type: bug
state: closed
created: 2024-08-08
url: "https://github.com/nuxt/test-utils/issues/910"
reactions: 2
comments: 6
labels: "[bug, good first issue, vitest-environment]"
---

# Testing components that use CSS modules is failing

### Environment

- Operating System: Darwin
- Node Version:     v21.6.1
- Nuxt Version:     3.12.1
- CLI Version:      3.12.0
- Nitro Version:    2.9.6
- Package Manager:  bun@1.1.21
- Builder:          -
- User Config:      compatibilityDate, devtools, modules
- Runtime Modules:  @nuxt/test-utils/module@^3.14.0
- Build Modules:    -

### Reproduction

https://codesandbox.io/p/devbox/nuxt-test-with-css-modules-sz2wlg?file=%2Fsandbox.config.json%3A4%2C25-4%2C37

### Describe the bug

When running tests on components that uses CSS Modules, the $style attribute is consistently set to undefined, causing the tests to fail.

### Additional context

...
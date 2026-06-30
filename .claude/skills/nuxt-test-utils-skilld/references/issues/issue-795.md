---
number: 795
title: e2e tests dont show any console logs in stdout and in vitest/ui
type: bug
state: open
created: 2024-03-19
url: "https://github.com/nuxt/test-utils/issues/795"
reactions: 0
comments: 2
labels: "[bug]"
---

# e2e tests dont show any console logs in stdout and in vitest/ui

### Environment

```
------------------------------
- Operating System: Darwin
- Node Version:     v21.6.1
- Nuxt Version:     3.11.0
- CLI Version:      3.10.1
- Nitro Version:    2.9.4
- Package Manager:  bun@1.0.29
- Builder:          -
- User Config:      -
- Runtime Modules:  -
- Build Modules:    -
------------------------------
```

### Reproduction

https://stackblitz.com/edit/github-krtpdn?file=test%2Fsomething.spec.ts

### Describe the bug

Using `console.log()` within an e2e test doesnt output the test in stdout as well as in devtools "Console" tab. Only seems to work for beforeAll().

Try:

1. `bun run test`
-> No logs in console
<img width="864" alt="Bildschirmfoto 2024-03-19 um 16 15 57" src="https://github.com/nuxt/nuxt/assets/5103210/74fafc99-45...
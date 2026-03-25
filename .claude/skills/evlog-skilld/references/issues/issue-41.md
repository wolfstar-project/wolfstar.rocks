---
number: 41
title: "[bug] waitUntil error in 1.4.0 in dev"
type: bug
state: closed
created: 2026-02-05
url: "https://github.com/HugoRCD/evlog/issues/41"
reactions: 0
comments: 0
labels: "[bug]"
---

# [bug] waitUntil error in 1.4.0 in dev

### Description

Getting a weird error while using in development.

```log
 ERROR  Error while capturing another error Illegal invocation                                                                                                                                                                                                                                                                            10:30:44 AM

    at waitUntil (node_modules/.pnpm/wrangler@4.62.0_bufferutil@4.1.0_utf-8-validate@6.0.6/node_modules/wrangler/wrangler-dist/cli.js:296999:17)
    at callDrainHook (.nuxt/dev/index.mjs:5967:5)
    at .nuxt/dev/index.mjs:6016:7
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async Promise.all (index 0)
```

...
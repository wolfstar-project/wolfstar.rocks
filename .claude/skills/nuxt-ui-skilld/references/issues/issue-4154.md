---
number: 4154
title: Performance Issue Rendering Large List of UButtons – flushJobs Extremely Slow
type: bug
state: open
created: 2025-05-15
url: "https://github.com/nuxt/ui/issues/4154"
reactions: 2
comments: 8
labels: "[bug, v3, p2-medium]"
---

# Performance Issue Rendering Large List of UButtons – flushJobs Extremely Slow

### Environment


- Operating System: `Darwin`
- Node Version:     `v22.13.1`
- Nuxt Version:     `3.17.3`
- CLI Version:      `3.25.1`
- Nitro Version:    `2.11.12`
- Package Manager:  `pnpm@10.10.0`
- Builder:          `-`
- User Config:      `devtools`, `ssr`, `modules`, `css`, `future`, `compatibilityDate`
- Runtime Modules:  `@nuxt/ui@3.1.1`, `@nuxt/eslint@1.3.1`
- Build Modules:    `-`


### Is this bug related to Nuxt or Vue?

Nuxt UI

### Version

3.1.1

### Reproduction

https://github.com/meuschke/nuxt-ui-issue-slow-perf

### Description

Hi Nuxt UI team,

I'm encountering a significant performance issue when rendering a large number of UButton components in a Nuxt UI app.

...
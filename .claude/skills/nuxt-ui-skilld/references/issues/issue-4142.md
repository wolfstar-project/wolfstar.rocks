---
number: 4142
title: USelect and USelectMenu responds really slow when Vue devtool is opened
type: bug
state: open
created: 2025-05-13
url: "https://github.com/nuxt/ui/issues/4142"
reactions: 3
comments: 2
labels: "[bug, v3, upstream/reka-ui]"
---

# USelect and USelectMenu responds really slow when Vue devtool is opened

### Environment

- Operating System: Windows_NT
- Node Version:     v22.14.0
- Nuxt Version:     3.17.1
- CLI Version:      3.25.0
- Nitro Version:    2.11.11
- Package Manager:  npm@10.9.2
- Builder:          -
- User Config:      compatibilityDate, future, devtools, app, runtimeConfig, hooks, components, modules, eslint, ui, css, telemetry
- Runtime Modules:  @nuxt/eslint@1.3.0, @nuxt/ui@3.1.1, @pinia/nuxt@0.11.0
- Build Modules:    -

### Is this bug related to Nuxt or Vue?

Nuxt

### Version

v3.1.1

### Reproduction

1. Add a `USelect` component to a page with any example from the official doc: https://ui.nuxt.com/components/select
2. Start dev mode: `npm run dev`
3. Opens the page and try interact with the select element with **Vue dev tool opened**

### Description

...
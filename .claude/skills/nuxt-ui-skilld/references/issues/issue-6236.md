---
number: 6236
title: "How will Nuxt UI handle app-level configuration in Nuxt 5 after `app.config.ts` removal?"
type: question
state: open
created: 2026-03-24
url: "https://github.com/nuxt/ui/issues/6236"
reactions: 1
comments: 1
labels: "[question, v4]"
---

# How will Nuxt UI handle app-level configuration in Nuxt 5 after `app.config.ts` removal?

### Package

v4.x

### Description

With the removal of `app.config.ts`, `defineAppConfig`, and `useAppConfig` in Nitro 3 / Nuxt 5 (not supported for projects with `compatibilityVersion: 5`), how is Nuxt UI planning to handle or replace app-level configuration going forward?

See context: Nuxt 4.x App Config Limitations

Original note from @mrkaashee in nuxt/nuxt#34142:
> Just a heads-up: in Nitro 3 / Nuxt 5, `app.config.ts`, `defineAppConfig`, and `useAppConfig` are **no longer supported** — they’ve been removed. You won’t be able to use them in projects targeting compatibilityVersion 5.

...
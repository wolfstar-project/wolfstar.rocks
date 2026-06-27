---
number: 704
title: "Following documentation and using `defineVitestConfig` results in an `[ERROR] \"@nuxt/test-utils/config\" resolved to an ESM file.`"
type: docs
state: open
created: 2024-01-12
url: "https://github.com/nuxt/test-utils/issues/704"
reactions: 6
comments: 4
labels: "[documentation, good first issue]"
---

# Following documentation and using `defineVitestConfig` results in an `[ERROR] "@nuxt/test-utils/config" resolved to an ESM file.`

### Environment

Local machine
------------------------------
- Operating System: Windows_NT
- Node Version:     v18.15.0
- Nuxt Version:     3.7.1
- CLI Version:      3.8.1
- Nitro Version:    2.6.3
- Package Manager:  yarn@1.22.19
- Builder:          -
- User Config:      app, devtools, modules, tailwindcss, css, runtimeConfig, build
- Runtime Modules:  @nuxt/ui@2.12.0, @nuxtjs/tailwindcss@6.8.0, @nuxt/test-utils/module@3.9.0
- Build Modules:    -
------------------------------

Stackblitz env
------------------------------
- Operating System: Linux
- Node Version:     v18.18.0
- Nuxt Version:     -
- CLI Version:      3.10.0
- Nitro Version:    -
- Package Manager:  npm@9.4.2
- Builder:          -
- User Config:      -
- Runtime Modules:  -
- Build Modules:    -
------------------------------

### Reproduction

Repro stack blitz - https://stackblitz.com/edit/stackblitz-starters-cetpk5?file=vitest.config.js

### Describe the bug

When following testing documentation - https://nuxt.com/docs/getting-started/testing, after adding `vitest.config.{ts,js}` with `defineVitestConfig` and a basic test, `vitest run` fails with an error 

<details>
<summary>Bash error.</summary>
✘ [ERROR] "@nuxt/test-utils/config" resolved to an ESM file. ESM file cannot be loaded by `require`. See https://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only for more details. [plugin externalize-deps]

    node_modules/vite/dist/node/chunks/dep-V3BH7...

---

## Top Comments

**@danielroe** [maintainer] (+21):

This isn't Nuxt specific here, but to import `@nuxt/test-utils` in your vitest config, you either need to have to have `type: "module"` specified in your `package.json` or name it `vitest.config.m{ts,js}`.

We should make this clear in the docs.

**@danielroe** [maintainer] (+1):

do you not have `type: module` in your package.json?

https://github.com/nuxt/starter/blob/v3/package.json#L4

**@cory-baker** (+4):

update: renaming to `.mts` did work
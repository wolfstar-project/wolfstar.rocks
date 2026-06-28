---
number: 1043
title: "Vitest workspaces not properly supported by `defineVitestConfig`"
type: bug
state: closed
created: 2024-12-18
url: "https://github.com/nuxt/test-utils/issues/1043"
reactions: 3
comments: 2
labels: "[bug]"
---

# Vitest workspaces not properly supported by `defineVitestConfig`

### Environment

```
------------------------------
- Operating System: Darwin
- Node Version:     v20.13.0
- Nuxt Version:     3.14.1592
- CLI Version:      3.16.0
- Nitro Version:    2.10.4
- Package Manager:  npm@10.5.2
- Builder:          -
- User Config:      default
- Runtime Modules:  @nuxt/eslint@0.7.2, nuxt-open-fetch@0.9.5, @nuxtjs/i18n@9.1.0, nuxt-jsonld@2.1.0, @nuxtjs/device@3.2.4, @nuxtjs/robots@5.0.0, @vueuse/nuxt@12.0.0, @sidebase/nuxt-auth@0.9.4, @vesp/nuxt-fontawesome@1.1.0
- Build Modules:    -
------------------------------
```

### Reproduction

When using a vitest workspace, vitest complains that it can't resolve the config files, this is due to `defineVitestConfig`.
```
> vitest

...

---

## Top Comments

**@danielroe** [maintainer]:

this is now resolved

**@gaisinskii**:

I was going to raise a similar issue, but since this one exists I will ask my question here.

TLDR:

1) Open https://stackblitz.com/~/github.com/gaisinskii/nuxt-split-tests-issue
2) Wait for deps installation
3) Run `pnpm run test:unit` or `pnpm run test:e2e`
4) Console says `No test files found. You can change the file name pattern by pressing "p"`

The issue:

...
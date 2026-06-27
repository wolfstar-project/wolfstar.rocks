---
number: 1303
title: Adding nuxt/test-utils errors without vitest
type: other
state: closed
created: 2025-05-19
url: "https://github.com/nuxt/test-utils/issues/1303"
reactions: 4
comments: 3
labels: "[good first issue]"
---

# Adding nuxt/test-utils errors without vitest

### Environment

- Operating System: Linux
- Node Version:     v22.11.0
- Nuxt Version:     -
- CLI Version:      3.25.1
- Nitro Version:    -
- Package Manager:  npm@11.1.0
- Builder:          -
- User Config:      -
- Runtime Modules:  -
- Build Modules:    -

### Reproduction

`pnpm create nuxt my-nuxt-project` and select all options

### Describe the bug

 ERROR  Error while importing module @nuxt/test-utils: Error: Cannot find module 'vitest/config'                                      9:37:22 AM
Require stack:
- my-nuxt-project/node_modules/.pnpm/@nuxt+test-utils@3.19.0_@types+node@22.15.19_jiti@2.4.2_lightningcss@1.30.1_magicast@0.3.5_te_3u24m677fvme6kharjp6d5jt74/node_modules/@nuxt/test-utils/dist/config.mjs

...

---

## Top Comments

**@OrbisK** [maintainer]:

Workaround: 
```
pnpm add -D vitest
```

**@danielroe** [maintainer]:

it's intentional that we don't install those dependencies - we need to:

1. offer a follow up prompt when we land module hooks to install a test runner

2. address hard dependency on vitest in test utils

**@benmccann**:

I think that workaround doesn't quite work as it appears not to have installed the other extras. As another workaround, I just skipped installing `@nuxt/test-utils` and installed the remaining packages instead
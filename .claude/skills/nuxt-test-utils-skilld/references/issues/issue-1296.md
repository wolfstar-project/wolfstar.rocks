---
number: 1296
title: "Update from 3.18 to 3.19 changed default configuration, causing tests without .nuxt. to not be included"
type: other
state: closed
created: 2025-05-17
url: "https://github.com/nuxt/test-utils/issues/1296"
reactions: 11
comments: 8
labels: "[good first issue]"
---

# Update from 3.18 to 3.19 changed default configuration, causing tests without .nuxt. to not be included

### Environment

- Operating System: `Darwin`
- Node Version:     `v22.12.0`
- Nuxt Version:     `3.17.3`
- CLI Version:      `3.25.1`
- Nitro Version:    `2.11.12`
- Package Manager:  `bun@1.2.14`
- Builder:          `-`
- User Config:      `modules`, `typescript`, `alias`, `compatibilityDate`, `css`, `devtools`, `experimental`, `future`, `rootDir`, `vite`, `hanko`, `i18n`
- Runtime Modules:  `~~/modules/startup-check`, `@nuxt/fonts@0.11.4`, `@nuxt/icon@1.13.0`, `@nuxt/image@1.10.0`, `@nuxt/test-utils@3.19.0`, `@nuxt/test-utils/module@3.19.0`, `@nuxt/ui@3.1.2`, `@nuxtjs/i18n@9.5.4`, `@nuxtjs/hanko@1.0.0`
- Build Modules:    `-`


### Reproduction

https://stackblitz.com/edit/github-d5xpujkj?file=test%2Fbug.test.ts

### Describe the bug

I got some trouble when I updated from 3.18 to 3.19

After the update only `.nuxt.test.ts` tests are run by vitest.

To restore the previous behaviour (also running tests unrelated to nuxt), I now need to set environment "nuxt", which feels really unintiutive.
```TypeScript
export default defineVitestConfig({
  test: {
    environment: "nuxt",
  },
})
```

### Additional context

_No response_

### Logs

```shell-script

```

---

## Top Comments

**@danielroe** [maintainer] (+3):

It's not a breaking change; it's a bug.

**@danielroe** [maintainer]:

this is not intended and is likely due to the move from environmentMatchGlobs to workspace...

**@tobiashm**:

We are experiencing the same thing. It looks like you're applying some defaults for workspace that are causing problems.

From the output:
```
No test files found, exiting with code 1


 nuxt  

include: **/*.nuxt.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}, {test,tests}/nuxt/**.*
exclude:  **/node_modules/**, **/dist/**, **/cypress/**, **/.{idea,git,cache,output,temp}/**, **/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*
```
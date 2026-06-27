---
number: 314
title: "The \"setup\" in the tests is very slow for every rerun"
type: feature
state: open
created: 2022-10-19
url: "https://github.com/nuxt/test-utils/issues/314"
reactions: 18
comments: 13
labels: "[enhancement]"
---

# The "setup" in the tests is very slow for every rerun

### Environment

- Operating System: `Linux`
- Node Version:     `v16.14.2`
- Nuxt Version:     `3.0.0-rc.12`
- Nitro Version:    `0.6.0`
- Package Manager:  `npm@7.17.0`
- Builder:          `vite`
- User Config:      `-`
- Runtime Modules:  `-`
- Build Modules:    `-`

### Reproduction

https://stackblitz.com/edit/nuxt-framework-zehqm6

### Describe the bug

The empty `await setup({})` in the tests takes ~4 seconds for every rerun in `watch` mode in the empty project.
Please, check the reproduction, try to run `npm test`.

### Additional context

_No response_

### Logs

_No response_

---

## Top Comments

**@linspw** (+6):

You are amazing @nWacky !
I only adjusted to doesn't need mv command:

```ts
export default defineConfig<ConfigOptions>({
  use: {
    nuxt: {
      build: false,
      buildDir: '.output',
      nuxtConfig: {
        nitro: {
          output: {
            dir: '.output',
          },
        },
      },
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
    },
})
```

**@danielroe** [maintainer] (+3):

I think @antfu was working on a PR to avoid restarting/rebuilding Nuxt when rerunning tests.

Also relevant: https://github.com/nuxt/framework/pull/4578.

**@chrisjbrown** (+4):

I found a workaround by starting a dev/preview server and then running tests against that until there is a better solution
```
use: {
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      host: 'http://localhost:3000',
    },
    trace: 'on-first-retry',
  },
```
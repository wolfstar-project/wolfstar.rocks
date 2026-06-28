---
number: 984
title: Unable to use with Vitest in browser mode
type: bug
state: closed
created: 2024-10-18
url: "https://github.com/nuxt/test-utils/issues/984"
reactions: 12
comments: 4
labels: "[bug, good first issue]"
---

# Unable to use with Vitest in browser mode

### Environment

- Operating System: Linux
- Node Version:     v18.20.3
- Nuxt Version:     3.13.2
- CLI Version:      3.14.0
- Nitro Version:    2.9.7
- Package Manager:  npm@10.2.3
- Builder:          -
- User Config:      -
- Runtime Modules:  -
- Build Modules:    -


### Reproduction

https://stackblitz.com/edit/github-912ubv

run `pnpm test:browser` and check the components directory for Foo.vue and Foo.test.ts

### Describe the bug

I'm following steps 1 and 2 from the setup, but when running `vitest` in browser mode I get the following error in the browser UI:

ReferenceError: process is not defined
❯  /node_modules/.pnpm/vite@5.4.8_@types+node@22.7.5_terser@5.34.1/node_modules/vite/dist/client/env.mjs:12:519

Could that be because `process` is in fact referenced inside https://github.com/nuxt/test-utils/blob/main/src/config.ts, when I'm running the test runner under a browser environment, and not in Node? If so, how can I configure vitest to run in browser mode under Nuxt environment?

### Additional context

_No response_

### Logs

_No response_

---

## Top Comments

**@halkony** (+10):

Can confirm that I am getting the same error.
Nuxt: 3.13.0
Vitest + @vitest/browser: 2.1.3

I tried several different package versions with no luck. Error shows up on both, WebdriverIO and playwright, firefox and chrome. Sometimes the error doesn't pop up though.

Either way, test discovery does not populate in browser mode.

**@AskeLange** (+3):

Has there been any update on this? 

I'm trying to get `@nuxt/test-utils` to play nice with Storybooks (v9) new testing features, but so far there have been no luck, because of this issue.

**@yamachi4416** [maintainer] (+1):

It seems to work with Vitest v3
https://stackblitz.com/edit/github-912ubv-8gtcbasx?file=package.json
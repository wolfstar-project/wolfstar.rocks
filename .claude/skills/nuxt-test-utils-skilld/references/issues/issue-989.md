---
number: 989
title: Testing in devtools fails
type: bug
state: closed
created: 2024-10-23
url: "https://github.com/nuxt/test-utils/issues/989"
reactions: 3
comments: 3
labels: "[bug, good first issue]"
---

# Testing in devtools fails

### Environment

- Operating System: Darwin
- Node Version:     v20.16.0
- Nuxt Version:     3.13.2
- CLI Version:      3.15.0
- Nitro Version:    2.9.7
- Package Manager:  pnpm@9.12.1
- Builder:          -
- User Config:      default
- Runtime Modules:  @nuxt/test-utils/module@3.14.4
- Build Modules:    -


### Reproduction

Create a new Nuxt projet, install test suite following this link
Create a simple test and run pnpm dev. 

Open devtools and run the tests


### Describe the bug

Tests run from the devtools or the Vitest UI url on `pnpm dev` are broken with `TypeError: Cannot read properties of undefined (reading 'vueApp')
`



...

---

## Top Comments

**@jmescode-te**:

I am having the same issue, but my error is `window is not defined`

**@mrcsmcln**:

I am receiving the same issue, and it doesn't matter if I use `.nuxt` in the filename, `environment: 'nuxt'` in `vite.config.js`, or the `// @vitest-environment nuxt` comment within the file. `vitest --ui` works just fine.

**@drewtownchi**:

I had a similar issue and it was because of the file name. It should be  Input.**nuxt**.spec.ts for example.  I was forgetting the nuxt in one of my file names.
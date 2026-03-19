---
number: 2254
title: "Bug: [TypeScript] `findAllComponents` type definition with Vue generic"
type: bug
state: open
created: 2023-11-23
url: "https://github.com/vuejs/test-utils/issues/2254"
reactions: 6
comments: 5
labels: "[bug, has-pr]"
---

# Bug: [TypeScript] `findAllComponents` type definition with Vue generic




**Describe the bug**


When I use a library that ship `d.ts` files for Vue.js components, using `vite-plugin-dts`, and I'm trying to do unit tests with `findAllComponents` function on a generic component, I have a TS error: 

```
No overload matches this call.
```

If I put a `@ts-ignore`, the test is a success.

**To Reproduce**


Here is a link to reproduce the error. I put all the detail on how to reproduce the issue in the README

**Expected behavior**


No TS error.

**Related information:**



```
  System:
    OS: Windows 10 10.0.22631
    CPU: (8) x64 11th Gen Intel(R) Core(TM) i7-1185G7 @ 3.00GHz
    Memory: 3.93 GB / 15.74 GB
  npmPackages:
    @vue/test-utils: 2.4.1 => 2.4.1
    vitest: ^0.31.1 => 0.31.1
    vue: ^3.3.4 => 3.3.4
```

**Additional context**



---

## Top Comments

**@cexbrayat** [maintainer] (+4):

@joris-fonck-loreal Thanks for the repro.

We have a WIP PR to have better types that should land shortly, so maybe this will fix your issue as well. You can track the progress of #2242, and check again when it is merged and released. If the issue persists, then we'll take a closer look 

**@cexbrayat** [maintainer] (+1):

I think we first need https://github.com/vuejs/core/pull/9556 to land, then https://github.com/vuejs/test-utils/pull/2242 can be merged and released

**@michaelcozzolino** (+1):

the pr around this bug should be prioritised, for now a good workaround to not use ts-ignore is to put the name of the component as string
`expect(wrapper.findAllComponents({ name: 'ComponentName'})).toHaveLength(1);`
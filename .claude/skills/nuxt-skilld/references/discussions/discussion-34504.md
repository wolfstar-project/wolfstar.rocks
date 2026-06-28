---
number: 34504
title: testing nuxt v5 and nitro v3
category: General
created: 2026-03-11
url: "https://github.com/nuxt/nuxt/discussions/34504"
upvotes: 19
comments: 2
answered: false
---

# testing nuxt v5 and nitro v3

we've already moved to merging breaking changes for nuxt v5 onto `main`, which means it is already possible to test the current state of nuxt v5 by setting:

```diff
  {
    "dependencies": {
-    "nuxt": "^4.0.0"
+    "nuxt": "npm:nuxt-nightly@5x"
  }
}
```

however, note that right now very few of the breaking changes have been merged so please treat this as an early preview.

in particular, it's not possible to test nitro v3 &ndash; but expect that to change _very_ soon...

##  Significant breaking changes for v5

- [x] https://github.com/nuxt/nuxt/pull/34256
- [x] https://github.com/nuxt/nuxt/pull/33005
- [ ] Move Nitro support to use Vite Environment API

 see more details on the Upgrade Guide

---

## Top Comments

**@franklin-tina** (+1):



**@madsh93**:

Anybody who tried it, and whats the experience like? Was it straightforward?

I am especially hoping it would be able to fix: https://github.com/nuxt/nuxt/issues/33735 
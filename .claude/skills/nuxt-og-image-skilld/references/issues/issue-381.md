---
number: 381
title: Link on error.vue fails to navigate to home page on dev
type: other
state: closed
created: 2025-07-15
url: "https://github.com/nuxt-modules/og-image/issues/381"
reactions: 2
comments: 0
---

# Link on error.vue fails to navigate to home page on dev

When adding a link to a nuxt error.vue 404 page, the link fails to navigate with the following error

```
H3Error: You are using a defineOgImage() function in a client-only context. You must call this function within your root component setup, see https://github.com/nuxt-modules/og-image/pull/293.
```
Related PR https://github.com/nuxt-modules/og-image/issues/293

# Reproduction example
There is a reproduction of this error in the following repo with steps to reproduce in the readme.

https://github.com/maxmckenzie/og-image-error-page-issue

You can patch this by wrapping `defineOgImageComponent` in `if(import.meta.server)`

But that is not ideal
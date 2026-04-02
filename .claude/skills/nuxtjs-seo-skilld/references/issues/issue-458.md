---
number: 458
title: "help: Default, global OG Image? (SSG)"
type: question
state: closed
created: 2025-07-08
url: "https://github.com/harlan-zw/nuxt-seo/issues/458"
reactions: 2
comments: 2
labels: "[help wanted]"
---

# help: Default, global OG Image? (SSG)

###  What are you trying to do?

What is the best way to define a default, global og-image for the entire app?

Currently I'm using `defineOgImageComponent` in `app.vue` (main app entry), but this will cause the same OG image to be re-generate for every single route that is being pre-rendered, which hurts the build performance and bandwidth.



###  What have you tried?

_No response_

###  Additional context

...

---

## Top Comments

**@harlan-zw** [maintainer] (+1):

This is an important issue and i'll try to find time for it but there's a bit of work involved.

**@harlan-zw** [maintainer]:

Solved in v6 with the build cache.
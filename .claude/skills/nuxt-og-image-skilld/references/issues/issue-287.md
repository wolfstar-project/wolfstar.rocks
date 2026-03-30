---
number: 287
title: "fix: nuxt-content-assets with nuxt og-image in static mode"
type: bug
state: open
created: 2024-12-04
url: "https://github.com/nuxt-modules/og-image/issues/287"
reactions: 0
comments: 1
labels: "[bug]"
---

# fix: nuxt-content-assets with nuxt og-image in static mode

###  The bug

I have been using nuxt-content-assets as a way to organize the media files within content directory. 

The modules work perfectly together in dev mode, the og-image gets displayed as intended


But when generating to static, things don't go as intended. Error is from cloudflare pages


Compared to what is present in dev mode, this is the generated og image


I am not entirely sure if this is an issue related to this module or nuxt-content-assets.

...

---

## Top Comments

**@takayumi**:

I'm facing the same issue. Did you find any workarounds, @Bumbleboss?
---
number: 399
title: "fix: ReferenceError: _default is not defined"
type: bug
state: closed
created: 2025-11-05
url: "https://github.com/nuxt-modules/og-image/issues/399"
reactions: 1
comments: 1
labels: "[bug]"
---

# fix: ReferenceError: _default is not defined

###  The bug

When I deploy to Vercel Edge, I get this error:
```
ReferenceError: _default is not defined
```
It works fine on Vercel Functions.

I used to be Edge compatible.

###  To reproduce

https://github.com/jdgamble555/nuxt-og-image,  https://nuxt-og-image.vercel.app/

###  Expected behavior

It should deploy as expected. My GH is a minimum project.

###  Additional context

I probably should have published here, as I thought this was a Nuxt SEO package, so this is related:

https://github.com/harlan-zw/nuxt-seo/issues/494

Nitro deployment: `vercel-edge`

J

---

## Top Comments

**@harlan-zw** [maintainer]:

I can't seem to reproduce using the v6 beta so closing for now but happy to re-open if it's still broken.
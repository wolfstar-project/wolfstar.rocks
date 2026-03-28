---
number: 494
title: "fix: ReferenceError: _default is not defined"
type: bug
state: closed
created: 2025-11-02
url: "https://github.com/harlan-zw/nuxt-seo/issues/494"
reactions: 2
comments: 5
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

J

###  To reproduce

https://github.com/jdgamble555/nuxt-og-image

https://nuxt-og-image.vercel.app/

###  Expected behavior

It should deploy as expected. My GH is a minimum project.

###  Additional context

I have tried nitro `vercel_edge` and `vercel-edge`.



---

## Top Comments

**@harlan-zw** [maintainer]:

Duplicate of https://github.com/harlan-zw/nuxt-seo/issues/511, should be fixed in og image but other modules may have the issue (so you need to patch it with the workaround).

**@jdgamble555**:

The last working version is `5.1.9`, so something after that broke it on the Edge.

**@leogenot**:

Same here using Netlify Edge
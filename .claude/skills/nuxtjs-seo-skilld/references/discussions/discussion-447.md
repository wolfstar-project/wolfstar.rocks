---
number: 447
title: "Link checker: Should not redirect"
category: "Q&A"
created: 2025-06-02
url: "https://github.com/harlan-zw/nuxt-seo/discussions/447"
upvotes: 1
comments: 0
answered: false
---

# Link checker: Should not redirect

Hi,

I am protecting certain routes via a global `defineNuxtRouteMiddleware` like so:

```
...
if (isProtected) {
      /* Not logged in and navigating to protected route => go to /login page */
      return navigateTo({ name: "login", query: { redirect: to.fullPath } })
}
```

on `nuxt build` I get the following warning multiple times:

```
/support/other [1 warning]                                                                                                                    nitro 13:53:22
  └─ /user                                                                                                                                    nitro 13:53:22
[nitro 13:53:22]       "Manage  Your  Orders"
      └─ Should not redirect. (redirects)                                                                                                     nitro 13:53:22
          Fix: Set to redirect URL /login?redirect=/user.
```...
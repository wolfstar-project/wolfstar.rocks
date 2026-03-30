---
number: 461
title: "fix: Cannot read properties of undefined (reading 'robots')"
type: bug
state: closed
created: 2025-07-24
url: "https://github.com/harlan-zw/nuxt-seo/issues/461"
reactions: 2
comments: 1
labels: "[bug]"
---

# fix: Cannot read properties of undefined (reading 'robots')

###  The bug

Hello Everybody,
i have a current issue with nuxt/seo and my current nuxt.config.ts.

if i install the module i get the current Issuse:

`Cannot start nuxt:  Cannot read properties of undefined (reading 'robots')                                  9:45:34 AM

    at normaliseRobotsRouteRule (node_modules/@nuxtjs/robots/dist/runtime/server/nitro.js:4:21)
    at node_modules/@nuxtjs/robots/dist/module.mjs:362:65
    at Array.forEach (<anonymous>)
    at node_modules/@nuxtjs/robots/dist/module.mjs:361:49
    at async initNuxt (node_modules/nuxt/dist/shared/nuxt.CJ7ZnOUY.mjs:5882:3)
    at async NuxtDevServer._load (node_modules/@nuxt/cli/dist/chunks/index.mjs:245:5)
    at async NuxtDevServer.load (node_modules/@nuxt/cli/dist/chunks/index.mjs:170:7)
    at async NuxtDevServer.in...

---

## Top Comments

**@jd-solanki** (+1):

Hey @harlan-zw I'm still getting this error even after using latest release 3.4.0

Can we keep this open?

<img width="1198" height="844" alt="Image" src="https://github.com/user-attachments/assets/1660c38e-abf1-4b4b-a72f-7cf5b7c3976a" />

Docs: https://nuxtseo.com/docs/robots/guides/route-rules
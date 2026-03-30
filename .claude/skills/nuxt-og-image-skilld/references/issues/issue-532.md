---
number: 532
title: "fix: Demo is outdated"
type: bug
state: closed
created: 2026-03-24
url: "https://github.com/nuxt-modules/og-image/issues/532"
reactions: 1
comments: 1
labels: "[bug]"
---

# fix: Demo is outdated

###  The bug

In the README.md there is:

> ## Demos
> 
> -  &nbsp;Playground

The demo is outdated. From package.json:
```
  "devDependencies": {
    "nuxt": "^3.15.4",
    "nuxt-og-image": "^4.1.5"
  }
```


###  To reproduce

https://stackblitz.com/edit/nuxt-starter-pxs3wk?file=package.json

###  Expected behavior

Having a modern demo playground of the v6 version of the module, OR not having a demo at all.

###  Additional context

_No response_

---

## Top Comments

**@harlan-zw** [maintainer] (+1):

Thanks for flagging this. I've setup examples synced to the repo so they should always stay up to date 

- Satori (custom template)
- Takumi (custom template)
- Nuxt Content
- i18n

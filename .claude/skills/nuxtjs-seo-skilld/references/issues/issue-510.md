---
number: 510
title: "fix: Memory leak when using @nuxt/seo together with useApiData (wrapper around useAsyncData)"
type: bug
state: closed
created: 2026-01-19
url: "https://github.com/harlan-zw/nuxt-seo/issues/510"
reactions: 1
comments: 6
resolvedIn: 3.2.18
labels: "[bug]"
---

# fix: Memory leak when using @nuxt/seo together with useApiData (wrapper around useAsyncData)

###  The bug

When using the @nuxt/seo module on pages where useApiData (a wrapper around useAsyncData) is executed, a memory leak appears. After handling requests, memory inside the Docker container does not get released. The memory usage keeps growing during load and never goes down even after the load stops.
When removing @nuxt/seo from the Nuxt modules list, the issue no longer appears — memory remains stable.

###  To reproduce

https://github.com/SprayDev/nuxt-seo-memory

###  Expected behavior

Memory should increase during load but then be released once the requests finish. The Docker container should return to its normal baseline.

...

---

## Top Comments

**@SprayDev** (+1):

I also tried one more setting `site: {enabled: falses}`. 
After this change, it seems that all memory problems have disappeared.

**@harlan-zw** [maintainer]:

If you have any capacity to try and isolate the module be conditionally enabling/disabling them it would be a big help, see https://nuxtseo.com/docs/nuxt-seo/guides/debugging-modules

**@harlan-zw** [maintainer]:

Hm that's strange as Nuxt SEO actually does nothing itself, it's just an alias for installing all the other modules, see https://github.com/harlan-zw/nuxt-seo/blob/main/src/module.ts
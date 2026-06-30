---
number: 34143
title: "4.3.0 NuxtError use in error.vue isn't showing status and statusText"
category: Questions
created: 2026-01-23
url: "https://github.com/nuxt/nuxt/discussions/34143"
upvotes: 4
comments: 3
answered: true
---

# 4.3.0 NuxtError use in error.vue isn't showing status and statusText

I upgraded to the `4.3.0` version. This version mentions the deprecation for the `statusCode` → `status`, `statusMessage` → `statusText`. After changing instances of `showError` to use `status` and either `statusText` or `message` everything is working.

I noticed though that in `error.vue` the old properties that were still used were also hinted as deprecated in IntelliJ (i believe correctly since the type for the `error` prop is the `NuxtError`). If i change them though in the template and use the recommended properties then they show `undefined` instead of their values.

Is this ok as it is or should it work? Did the logic for the `error.vue` not change along with the `showError`/`createError`? Should a different type be used (though the documentation shows also this type https://nu...

---

## Accepted Answer

@alexgil1994 Seems like they've already fixed it, should be in 4.3.1 (#34188)

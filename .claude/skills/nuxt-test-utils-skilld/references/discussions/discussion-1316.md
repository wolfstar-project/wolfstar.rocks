---
number: 1316
title: "How can I access the real i18n `d()` function in Nuxt Test Utils, and is it bad practice to use it in tests?"
category: "Q&A"
created: 2025-06-06
url: "https://github.com/nuxt/test-utils/discussions/1316"
upvotes: 1
comments: 0
answered: false
---

# How can I access the real i18n `d()` function in Nuxt Test Utils, and is it bad practice to use it in tests?

Hi everyone,

I’m writing tests for a Nuxt 3 project that uses @nuxtjs/i18n] (vue-i18n under the hood). In my components, I format dates with the i18n `d()` helper, for example:

```vue

<time :datetime="startDate.toISOString()">{{ $d(startDate, dateStyle) }}</time>

```

In my test suite (using Vitest + Nuxt Test Utils), I need to assert that the rendered `<time>` text matches the formatted date from i18n’s “short” datetime format. So far, I’ve been doing something like this:

```ts
// Grab i18n.d() from NuxtApp
const { $i18n: { d } } = useNuxtApp()


// Skipping code
expect(timeText).toBe(d(endIso, 'short'))
  })
})
```

This works fine in my local tests. My question is twofold:

1. **Is there a “better” or more idiomatic way to access...
---
number: 235
title: How to clone / use the NuxtSEO OgImageComponent
category: "Q&A"
created: 2024-05-07
url: "https://github.com/harlan-zw/nuxt-seo/discussions/235"
upvotes: 3
comments: 0
answered: false
---

# How to clone / use the NuxtSEO OgImageComponent

Hi there 

I would like to use the default provided component and customize it, just had a few questions:

1. when using say`defineOgImageComponent("myCustomOG")` in a component it will know to search for `./components/OgImage/myCustomOG.vue` automatically? Is that how it works?

2. The documentation states to copy `src/runtime/nuxt/components/Templates/Community/NuxtSeo.vue` into your project and customize from there, I see there are relative imports here, for example `import { useOgImageRuntimeConfig } from '../../../../shared'` <- will this break after copying? I assume so. How should this be handled?
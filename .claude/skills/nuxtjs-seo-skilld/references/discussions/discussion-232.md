---
number: 232
title: Default defineOgImageComponent for all pages
category: "Q&A"
created: 2024-05-06
url: "https://github.com/harlan-zw/nuxt-seo/discussions/232"
upvotes: 1
comments: 2
answered: false
---

# Default defineOgImageComponent for all pages

Hello,

Is there a way to define a default og:image for all pages? 

---

## Top Comments

**@harlan-zw** [maintainer]:

Hi, yes you can either add it to `app.vue` or use route rules.

Something like this should work.

```ts
export default defineNuxtConfig({
  routeRules: {
    '/**': {
      ogImage: {
        component: 'NuxtSeo',
        props: { icon: 'carbon:image-search' }
      }
    }
  }
})
```

**@FabianMontoya**:

Im having the same error, is very frustrated, only works with the rebuild templates, but if I want use a jpeg image or a custom component, I can't :( 
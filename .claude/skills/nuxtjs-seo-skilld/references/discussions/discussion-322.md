---
number: 322
title: How to define titles for different pages?
category: "Q&A"
created: 2024-09-23
url: "https://github.com/harlan-zw/nuxt-seo/discussions/322"
upvotes: 1
comments: 2
answered: true
---

# How to define titles for different pages?

I have trouble setting up the `og:title `of different pages. Let's say I want to set up different meta `titles` and `description` for each subpage (`/about-us`, `/term-and-conditions`). 

Took a look at the documentation on the site, but I'm confused. Where in the configuration should i set up this? Or should I use the Nuxt hook `useHead`? 

This is my `nuxt.config.ts `
```typescript
export default defineNuxtConfig({
 site: {
    url: "https://example.com/",
    name: "Home - ACME Inc",
    description:
      "Welcome to ACME Inc.",
    defaultLocale: "es",
  },
  seo: {
    redirectToCanonicalSiteUrl: true,
    automaticDefaults: true,
  }
})
``` 

I can't seem to grasp where should be the setup for each `title` and  `description`for each subpage should be. Thank you.

---

## Accepted Answer

Hi @vicentematus ,
In page.vue :
```js
useSeoMeta( {
  title: "Example Page Title",
  description: "This is a sample description for the example page.",
  ogTitle: "Example Open Graph Title",
  ogDescription: "This is a sample Open Graph description.",
  ogImageUrl: "https://example.com/images/sample-og-image.jpg",
  ogImageAlt: "Sample Open Graph image description.",
  twitterTitle: "Example Twitter Title",
  twitterDescription: "This is a sample Twitter description.",
  twitterImage: "https://example.com/images/sample-twitter-image.jpg",
  twitterImageAlt: "Sample Twitter image description."
} ); // useSeoMeta()
```
useSeoMeta doc : 
https://nuxt.com/docs/api/composables/use-seo-meta

Or if you don't need reactivity :
useServerSeoMeta
https://nuxt.com/docs/api/composables/use-server-seo-meta
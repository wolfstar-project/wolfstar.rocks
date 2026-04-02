---
number: 426
title: Schema.org description is not displaying data I expect
category: General
created: 2025-04-01
url: "https://github.com/harlan-zw/nuxt-seo/discussions/426"
upvotes: 1
comments: 1
answered: false
---

# Schema.org description is not displaying data I expect

When setting up dynamic meta description for my website in my `pages/[...slug].vue`, like this

```js
useSeoMeta({
  title: () => page.seo_meta?.seo_title || page?.title,
  description: () => page.seo_meta?.seo_description || page?.summary || null,
  ogImage: () => page.seo_meta?.seo_image || page.cover_image?.filename || null,
  articleModifiedTime: story.value.published_at,
})
```

the correct retrieved value is set for opengraph data, i.e. https://www.opengraph.xyz/url/https%3A%2F%2Fwww.stefanobartoletti.it%2F

while on shcema.org "isPartOf" section (here https://validator.schema.org/#url=https%3A%2F%2Fwww.stefanobartoletti.it%2F ) it displays the fallback value that I set on `nuxt.config.ts`, that I used only to fill data but didn't intend to actually use:

```js
  site: {
    // environment variables provided by Netlify
    url: process.env.BRANCH === 'release' ? process.env.URL : process.env.DEPLOY_PRIME_URL || 'https://localhost:3000',
    name: 'Stefano Bartoletti',
    indexable: process.env.BRANCH === 'release' || false, // set indexable only on production, not on branch deploys
    trailingSlash: true,
    // titleSeparator: '|',
    description: 'Default Site Description',
    defaultLocale: 'en',
  },
```...

---

## Top Comments

**@harlan-zw** [maintainer]:

I believe this is intentional as a WebSite and a WebPage are meant to have descriptions describing each one individually.

Just in your case for the home page it does seem like it makes sense for the site description to match the home page description although you may consider unique descriptions if you're trying to maximise how semantic the data is.
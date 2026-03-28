---
number: 233
title: Favicon best practices
category: "Q&A"
created: 2024-05-06
url: "https://github.com/harlan-zw/nuxt-seo/discussions/233"
upvotes: 1
comments: 1
answered: false
---

# Favicon best practices

Hello,

I've seen examples of best for favicons being the following

```
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  }
});

```

Is this true for favico...

---

## Top Comments

**@harlan-zw** [maintainer]:

Hi, the `favicon.ico` format can pack icons up in many resolutions, it's recommended to pack it to at least 256px.

The other rel icons shouldn't be needed in that case, except for the apple touch icon. The Nuxt SEO Experiments module can automatically set up these tags for you though.

It seems like you're trying to set up a PWA though so I'd suggest following the best practices for that separately. 

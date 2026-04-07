---
number: 432
title: "Can't return hreflang from dynamic urls"
category: "Q&A"
created: 2025-04-23
url: "https://github.com/harlan-zw/nuxt-seo/discussions/432"
upvotes: 1
comments: 1
answered: false
---

# Can't return hreflang from dynamic urls

So far the plugin does a really nice job. Now there's something incomplete for i18n.

I created a server endpoint to return dynamic urls:

```
...
[{
    loc: `${baseUrl}/fr/category/${category.url}`,
    _sitemap: 'fr-FR',
   alternates: [
     { href: `${baseUrl}/category/${category.url}`, hreflang: 'en-UK' },
     { href: `${baseUrl}/fr/category/${category.url}`, hreflang: 'fr-FR' }
    ]
    _i18n: {
      'en-UK': `${baseUrl}/category/${category.url}`,
      'fr-FR': `${baseUrl}/fr/category/${category.url}`
    }
  },
  ...
]
```

_i18n is completely ignored (tried keys with an underscore as well `fr_FR`), but since `_sitemap: 'fr-FR'` works, I guess this is the right format.

I also tried

```
...
[{
    loc: `${baseUrl}/fr/category/${category.url}`,
   _sitemap: 'fr-FR',
   alternates: [
     { href: `${baseUrl}/category/${category.url}`, hreflang: 'en-UK' },
     { href: `${baseUrl}/fr/category/${category.url}`, hreflang: 'fr-FR' }
    ]
  },
  ...
]
```...

---

## Top Comments

**@Buzut** (+1):

Solved in https://github.com/harlan-zw/nuxt-seo/issues/440
---
number: 167
title: Using dynamic urls using _sitemap-urls.ts with i18n?
category: "Q&A"
created: 2024-01-20
url: "https://github.com/harlan-zw/nuxt-seo/discussions/167"
upvotes: 1
comments: 2
answered: true
---

# Using dynamic urls using _sitemap-urls.ts with i18n?

In my previous (single-language) products, I used `_sitemap-urls.ts` to get all the collections from my CMS and map them for the sitemap, now I'm using Nuxt-I18N, I'm wondering what the multi-language use of https://nuxtseo.com/sitemap/guides/dynamic-urls is? 

Thanks!

---

## Accepted Answer

Answering my own question here, in case anyone needs it. The following is working now, I'm using the returned language code from the CMS to determine which sitemap the content goes in.

```
results.push({
    loc: `/cases/${caseItemTranslation.slug}`,
    lastmod: new Date(caseItem.date_updated).toISOString(),
    _sitemap: caseItemTranslation.languages_code,
})
```
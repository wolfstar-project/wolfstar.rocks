---
number: 184
title: Robots.txt vs. noindex meta tag
category: "Q&A"
created: 2024-02-12
url: "https://github.com/harlan-zw/nuxt-seo/discussions/184"
upvotes: 1
comments: 1
answered: false
---

# Robots.txt vs. noindex meta tag

(As this might not be an issue of the module and maybe a misunderstanding from my side, I'll post my question here.)

I recently discovered via the Google Search Console that parts of two of our staging systems are indexed by Google. Reading further into the topic (https://developers.google.com/search/docs/crawling-indexing/block-indexing?hl=en),  my current understanding is, that using both techniques (blocking pages via the robots.txt and the noindex meta tag) together won't stop Google from indexing it (or won't remove URLs from the index):

>  If the page is blocked by a robots.txt file or the crawler can't access the page, the crawler will never see the noindex rule, and the page can still appear in search results, for example if other pages link to it.

Am I misreading the Goog...

---

## Top Comments

**@riddla**:

@harlan-zw, could you have a look?
---
number: 196
title: "sitemap and i18n dynamic url's"
category: "Q&A"
created: 2024-03-03
url: "https://github.com/harlan-zw/nuxt-seo/discussions/196"
upvotes: 1
comments: 0
answered: false
---

# sitemap and i18n dynamic url's

Hello guys, first of all congrats on this excellent git, I've been struggling with this issue and I was wondering if it is a bug or feature or whatever, so here is my scenario, I have a Nuxt 3 web multi language portfolio and when I try to create the sitemap for dynamics Url's I am getting unexpected results.

From docs there's an example on how to proceed:
        // loc: '/about-us',
        // will be transformed into /en/about-us and /fr/about-us
        
But, what is my url is also translated?
        // (/fr/a-propos)
        
I created a repo with stackblitz so people can see the actual problem.

In my case I am expecting to get the right na...
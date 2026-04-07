---
number: 306
title: "Add support for Bing's `indexNow` feature"
type: feature
state: closed
created: 2024-09-02
url: "https://github.com/harlan-zw/nuxt-seo/issues/306"
reactions: 2
comments: 4
labels: "[enhancement]"
---

# Add support for Bing's `indexNow` feature

### Clear and concise description of the problem

It may be useful to implement Bing's `indexNow` feature, that basically requests a fresh indexing for given pages.

Info and documentation are available here https://www.bing.com/indexnow/getstarted

I'm not sure in which of the submodules this should be integrated, hence I opened this issue here. Anyway, probably `sitemap` submodule is the right choice (you already have a list of URLs there)

### Suggested solution

According to the docs, this can be done with a simple HTML request, coupled with a specific API key that has tp be generated

### Alternative

_No response_

### Additional context

_No response_
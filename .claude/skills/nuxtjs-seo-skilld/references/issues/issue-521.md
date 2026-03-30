---
number: 521
title: "fix: template transform failed"
type: bug
state: closed
created: 2026-03-20
url: "https://github.com/harlan-zw/nuxt-seo/issues/521"
reactions: 1
comments: 3
resolvedIn: 6.0.7
labels: "[bug]"
---

# fix: template transform failed

###  The bug

I get the following error when building with vite 7 and 8:

[@nuxtjs/og-image 10:09:17]  WARN  [nuxt-og-image] Article.takumi.vue: CSS template transform failed, using original template Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'

in dev:

[nuxt] [@nuxtjs/og-image]  WARN  CSS metadata extraction failed: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'c:'
[nuxt]
[nuxt]
[nuxt]  ERROR  [unhandledRejection] Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:/...

---

## Top Comments

**@harlan-zw** [maintainer] (+1):

Looks like a windows bug, can you please try og image v6.0.6  

**@harlan-zw** [maintainer] (+1):

Sorry 6.0.7! Thanks for confirming  

**@simonmaass**:

fixed with v6.0.7 <3
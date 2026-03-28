---
number: 480
title: Is there an upgrade guide from Nuxt SEO v2 to v3?
category: "Q&A"
created: 2025-10-02
url: "https://github.com/harlan-zw/nuxt-seo/discussions/480"
upvotes: 1
comments: 1
answered: false
---

# Is there an upgrade guide from Nuxt SEO v2 to v3?

I upgraded from v2 to v3 and I'm getting errors with `useSchemaOrg()` `defineComment()` and also the Vue components to generate Schemas like `<SchemaOrgQuestion>`. 

Is there a migration guide what features got removed? 
I couldn't find any reference to the `<SchemaOrgQuestion>` in the documentation for example. 

Thanks for any help! 

---

## Top Comments

**@harlan-zw** [maintainer]:

Hm this doesn't sound right. There were no breaking changes for v3 besides requiring Nuxt v3.16.

Your issue may be something else, can you provide some reproduction details
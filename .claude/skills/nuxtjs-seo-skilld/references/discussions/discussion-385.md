---
number: 385
title: "Nuxt Content v3: how to combine asSchemaOrgCollection() with asSitemapCollection() ?"
category: "Q&A"
created: 2025-01-21
url: "https://github.com/harlan-zw/nuxt-seo/discussions/385"
upvotes: 1
comments: 0
answered: false
---

# Nuxt Content v3: how to combine asSchemaOrgCollection() with asSitemapCollection() ?

Hi all,

cannot figure out how to combine these two content config functions on one collection?

e.g. now I use:
`export default defineContentConfig({
  collections: {
    blog: defineCollection(
      asSitemapCollection({
        type: "page",
        source: "blog/**",
        schema: z.object({
          title: z.string(),
          description: z.string(),
          date: z.string(),
        }),
      })
    ),
  },
});`

Nothing I try applying on it asSchemaOrgCollection works. 

Any help appreciated. THX
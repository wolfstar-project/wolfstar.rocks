---
number: 341
title: Breadcrumbs with dynamic name
category: "Q&A"
created: 2024-10-22
url: "https://github.com/harlan-zw/nuxt-seo/discussions/341"
upvotes: 2
comments: 1
answered: false
---

# Breadcrumbs with dynamic name

Hello there.

Let's assume I got a nested route like 

`/shop/item/[:id]/preview`

Using the breadcrumbs composable, I am getting this result:

```
shop > item > 123 > preview
```

But now there's the thing: I want to replace the ID of the item with the name, which comes async from the database.

I read the docs but I still don't know how I'd do that. Any help is highly appreciated :-) 

---

## Top Comments

**@harlan-zw** [maintainer]:

Hey, so for this you would use the `overrides` option, it's a bit cumbersome but it should do the trick.

```ts
const { data } = useAsyncData(() => {})
useBreadcrumbItems({
  overrides: [
    null, // shop
    null, // item
    { label: data.value?.title }
  ]
})
```

You can read more about that here https://nuxtseo.com/docs/seo-utils/api/breadcrumbs#overrides
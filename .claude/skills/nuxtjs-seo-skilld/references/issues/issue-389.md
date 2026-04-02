---
number: 389
title: "fix: Description set by`useServerSeoMeta` gets overwritten by site description"
type: bug
state: closed
created: 2025-01-29
url: "https://github.com/harlan-zw/nuxt-seo/issues/389"
reactions: 2
comments: 2
labels: "[bug]"
---

# fix: Description set by`useServerSeoMeta` gets overwritten by site description

###  The bug

When using `useServerSeoMeta`, the description doesnt get set:

```ts
useServerSeoMeta({
  title: 'title mainpage',
  description: 'description mainpage',
});
```

Instead it is always set (overwritten?) by what is set in `nuxt.config.ts` site config:

```ts
  site: {
    url: 'https://nuxtseo.com',
    name: 'Some cool reproduction repo :)',
    description: 'Description from nuxt.config.ts',
  },
```

Result:

<img width="543" alt="Image" src="https://github.com/user-attachments/assets/58c50be5-e3e2-4671-a5ae-75e91a7a5b78" />

###  To reproduce

https://stackblitz.com/edit/nuxt-starter-tcq8ttrk?file=nuxt.config.ts,pages%2Findex.vue

###  Additional context

...

---

## Top Comments

**@harlan-zw** [maintainer]:

Thanks for the detailed issue.

So the issue is that the SEO Utils plugin will insert your site config as low-priority head tags in both the server and client side. When you use `useServer*` it will only set it server side, any client side calls will overwrite it.

Unhead itself could in _theory_ fix this by keeping track of SSR tag priorities, I may explore it as part of the v2 https://github.com/unjs/unhead/issues/395. Keep in mind v2 may also deprecate `useServer*` composables as the DX around them is confusing and the optimization is not really worth it.

...

**@MickL**:

The same occurs when using `@nuxtjs/i18n`. It ALWAYS overwrites the description set by `useServerSeoMeta()`, but only on client, not on SSR:

en.ts:

```ts
export default defineI18nLocale(async (locale) => ({
  nuxtSiteConfig: {
    description:
      'This is the default site description',
  },
}));
```

some-page.vue:

```vue
<script setup lang="ts">
useServerSeoMeta({
  description: 'This gets overwritten on client',
});
</script>
```

- Will render on SSR: 'This gets overwritten on client'
- Then client replaces with: 'This is the default site description'

...
---
number: 34754
title: Reload page with NuxtLink
category: Questions
created: 2026-04-01
url: "https://github.com/nuxt/nuxt/discussions/34754"
upvotes: 1
comments: 1
answered: true
---

# Reload page with NuxtLink

I want to reload the page when clicking a NuxtLink that points to the current page. Is this somehow supported?

---

## Accepted Answer

Ah right, you want it conditional. You can handle that with a click handler that checks the current route:

```vue
<NuxtLink :to="link" @click.native="handleClick">
  {{ label }}
</NuxtLink>
```

```js
const route = useRoute();

function handleClick(e) {
  if (route.path === link) {
    e.preventDefault();
    reloadNuxtApp();
  }
  // otherwise NuxtLink handles normal navigation
}
```

`reloadNuxtApp()` is a Nuxt composable that does a clean reload. If you just need to re-fetch data without a full page reload, `refreshNuxtData()` might be a lighter option.
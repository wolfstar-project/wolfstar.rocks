---
number: 34688
title: Browser autofill is lost after SSR hydration
category: Questions
created: 2026-03-25
url: "https://github.com/nuxt/nuxt/discussions/34688"
upvotes: 2
comments: 3
answered: true
---

# Browser autofill is lost after SSR hydration

When using a component that binds `:value="modelValue"` on a native input, browser-autofilled values are wiped once Nuxt hydrates the page.

**Behavior**

On a login page, the browser autofills email and password. After hydration completes, both fields are cleared.

The same component works fine in a Vue SPA — autofill is not affected because there is no hydration step.

**Reproduction**
<img width="583" height="471" alt="image" src="https://github.com/user-attachments/assets/2b27637a-578e-4eb9-9caf-599bd1e2f020" />

https://stackblitz.com/~/github.com/praveshishere/vee-field-autofill-loss-reproduction

Is this expected behavior during hydration?

---

## Accepted Answer

@prince-kunwar-xcelore

> I'm not exactly sure how to achieve that, could you please share an example

Sure. Here are two approaches:

**Option A: `<ClientOnly>` (simplest, recommended for login forms)**

Skip SSR entirely for the form. No hydration = no overwrite. Login forms don't need SEO anyway:

```vue
<template>
  <ClientOnly>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" autocomplete="email" />
      <input v-model="password" type="password" autocomplete="current-password" />
      <button type="submit">Login</button>
    </form>
    <template #fallback>
      <div>Loading form...</div>
    </template>
  </ClientOnly>
</template>
```

**Option B: Read DOM value back after mount**

If you need SSR for the form, read the autofilled value from the DOM after hydration. The key is `requestAnimationFrame` -- some browsers/password managers autofill *slightly after* `onMounted`:

...
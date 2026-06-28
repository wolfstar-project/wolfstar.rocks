---
number: 733
title: Component not being resolved during tests
category: "Q&A"
created: 2024-01-24
url: "https://github.com/nuxt/test-utils/discussions/733"
upvotes: 2
comments: 1
answered: false
---

# Component not being resolved during tests

Hi,

I've been using the test-utils for a little bit now, and I'm adding it to a new nuxt project that uses a component library that gets installed as a plugin. However when I'm mounting the App in a test it's telling me it cannot resolve the component.

`[Vue warn]: Failed to resolve component: q-container`

These components work just fine when I actually run the app without any console log errors.

My plugin is installed via:

```js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(q)
})
```

and the test:

```ts
import {describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from '~/app.vue'

describe('Private pages', async (): Promise<void> => {

  it('protects private page', async (): Promise<void> => {
    const component = await mountSuspended(App, { route: '/private-page' })
    expect(component.html()).toContain('Must login')
  })

})
```...

---

## Top Comments

**@patrickyue**:

add 
{ route: '/private-page' } =>
{ route: '/private-page',
  global: {
   q-container: 'your q-container here'
  }
 } 

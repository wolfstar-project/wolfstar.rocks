---
number: 705
title: How do I test whether the route redirects the page correctly?
category: "Q&A"
created: 2024-01-15
url: "https://github.com/nuxt/test-utils/discussions/705"
upvotes: 2
comments: 1
answered: false
---

# How do I test whether the route redirects the page correctly?

I have a component that should jump to a certain route when it fires the enter event, how do I test this?
```ts
it('When the value is address, redirects to "/address"', async () => {
    const component = await mountSuspended(SearchHash, {
      props: {
        modelValue: '0x1D877C9624697cE952914BD2D1a3859787534777',
      },
    })

    await component.find('input').trigger('keyup.enter')

    // Wait for Vue to update the DOM
    await nextTick()

    expect(useNuxtApp().$router.currentRoute.value.path).toBe(
      '/address/0x1D877C9624697cE952914BD2D1a3859787534777',
    )
   // useNuxtApp().$router.currentRoute.value.path is `/`
  })
```

---

## Top Comments

**@henritoivar**:

I think it's a bug: https://github.com/nuxt/test-utils/issues/668
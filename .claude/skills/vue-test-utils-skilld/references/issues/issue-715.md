---
number: 715
title: "feature: allow stubbing components by definition, not by name"
type: feature
state: open
created: 2021-06-30
url: "https://github.com/vuejs/test-utils/issues/715"
reactions: 4
comments: 5
labels: "[enhancement]"
---

# feature: allow stubbing components by definition, not by name

`stubs` has an important limitation for years - you can't stub anonymous component. Let me show that in code:

```js
const AnonymousComponent = { template: '<div>anonymous</div>' }
const Component = {
  computed: {
    cmp() {
      return AnonymousComponent;
    }
  },
  template: '<div><component :is="cmp" /></div>',
}

const wrapper = mount(Component, {
  global: {
    stubs: {
      // How do I stub AnonymousComponent?
    }
  }
})
 ```

If you feel that this is rare use-case, it will come quite frequent when all fancy `setup()` / `<script setup>` things will come in play:

```js
const AnonymousComponent = { template: '<div>anonymous</div>' }
const Comp = {
  render() {
    return h(AnonymousComponent)
  }
}

const wrapper = mount(Comp, {
  global: {
    stubs: {
       // How do I stub AnonymousComponent?
    }
  }
})
```...

---

## Top Comments

**@freakzlike** [maintainer] (+1):

I currently have a util to stub a component but render the slots and also with slot data.
Here I have a quick example:
```vue
<template>
  <BigLayout>
    <template #header="{ toolbar }">
      {{ toolbar ? 'Header in toolbar' : 'Header not in toolbar' }}
    </template>
    
    <span>Some Content</span>
  </BigLayout>
</template>
```

I want to stub the `BigLayout` but still render the header slot with some data.

With the new stub definition we could implement this and be able to add more enhancement to the stubs:
```ts
const wrapper = mount(Comp, {
  global: {
    stubs: [
      {
        stub: true,
        component: BigLayout,
        scopedSlots: {
          header: { toolbar: true }
        }
      }
    ]
  }
})
```...

**@lmiller1990** [maintainer]:

I personally have no idea how useful this would be for the majority of users, but since it's not a breaking change, I don't have anything against it. I agree "just add a name" is not a very good solution. 

The only real consideration is here is the complexity- do you see 1) significant difficultly in implementing or 2) unsolvable edge cases?

**@xanf** [maintainer]:

> I personally have no idea how useful this would be for the majority of users, but since it's not a breaking change, I don't have anything against it. I agree "just add a name" is not a very good solution.
> 
> The only real consideration is here is the complexity- do you see 1) significant difficultly in implementing or 2) unsolvable edge cases?

No, actually I have a working prototype and it does not bring any complexity while really solving important pain points for shallow users. I'll open PR within couple of days
---
number: 848
title: RouterLinkStub doesn't support scoped slot used with `custom` prop
type: feature
state: closed
created: 2021-08-10
url: "https://github.com/vuejs/test-utils/issues/848"
reactions: 7
comments: 4
labels: "[enhancement]"
---

# RouterLinkStub doesn't support scoped slot used with `custom` prop

The RouterLink component in VueRouter supports a `custom` prop that enables use of a scoped slot (https://router.vuejs.org/api/#v-slot-api-3-1-0). It can be used to create custom link element like:

```html
<router-link
  to="/about"
  custom
  v-slot="{ href, route, navigate, isActive, isExactActive }"
>
  <NavLink :active="isActive" :href="href" @click="navigate"
    >{{ route.fullPath }}</NavLink
  >
</router-link>
```

Testing a component that uses this feature using the `RouterLinkStub` provided by VTU causes an error because no value is available to the scoped slot:

`TypeError: Cannot destructure property 'href' of 'undefined' as it is undefined.`

I fixed this in my broken test by copying RouterLinkStub and passing some dumb values through the scoped slot in the render function:

```js
const RouterLinkStub = defineComponent({
  name: 'RouterLinkStub',
  props: ['to'],

  render() {
    return h('a', undefined, this.$slots?.default?.({
      href: '/places',
      navigate: () => {},
      isActive: false,
    }));
  },
});
```

I wonder if something similar would be a useful addition to the provided stub in VTU?

---

## Top Comments

**@lmiller1990** [maintainer] (+1):

I think `RouterLinkStub` should be as similar as possible to the real router link - so yeah, I think this would be useful.

**@aethr** (+1):

Great, I'll try to throw a PR together this weekend.

**@aethr**:

Hi @thimonwentink I haven't made any progress on this, but I'd be happy to pick it back up if it would be helpful to others.

One thing I found that made it challenging is that my custom mock above makes it easy for me to return specific values for things like `href`, `route`, `isActive` etc for circumstances where that's important. Making a generic `RouterLinkStub` would probably make this hard.

However, in those cases users can just create their own stub like mine above. As long as people understand that the generic `RouterLinkStub` probably isn't going to return much of use in the scop...
---
number: 845
title: Behavior of global.components is confusing
type: other
state: open
created: 2021-08-09
url: "https://github.com/vuejs/test-utils/issues/845"
reactions: 0
comments: 6
labels: "[discussion]"
---

# Behavior of global.components is confusing

I'm struggling to understand the reasoning, why `global.components` perform two things simultaneously:
* registers global components (this is perfectly fine)
* acts as `global.stubs`, but just for component we are mounting

Second one is provided by this piece of code inside `mount`: 
```js
  if (isObjectComponent(component)) {
    component.components = { ...component.components, ...global.components }
  }
```

where `global.components` effectively overwrite local components.

I find this behavior super-confusing:
* now we have two approaches for stubbing components, and one of them (via `global.components`) will work only for components, who use Options API
* relationship between `global.stubs` and `global.components` becomes hard-to-explain

For example this test looks ...
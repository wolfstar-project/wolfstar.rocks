---
number: 2333
title: "Bug: Props in child component defined in mixin are missing with `shallowMount` on @vue/compat"
type: bug
state: open
created: 2024-02-09
url: "https://github.com/vuejs/test-utils/issues/2333"
reactions: 0
comments: 5
labels: "[bug]"
---

# Bug: Props in child component defined in mixin are missing with `shallowMount` on @vue/compat




**Describe the bug**
With `shallowMount` on Vue 3 + @vue/compat, properties of a child component are undefined when using them through a mixin.

If the property is moved from the mixin directly to the component, then the property is defined.

Also if the `shallowMount` is switched to `mount`, the property is defined.


**To Reproduce**

I created a demo repo where this issue can be reproduced, with tags for various working and not working states.  It includes the following important files:
* Parent Component: App.vue
* Child Component: [HelloWorld.vue](https://github.com/cody-collins/vue-compat-mixin-de...
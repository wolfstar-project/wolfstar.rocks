---
number: 798
title: How to test teleport, if subcomponents not a vue component
type: feature
state: closed
created: 2021-07-27
url: "https://github.com/vuejs/test-utils/issues/798"
reactions: 3
comments: 30
labels: "[enhancement, discussion]"
---

# How to test teleport, if subcomponents not a vue component

I have a vue component like this
```
<template>
  <teleport to="body">
     <div class="hello">
    </div>
  </teleport>
</template>
```
It is different from https://next.vue-test-utils.vuejs.org/guide/advanced/teleport.html
I can use document.body.querySelect('.hello'), it is work.
but wrapper.find or wrapper.findComponent, they are not work.
so, how can i test this component, it is a same question in stackoverflow https://stackoverflow.com/questions/66923194/how-to-make-vue3-test-utils-work-with-teleport
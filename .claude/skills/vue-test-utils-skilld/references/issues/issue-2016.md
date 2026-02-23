---
number: 2016
title: "Bug: isVisible weird behavior for 2.3.2 version"
type: bug
state: closed
created: 2023-03-27
url: "https://github.com/vuejs/test-utils/issues/2016"
reactions: 2
comments: 10
labels: "[bug]"
---

# Bug: isVisible weird behavior for 2.3.2 version

**Describe the bug**
I have been using version 2.2.6 for a while and it works great then I tried to update this module to 2.3.2 and got the issue with `isVisible` function behavior. As provided below, after accessing `isVisible` for first time it's value will not be changed later even the virtual DOM has been updated correctly.

**To Reproduce**
This is the component
```
<template>
  <div v-show="show">
    <span />
    <button @click="onClick"></button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const show = ref(true)

const onClick = () => {
  show.value = !show.value
}

</script>
```
This is the test
```
import { mount } from '@vue/test-utils';
import check from './check.vue'

test('isVisible', async () => {
  const wrapper = mount(check)
  expect(wrapper.find('span').isVisible()).toBe(true)
  await wrapper.find('button').trigger('click')
  console.log("***> wrapper", wrapper.html())
  // this value will always be true, but if I remove the isVisible code above it will be false.
  expect(wrapper.find('span').isVisible()).toBe(false)
})
```...
---
number: 2119
title: "Feature request: global.mocks to also mock into the script setup, not just the template"
type: other
state: open
created: 2023-07-03
url: "https://github.com/vuejs/test-utils/issues/2119"
reactions: 0
comments: 15
labels: "[discussion]"
---

# Feature request: global.mocks to also mock into the script setup, not just the template

I am coding with Nuxt and would like to component test following component:

```
<script setup lang="ts">
import { ref } from 'vue'
const hello = ref('hello')

function clicked() {
  //@ts-ignore For example Nuxt will inject these kinds of global functions
  $fetch('http://www.example.com').then((response : any) => {
    hello.value = response.data
  })
}

</script>

<template>
  <button @click="clicked">{{ hello }}</button>
  
  
</template>

```

The problem is the `$fetch` call that is with Nuxt freely available to use in the component. I would like to mock the `$fetch` method.

The test would then be like this:
```
  it('mocks a global function used in a script setup', async () => {
    const wrapper = mount(ScriptSetupWithGlobalFunction, {
      global: {
        mocks: {
          $fetch: async (url) => ({ data: 'mocked' })
        }
      }
    })
    expect(wrapper.text()).toContain('hello')
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('mocked')
  })
```...
---
number: 1869
title: "Bug: Mocking not working when setup() is defined"
type: bug
state: closed
created: 2022-11-16
url: "https://github.com/vuejs/test-utils/issues/1869"
reactions: 3
comments: 18
labels: "[bug]"
---

# Bug: Mocking not working when setup() is defined




**Describe the bug**
I'm trying to mock the vuei18n $t. But this is not working when using the setup composition api. 
When disabling the setup, it works as expected. I also tried with other function names like $test. 
Strange thing is, when using a name without the dollar sign, it also works just normal. 

**To Reproduce**

index.vue
```
<template>
    <div> {{ $t('hello') }}</div>
</template>
<script>
  export default {
    setup(){
        return {} // will not work
    },
  }
</script>
```

test file
```
import { config, mount } from '@vue/test-utils'
import Index from './index'

config.global = {
    mocks: {
        $t: (msg) => msg
    }
}

describe ('Index Tests', () => {
     it ('should mount without crashing', () => {
         const wrapper = mount(Index)
         expect(wrapper).toBeTruthy();
     })
});

```...

---

## Top Comments

**@cexbrayat** [maintainer] (+4):

I _may_ have found a way to make this use-case work with Vue v3.2.45
Once #1871 is merged and released, you should be able to upgrade to the latest version of Vue and VTU

**@cexbrayat** [maintainer] (+1):

@JeremCafeyn Happy to hear that 

For global mocks, can you provide us a small repro online using https://stackblitz.com/edit/vitest-dev-vitest-qoiwy3?file=package.json&initialPath=__vitest__ ? I'll take a look to check if this is a VTU issue.

**@cexbrayat** [maintainer]:

@JeremCafeyn If you use `"@vue/test-utils": "2.2.4",` in package.json, then the tests succeed (Stackblitz uses v2.2.3 in your example I think)
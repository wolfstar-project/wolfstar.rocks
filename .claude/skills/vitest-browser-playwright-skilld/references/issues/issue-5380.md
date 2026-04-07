---
number: 5380
title: Debugger in vs-code does not stop at breakpoint but elsewhere
type: question
state: open
created: 2024-03-13
url: "https://github.com/vitest-dev/vitest/issues/5380"
reactions: 8
comments: 31
labels: "[help wanted]"
---

# Debugger in vs-code does not stop at breakpoint but elsewhere

### Describe the bug

In vanilla project with vue3 + vitest + @testing-library/vue + node 18.18.2 or 20.11.1, setting and debugging breakpoints in vs-code on windows 11 does not work as expected. Debugger stops at wrong location. I am using vue single file components ( aka .vue files )

Seems to be transpiling and/or sourcemap issue. 

The issue disappears when removing  section in .vue file

### Reproduction

1. Create any vanilla vue project with simple single file component which contains all sections: template / script / style
2. Write a test with @testing-library/vue which is testing this component
3. Set a breakpoint within a .vue file
4. Run the test and watch where debugger stops
Result: Debugger stops at wrong line
Expected: Debugger should stop at correct line

Issue goes away when removing  section in .vue file

Example file `SimpleComponent.vue`

```vue
<template>
  <div>Hi {{ name }}</div>
  <div>Good</div>
</template>
<script setup>
import { ref } from 'vue'
const name = ref("Peter")
console.log("Nothing special") // set breakpoint here
</script>
<style>
.useless {
  color: green;
}
</style>
```

Example `simple.spec.js`

```javascript
import { test } from 'vitest'
import { render } from '@testing-library/vue'
import SimpleComponent from './components/SimpleComponent.vue'

test("Component", () => {
  const renderResult = render(SimpleComponent)
  renderResult.findByText("mymessage")
})
```...
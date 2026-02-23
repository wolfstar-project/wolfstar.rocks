---
number: 2257
title: "Bug: `setData()` incorrectly sets object prototype methods as keys"
type: bug
state: closed
created: 2023-11-24
url: "https://github.com/vuejs/test-utils/issues/2257"
reactions: 3
comments: 4
labels: "[bug, good first issue]"
---

# Bug: `setData()` incorrectly sets object prototype methods as keys




**Describe the bug**

Using `setData()` with an object is causing Object prototype methods to be set as keys on the object.

**To Reproduce**


Stackblitz isn't loading for me. But here is hopefully a clear example:

```js
const wrapper = mountFunction()
expect(wrapper.vm.filters).toEqual({
  'workflow state': [],
  'task state': [],
}) // ✔
expect(Object.keys(wrapper.vm.filters)).toEqual([
  'workflow state',
  'task state',
]) // ✔

await wrapper.setData({
  filters: {
    'workflow state': [],
    'task state': [],
  }
})
expect(Object.keys(wrapper.vm.filters)).toEqual([
  'workflow state',
  'task state',
]) // ✖
```...

---

## Top Comments

**@Haberkamp** (+3):

I'll create a PR for that issue during next days.

**@cexbrayat** [maintainer]:

Hi @MetRonnie 

Interesting. You're probably right that this is a regression from #2166

Would you like to open a PR to fix this? We would gladly review and merge it.


**@cexbrayat** [maintainer]:

No worries, maybe someone will pick it up.
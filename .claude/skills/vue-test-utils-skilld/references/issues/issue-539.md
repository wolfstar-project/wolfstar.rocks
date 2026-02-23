---
number: 539
title: How to set data with the Composition API ?
type: question
state: closed
created: 2021-04-18
url: "https://github.com/vuejs/test-utils/issues/539"
reactions: 4
comments: 8
labels: "[question]"
---

# How to set data with the Composition API ?

As the documentation says here the `setData` method does not modify composition API setup data. So don't exist a way to do it when using the composition API ? I'm searching in the documentation for a while and haven't found a solution.

Example:
```js
const wrapper = mount(Calculator);
await wrapper.setData({ memory: "5 + 9" });

expect(wrapper.html()).toContain("5 + 9");
```

The example above works fine with the options API, but with the composition API the `setData` returns this error:
```
TypeError: Cannot add property memory, object is not extensible

```

---

## Top Comments

**@lmiller1990** [maintainer] (+13):

Neat calculator!

Here are some ideas. I have *two* suggestions. This is really just how I like to code, everyone has their own approach to this sort of thing. 

## Option 1: Separate logic with a composable

From what I can see you are trying to test `calculateResult`, `eraseLastDigit` etc. One option would just be to move these out of `setup`  and allow them to receive arguments. You could make a composable:

...

**@lmiller1990** [maintainer] (+5):

What are you expecting to happen? Can you share `Calculator.vue`?

If you are expecting to set the value of `ref` declared in `setup`, this will not work - `setData` only works with `data`. There isn't a good way to modify a value inside a function (like `setup`). 

For `setup`, I'd generally just recommend interacting with the component via `trigger` or passing `props` to test it (like a user would).

**@lmiller1990** [maintainer] (+4):

There is probably some way to make it work using `.vm`, but this is not generally a good idea. `vm` is basically like a private variable - it's not something you can normally access in your application. Test Utils exposes it, but the majority of the time you don't need it.

It's best to test things from the perspective of a user. I am not sure what `Calculator.vue` look likes, but if it had two fields that get added up, what I'd generally recommend is something like:

```js
const wrapper = mount(Calculator)
await wrapper.find('#digit-1').setValue(1)
await wrapper.find('#digit-2').setValue(6)
await wrapper.find('#calculate').trigger('click')
expect(wrapper.find('#result').text()).toContain('7')
```...
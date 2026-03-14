---
number: 1665
title: "Bug: Reactivity issues with @vue/compat"
type: bug
state: closed
created: 2022-07-15
url: "https://github.com/vuejs/test-utils/issues/1665"
reactions: 3
comments: 7
labels: "[bug]"
---

# Bug: Reactivity issues with @vue/compat

**Describe the bug**
Reactivity does not seem to work when using the vue compat build.

For example all these tests will work with vue 3, but all will fail with @vue/compat:

...

---

## Top Comments

**@lmiller1990** [maintainer]:

Curious, what if you try using `flushPromises`?

```js
import { flushPromises } from '@vue/test-utils'


    const wrapper = mount(TestAsync, {
        propsData: { done: renderedAsyncResolve }
    });

    await renderedAsync;
    await flushPromises()
    wrapper.vm.$nextTick(() => {
        expect(wrapper.html()).toMatch('async');
        done();
    });
```

Is this just a race condition?


**@lmiller1990** [maintainer]:

Interesting. I did `cd node_modules/@vue/test-utils/dist` and modified `vue-test-utils.cjs.js` to do `require('@vue/compat`) instead of `require('vue')` and it actually works as expected, albeit some warnings.

So... doesn't this mean the alias is not working as expected? I cannot help but think this is outside of Test Utils. We cannot change the import dynamically here - this would be up to the bundler or runner or whatever is executing the code.

I'd be curious if Jest has the same problem. I tried running your reproduction with Jest but couldn't get it working (`moduleNameMapper` should...

**@lmiller1990** [maintainer]:

Edit: got it work with Jest as well, I configured `moduleNameMapper` in `package.json` under `jest`. https://github.com/lmiller1990/jest-vtu-compat-error

cc @Weetbix - this seems like a Vite bug?
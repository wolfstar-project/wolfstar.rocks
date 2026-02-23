---
number: 2430
title: "Bug: Transition - [Vue warn]: Wrong type passed as event handler to xxx - did you forget @ or : in front of your prop?"
type: bug
state: closed
created: 2024-05-06
url: "https://github.com/vuejs/test-utils/issues/2430"
reactions: 2
comments: 6
labels: "[bug]"
---

# Bug: Transition - [Vue warn]: Wrong type passed as event handler to xxx - did you forget @ or : in front of your prop?

**Describe the bug**

Vue warnings are present in the stderr of Vitest.
These Vue warnings are not present in the Browser.

...

---

## Top Comments

**@cexbrayat** [maintainer] (+2):

Hi @wouterkroes 

Thanks for the repro. The warning is because the built-in transition stub in VTU is really simple and doesn't handle these hooks.

You have 3 possible solutions that can be used immediatly:
- you can turn off the auto stubbing by using `const wrapper = mount(HelloWorld, { global: { stubs: { transition: false } } })`
- you can also define your own transition stub that can handle these hooks if you need to
- you can spy the warning in the test to silence it

We could maybe improve the built-in stub. I'm wondering if this code https://github.com/vuejs/test-utils/blob/93...

**@cexbrayat** [maintainer]:

@wouterkroes Thanks for the PR

Before I merge it, I think the warning is gone with the latest VTU release we did today.
Can you try with VTU v2.4.6 and let me know if you still see the warnings? (it looks like the warning is gone on your stackblitz repro when I upgrade to v2.4.6)

**@cexbrayat** [maintainer]:

Yeah I'm the one who fixed it, and I had already forgotten it. Let's close this then!
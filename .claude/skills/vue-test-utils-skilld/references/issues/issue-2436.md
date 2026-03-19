---
number: 2436
title: "Bug: TypeScript errors with Vue generic components"
type: bug
state: open
created: 2024-05-24
url: "https://github.com/vuejs/test-utils/issues/2436"
reactions: 13
comments: 3
labels: "[bug]"
---

# Bug: TypeScript errors with Vue generic components

### Describe the bug

I get TypeScript errors when trying to find a component that has a generic with `findComponent`.

### Steps to reproduce

I have made a minimal reproduction. Here a small component is created with a generic, called `Select.vue`. I use the Select component in `App.vue`.

1. Open minimal reproduction
2. You should now see `app.spec.ts`. This is the test file where the TypeScript errors occur.
3. Run `npm run type-check` in the terminal below the file editor.
4. You should now see two TypeScript errors.

I think the two errors are related. They are only thrown if the component has a generic.

### Expected behaviour

It should not throw these errors. The `findComponent` for the component with the generic, should return a `VueWrapper`.

### Actual behaviour

It somehow returns a `WrapperLike`, instead of the expected `VueWrapper`.


---

## Top Comments

**@cexbrayat** [maintainer]:

@thimonwentink Thanks for the repro.

@pikax What do you think about this?

**@pikax** [maintainer]:

> @pikax What do you think about this?

@johnsoncodehk should be able to help more on this specific issue

**@thimonwentink**:

Maybe it is the same issue as described in https://github.com/vuejs/test-utils/issues/2254, but I wasn't sure.
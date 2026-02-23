---
number: 2294
title: "Bug: Unable to pass props of a unioned type to `mount` since 2.4.2"
type: bug
state: open
created: 2024-01-03
url: "https://github.com/vuejs/test-utils/issues/2294"
reactions: 1
comments: 1
labels: "[bug]"
---

# Bug: Unable to pass props of a unioned type to `mount` since 2.4.2



**Describe the bug**

Starting in 2.4.2 (works in 2.4.1), when passing props to `mount` whose type is a union, a type error is raised.

```
Type '{ foo: string; } | { foo: { bar: string; }; }' is not assignable to type 'VNodeProps & { __v_isVNode?: never; [Symbol.iterator]?: never; } & Record<string, any> & { foo: string; }'.
  Type '{ foo: { bar: string; }; }' is not assignable to type 'VNodeProps & { __v_isVNode?: never; [Symbol.iterator]?: never; } & Record<string, any> & { foo: string; }'.
    Type '{ foo: { bar: string; }; }' is not assignable to type '{ foo: string; }'.
      Types of property 'foo' are incompatible.
        Type '{ bar: string; }' is not assignable to type 'string'.(2322)
```...
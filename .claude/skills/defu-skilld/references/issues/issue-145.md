---
number: 145
title: Symbol keys are not merged
type: bug
state: open
created: 2025-02-20
url: "https://github.com/unjs/defu/issues/145"
reactions: 1
comments: 0
labels: "[bug]"
---

# Symbol keys are not merged

### Environment

$ node -v
v20.13.1

### Reproduction

```js
const [a, b, c] = [Symbol("a"), Symbol("b"), Symbol("c")];
const result = defu({ [a]: "a", [c]: ["a", "b"] }, { [a]: "bbb", [b]: "c", [c]: ["c", "d"] });
expect(result).toEqual({ [a]: "a", [b]: "c", [c]: ["a", "b", "c", "d"] });
```
```diff
AssertionError: expected { [Symbol(a)]: 'bbb', …(2) } to deeply equal { [Symbol(a)]: 'a', …(2) }

- Expected
+ Received

  Object {
-   Symbol(a): "a",
+   Symbol(a): "bbb",
    Symbol(b): "c",
    Symbol(c): Array [
-     "a",
-     "b",
      "c",
      "d",
    ],
  }
```

### Describe the bug

Symbol keys are not iterated over the base object, but the other objects use `Object.assign` which _does_ copy symbol keys.

### Additional context

_No response_

### Logs

```sh

```
---
number: 90
title: clone support
type: other
state: open
created: 2023-04-17
url: "https://github.com/unjs/defu/issues/90"
reactions: 0
comments: 0
---

# clone support

Currently, we only create new object/array when both defaults and current value have a value while if only there is value here we set it.

I am thinking to introduce a new option to `createDefu(merger, { clone: true }` to enable cloning behavior.

An alternative would be using structuredClone however i think it also copies the values (non object/array) and taking more memory also not available in (at least Node) workers.
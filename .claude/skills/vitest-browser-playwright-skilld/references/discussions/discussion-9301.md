---
number: 9301
title: "Should we be using `expect.fail` or `assert.fail`?"
category: "Q&A"
created: 2025-12-18
url: "https://github.com/vitest-dev/vitest/discussions/9301"
upvotes: 1
comments: 1
answered: true
---

# Should we be using `expect.fail` or `assert.fail`?

The docs have an entry for `assert.fail` but not for `expect.fail`.

It seems that both of these definitions come from `@types/chai` and have similar behaviours (in the limited testing I have conducted). However, `assert.fail` also has a nicer docstring that says it's Node.js assert module-compatible.

My main questions are:
1. Is there a functional difference between the two?
2. Should we document `expect.fail` if it provides the same functionality, as most of the tests I have written don't use assert (so it might help reduce imports)

---

## Accepted Answer

**@sheremet-va** [maintainer]:

We should probably document chai's API. For now, we only document Jest-style API. 

Functionally, `assert.fail` and `expect.fail` are identical, they just throw an error.
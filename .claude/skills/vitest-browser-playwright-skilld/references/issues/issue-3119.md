---
number: 3119
title: Detect hanging async operations
type: feature
state: closed
created: 2023-04-02
url: "https://github.com/vitest-dev/vitest/issues/3119"
reactions: 26
comments: 9
labels: "[enhancement, pr welcome, p2-nice-to-have]"
---

# Detect hanging async operations

### Clear and concise description of the problem

As a developer using Vitest I want to be able to detect if an async operation that was started during a test case hasn't completed at the end of that test so that I can catch hanging promise bugs. I am willing to contribute a PR if there is interest.

### Suggested solution

We could provide a `--detect-async-leaks` flag to turn on this type of detection. Node.js's builtin `async_hooks` module provides the necessary functionality

### Alternative

Alternatively, we could make this the default and provide an option to turn it off.

### Additional context

For example in Deno the following test fails with the message "Test case is leaking async ops":

```js
Deno.test("hanging interval", () => {
  setInterval(() => {}, 1000);
});
```

This helped me catch a few particularly hard to find bugs in a streaming form data parser I was working on. Web streams are particularly prone to this type of error but there are many other cases where such detection would be useful.

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that request the same feature to avoid creating a duplicate.

---

## Top Comments

**@AriPerkkio** [maintainer] (+6):

This will be possible after https://github.com/vitest-dev/vitest/pull/8705

**@sheremet-va** [maintainer]:


> node:test & Mocha also detect those cases (without any particular CLI option or config)

Cannot confirm that this is true. In mocha I get the error "after tests are done" which does change `processExit`, but doesn't print any information about leaking. `node:test` just hangs for me (probably because of `setInterval`).

> `mocha`



> `node:test` (Node 20.11.0)




**@sheremet-va** [maintainer]:

Sounds like a nice feature. We can probably extend runner somewhere here:

https://github.com/vitest-dev/vitest/blob/7006bb367494536e2ecf762a5636e509734e43e5/packages/vitest/src/runtime/runners/test.ts#L54

Since this is Node.js-only feature, we would need to extend this class in a separate file so as not to break browser runner which also relies on this class.

In Node.js it is imported here:

https://github.com/vitest-dev/vitest/blob/7006bb367494536e2ecf762a5636e509734e43e5/packages/vitest/src/runtime/runners/index.ts#L15
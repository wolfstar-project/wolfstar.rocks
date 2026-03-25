---
number: 9734
title: Virtual module mocking behavior in Vitest 4
category: "Q&A"
created: 2026-02-24
url: "https://github.com/vitest-dev/vitest/discussions/9734"
upvotes: 1
comments: 1
answered: false
---

# Virtual module mocking behavior in Vitest 4

_Using a discussion as I'm not sure yet if this is an expected change of behavior, a bug, or just me misusing an API._

In a test file, I have different `describe` blocks where in each of them, I mock a virtual module, e.g. using `vi.doMock()` and mock a function from that module making it return different values.

- In Vitest 3, everything seems to work as expected, and calling some code that uses that virtual module returns the mocked value.
- In Vitest 4, the first mocked value seems to be returned for all tests.

I've carefully read the Vitest 4 migration guide, and specifically the section about "Changes to Mocking", but unless I'm missing something, I don't think any of the listed changes explain this behavior.

I...

---

## Top Comments

**@hi-ogawa** [maintainer]:

I looks like a bit of edge case, but not sure. From a quick look, it would make more sense to do in the following order with "reset" then "mock". Would this work too or also broken?

```js
    vi.resetModules();
    vi.doMock("virtual:test", () => ({ getFirstNumber: () => 2 }));
```
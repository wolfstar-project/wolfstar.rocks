---
number: 9364
title: browser name in Json reporter result
category: "Q&A"
created: 2025-12-30
url: "https://github.com/vitest-dev/vitest/discussions/9364"
upvotes: 1
comments: 1
answered: true
---

# browser name in Json reporter result

Hello, how can i access the broswer name on which test was ran in `JsonAssertionResult`

---

## Accepted Answer

In Vitest, `JsonAssertionResult` intentionally does **not** expose any “browser name” because Vitest itself is **runner-agnostic**. From Vitest’s point of view, tests are executed in a JS runtime, not in a browser identity like “Chrome” or “Firefox”.

So the short answer is:  
**you can’t reliably access the browser name from `JsonAssertionResult`**, because that information is not part of Vitest’s core result model.

But here are the correct ways to approach this depending on what you actually need.

 1. Vitest doesn’t know the browser unless *you* provide it
Vitest only knows about:
- the environment (`node`, `jsdom`, `happy-dom`, etc.)
- the test context you define

Even when running browser tests (via `@vitest/browser` or Playwright), the browser identity lives **outside** `JsonAssertionResult`.

2) If you’re using @vitest/browser, inject the browser name yourself
When running Vitest browser mode, you do know the browser at runtime. The correct pattern is to attach m...
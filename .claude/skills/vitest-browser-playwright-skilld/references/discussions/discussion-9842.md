---
number: 9842
title: Vitest coverage for workerthread files
category: "Q&A"
created: 2026-03-10
url: "https://github.com/vitest-dev/vitest/discussions/9842"
upvotes: 8
comments: 1
answered: true
---

# Vitest coverage for workerthread files

I am working on a uni project and need coverage for my nodeJS project.
When testing code that is only called within a worker thread coverage seems to break.

My tests succeed but when running `vitest run --coverage` all worker thread files aren't shown in the coverage report.

Does anyone now for a work around for this? 
My tests are running inside `node v22.15.0` with `vitest 4.0.6`, and using `@vitest/coverage-v8: "4.0.6"`

P.S. I have seen some similar issues but non of them gave a solution.

Thanks very much 

---

## Accepted Answer

**@AriPerkkio** [maintainer]:

This is not yet possible with Vitest. We have some plans how to implement this though. 
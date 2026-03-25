---
number: 5075
title: "Support hooks in `bench` API"
type: feature
state: closed
created: 2024-01-30
url: "https://github.com/vitest-dev/vitest/issues/5075"
reactions: 25
comments: 1
labels: "[enhancement, feat: benchmark, p2-nice-to-have]"
---

# Support hooks in `bench` API

### Clear and concise description of the problem

`beforeAll`, `afterAll`, `beforeEach` and `afterEach` are not run when using `vitest bench`

### Suggested solution

Support them in the benchmark runner

### Alternative

_No response_

### Additional context

_No response_

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that request the same feature to avoid creating a duplicate.

---

## Top Comments

**@sheremet-va** [maintainer]:

The whole API is being redesigned in https://github.com/vitest-dev/vitest/discussions/7850. Until it's implemented, all benchmark issues are on hold. I recommend following the discussion and giving your feedback there.
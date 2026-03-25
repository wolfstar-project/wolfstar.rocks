---
number: 2740
title: Make the experimental node loader handle CJS to ESM conversion
type: feature
state: open
created: 2023-01-24
url: "https://github.com/vitest-dev/vitest/issues/2740"
reactions: 7
comments: 2
labels: "[enhancement, discussion, p2-nice-to-have]"
---

# Make the experimental node loader handle CJS to ESM conversion

### Clear and concise description of the problem

Some packages export CJS entry points that have bad named exports for the ESM named exports heuristic employed by node. Those work with plain Vite but fail with vitest. (e.g. `lodash`)

To support them you currently need to `deps.inline` them, which also requires inlining any module that transitively imports such problem modules.


### Suggested solution

The experimental node loader can handle such conversion without requiring to inline the entire dependency chain. Similar to how tsx works.

### Alternative

Keep inlining the entirety of such dependency chains, or don't use such named imports from problem packages.

### Additional context

_No response_

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that request the same feature to avoid creating a duplicate.
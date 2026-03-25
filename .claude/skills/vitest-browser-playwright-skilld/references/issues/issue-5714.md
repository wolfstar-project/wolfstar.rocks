---
number: 5714
title: Wrong diff for objectContaining
type: bug
state: open
created: 2024-05-13
url: "https://github.com/vitest-dev/vitest/issues/5714"
reactions: 3
comments: 0
labels: "[p3-minor-bug]"
---

# Wrong diff for objectContaining

### Describe the bug

Same bug just resolved in Jest:

Issue: https://github.com/jestjs/jest/issues/14897

PR: https://github.com/jestjs/jest/pull/15038

### Expected behavior

Message:
      expect(received).toEqual(expected) // deep equality
    
    - Expected  - 2
    + Received  + 2
    
    - ObjectContaining {
    + Object {
        "a": 1,
        "b": 2,
    -   "c": 2,
    +   "c": 3,
      }

### Actual behavior

Message:
      expect(received).toEqual(expected) // deep equality
    
    - Expected  - 2
    + Received  + 3
    
    - ObjectContaining {
    + Object {
    +   "a": 1,
        "b": 2,
    -   "c": 2,
    +   "c": 3,
      }


### Reproduction

...
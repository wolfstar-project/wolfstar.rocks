---
number: 5946
title: Why test.each object-variable for string data type has quotes?
type: other
state: open
created: 2024-06-20
url: "https://github.com/vitest-dev/vitest/issues/5946"
reactions: 13
comments: 0
labels: "[breaking change, p2-nice-to-have]"
---

# Why test.each object-variable for string data type has quotes?

### Describe the bug

Basically https://github.com/jestjs/jest/issues/7689 but for vitest.

When using `test.each` with an array of objects, object properties injected in the test names, are printed within quotes while other data-types like number and boolean are not.

### Reproduction

https://stackblitz.com/edit/vitest-dev-vitest-fbcukv?file=test%2Fbasic.test.ts

### System Info

```shell
System:
    OS: Linux 5.0 undefined
    CPU: (8) x64 Intel(R) Core(TM) i9-9880H CPU @ 2.30GHz
    Memory: 0 Bytes / 0 Bytes
    Shell: 1.0 - /bin/jsh
  Binaries:
    Node: 18.20.3 - /usr/local/bin/node
    Yarn: 1.22.19 - /usr/local/bin/yarn
    npm: 10.2.3 - /usr/local/bin/npm
    pnpm: 8.15.6 - /usr/local/bin/pnpm
  npmPackages:
    @vitest/ui: latest => 1.6.0 
    vite: latest => 5.3.1 
    vitest: latest => 1.6.0
```


### Used Package Manager

npm

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that reports the same bug to avoid creating a duplicate.
- [X] Check that this is a concrete bug. For Q&A open a GitHub Discussion or join our Discord Chat Server.
- [X] The provided reproduction is a minimal reproducible example of the bug.
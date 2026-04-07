---
number: 7708
title: "Module __mocks__ in pnpm monorepo doesn't work for workspace packages"
type: bug
state: open
created: 2025-03-20
url: "https://github.com/vitest-dev/vitest/issues/7708"
reactions: 2
comments: 3
labels: "[p3-minor-bug]"
---

# Module __mocks__ in pnpm monorepo doesn't work for workspace packages

### Describe the bug

We've encountered a problem in our pnpm monorepo when `__mocks__` folder module automocking doen't work for packages that are imported from pnpm workspace rather than npm registry.

When we try to import a package from NPM registry as usual, it works fine, but importing the same package as "workspace:*" in package.json leads to vitest silently ignoring `__mocks__` folder based mocks.

### Reproduction

StackBlitz: https://stackblitz.com/~/github.com/Koka/vitest_pnpm_problem

What you can see there is a tiny pnpm monorepo with three packages: `package_one` - a thing we're importing and mocking, and `package_two` and `package_three` which both import first package and mock it using `__mocks__` folder.

...
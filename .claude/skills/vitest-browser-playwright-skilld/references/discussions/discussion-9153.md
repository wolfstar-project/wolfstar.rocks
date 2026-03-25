---
number: 9153
title: "Vitest ≥ 4.0.4 causes inconsistent mocking behavior on GitHub Actions, while everything passes locally"
category: "Q&A"
created: 2025-12-02
url: "https://github.com/vitest-dev/vitest/discussions/9153"
upvotes: 2
comments: 1
answered: false
---

# Vitest ≥ 4.0.4 causes inconsistent mocking behavior on GitHub Actions, while everything passes locally

Since upgrading from 4.0.4 to 4.0.5+, we’re seeing multiple tests fail only on GitHub Actions.
Locally (macOS, windows, windows+wsl -> linux) everything passes, and even running the exact same Docker image locally does not reproduce the failures.
On CI the failures are frequent but not tied to a single test; different ones fail between runs.

Examples of failures

These errors appear in unrelated tests and seem to involve mocking or module state:

Vue component library (Vue refs mocked):
TypeError: Cannot read properties of undefined (reading 'ref')

Mocked vue-router:
TypeError: Cannot read properties of undefined (reading 'params')

Other cases where mocked modules randomly lose state or return undefined where they shouldn’t.

What we’ve tried

Confirmed Node and pnpm v...

---

## Top Comments

**@hi-ogawa** [maintainer]:

Ci might have less cpu, so it might affect Vitest parallelization and thus some isolation behavior. Can you tweak `maxWorkers` options to match local and CI? https://vitest.dev/config/maxworkers.html#maxworkers
---
number: 9395
title: Options coverage.include and coverage.exclude do not work as expected
type: bug
state: open
created: 2026-01-05
url: "https://github.com/vitest-dev/vitest/issues/9395"
reactions: 2
comments: 5
labels: "[feat: coverage, p3-minor-bug]"
---

# Options coverage.include and coverage.exclude do not work as expected

### Describe the bug

Hello! I am migrating from v3 to v4 and found that new coverage include/exclude logic in v4 does not quite match what was working in v3 and seems like a bug.

### Case 1: I want to include all files, but exclude files from top-level

**Coverage options**:
```ts
coverage: {
      include: [
        // all .js,.ts,.tsx files
        '**/*.ts',
      ],
      exclude: [
        // exclude .ts files for top-level
        '*.ts',
      ],
}
```

**Expected behavior**: files inside folders are included in coverage and files on top-level - are not

**Actual behavior**: all files are not included

...
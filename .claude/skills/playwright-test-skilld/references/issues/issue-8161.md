---
number: 8161
title: "feat: better support for visual regression testing"
type: bug
state: open
created: 2021-08-12
url: "https://github.com/microsoft/playwright/issues/8161"
reactions: 84
comments: 75
labels: "[feature-visual-regression-testing]"
---

# feat: better support for visual regression testing

Playwright Test has a built-in `toMatchSnapshot()` method to power Visual Regression Testing (VRT).

However, VRT is still challenging due to variances in the host environments. There's a bunch of measures we can do right away to drastically improve experience in @playwright/test
- [ ] support for `docker` test fixture to run browsers inside docker image.
- [ ] support for `blur` in matching snapshot to counteract antialiasing
- [x] better UI for reviewing snapshot diffs

Interesting context:
- migration from backstopjs to @playwright/test
---
number: 6265
title: Support visual regression testing in the browser
type: other
state: closed
created: 2024-08-02
url: "https://github.com/vitest-dev/vitest/issues/6265"
reactions: 13
comments: 27
labels: "[feat: browser, p2-nice-to-have]"
---

# Support visual regression testing in the browser

### Clear and concise description of the problem

There is no built-in way to compare images in the browser mode.

### Suggested solution

Implement a snapshot-style assertion to compare previously stored images. I am open to API ideas.

This issue is opened to start a discussion around the topic.

### Alternative

Related: https://github.com/vitest-dev/vitest/discussions/690

### Additional context

Consider using https://github.com/mapbox/pixelmatch as it is small and fast

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that request the same feature to avoid creating a duplicate.

---

## Top Comments

**@sheremet-va** [maintainer] (+1):

> I would like to raise a PR with a proof-of-concept for this, but would first like to make sure that the feature is not completely off the table for Vitest. Could someone advise?

The feature is not off the table. As a possible implementation, we were considering investigating playwright's `toMatchSnapshot`. For now, no one on the team is working on this feature.

**@AriPerkkio** [maintainer]:

I'm not sure if this should be part of the core. Or at least it should be marked as very-very experimental all the time.

Comparing images is very hard. There are companies building products that especially focus on this, and using those can be expensive. Open source tools like `jest-image-snapshot` and `cypress-image-snapshot` (that use `pixelmatch`) are very flaky, especially when comparing images that are generated on different operating systems. For example pixel-by-pixel comparison fails in as simple cases as rendering fonts. 

If we can find a way to implement this confidently then I...

**@m-lyon** (+2):

@herrlegno if you use node polyfills, e.g. via the vite-plugin-node-polyfills plugin, then you should bypass that error. Though, the current outstanding issue with using `jest-image-snapshot` here is the use of `__dirname` as can be seen here, which gives the `ReferenceError: __dirname is not defined` error.




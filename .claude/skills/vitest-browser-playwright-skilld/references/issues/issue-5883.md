---
number: 5883
title: "Browser Mode: Electron support"
type: other
state: open
created: 2024-06-13
url: "https://github.com/vitest-dev/vitest/issues/5883"
reactions: 23
comments: 2
labels: "[feat: browser, p2-nice-to-have]"
---

# Browser Mode: Electron support

### Clear and concise description of the problem

It would be great to have an Electron mode for browser mode so that Electron apps could be tested easily. Currently, to test code that needs to import `electron` (provided by the electron runtime here, I believe), my understanding is it's necessary to either mock `electron` or set up full E2E testing manually, outside of vitest.

I may be able to make a PR for this, with some guidance.

### Suggested solution

Webdriverio and Playwright seem to have some kind of Electron support:

- https://webdriver.io/docs/desktop-testing/electron
- https://playwright.dev/docs/api/class-electron

However I'm not sure if those play nicely with the model of browser mode.

### Alternative

An alternative which would be very useful: to just allow testing the main Electron process code (not testing the renderer or preload code). It may be as easy as allowing to swap `node:vm` for the `electron` executable here in the vite-node runtime, since my understanding is the `electron` exec is just a wrapper around node with `electron` modules injected. It seems like there has been a lot of work put into `vite-node`, so it would be nice to reuse that instead of making an entirely new runner.

### Additional context

Electron was mentioned in #1470 in the context of custom test runners, but I'm not sure if any work specific to electron was done. 

This repo could be useful for making a new runner or modifying the existing: https://github.com/kayahr/jest-electron-runner

### Validations

...

---

## Top Comments

**@charliez0**:

tried to use this so that I can directly test run vitest on electron and use electronAPI but idk how to debug browser lol
```
  test: {
    pool: 'typescript',
  },
```

**@Y2zz**:

this will help me a lot 
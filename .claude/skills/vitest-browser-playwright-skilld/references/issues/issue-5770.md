---
number: 5770
title: Interactivity API for Browser Mode
type: other
state: open
created: 2024-05-24
url: "https://github.com/vitest-dev/vitest/issues/5770"
reactions: 13
comments: 9
labels: "[feat: browser, p2-nice-to-have]"
---

# Interactivity API for Browser Mode

### Clear and concise description of the problem

There are libraries that allow faking events in `jsdom`/`happy-dom` environments (e.g., `@testing-library/user-event`). They are required in Node.js runtime because there is no actual browser, only Web-compatible globals. In Browser Mode, we have access to an actual browser and providers have access to DevTools and Webdriver protocols that could be used to trigger actual events.

### Suggested solution

The `userEvent` API is very well designed and works great with other `@testing-library` packages. Since we already decided to recommend testing-library in browser mode, I think we should provide our own `userEvent` implementation that uses DevTools or Webdriver protocol depending on the provider. 

### Alternative

_No response_

### Additional context

For the `preview` provider, we can use the `userEvent` library directly.

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that request the same feature to avoid creating a duplicate.

---

## Top Comments

**@sheremet-va** [maintainer] (+4):

v2.0.0-beta.11 should have these API implemented (#5882):

- userEvent.click
- userEvent.dblClick
- userEvent.tripleClick
- userEvent.type (supports user-event syntax like `{selectall}`)
- userEvent.clear
- userEvent.tab:

@feryardiant Regarding special key support, probably it doesn't work like documentation says currently. For playwright provider, key mentioned in their doc https://playwright.dev/docs/api/class-keyboard should work. For webdriverio, I'm not sure but probably this https://webdriver.io/docs/api/browser/keys/.

In general, webdriverio also has some issues with `click` event (or any interaction) due to https://github.com/webdriverio/webdriverio/issues/13724. 

If you have a concrete issue and reproduction, please feel free to open a separate issue instead of commenting it here. That would be e...

**@sheremet-va** [maintainer] (+1):

In the latest beta only the click is implemented. There will be a few more APIs from user event before the Vitest 2, but not all of them.

How you implement interaction in the meantime is up to you. You can still use Commands API to communicate with playwright/webdriverio, for example. Or you can use userEvent library directly relying on fake events for now.
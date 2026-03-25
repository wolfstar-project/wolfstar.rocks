---
number: 8190
title: "Interactions API: mouse events"
type: other
state: open
created: 2025-06-19
url: "https://github.com/vitest-dev/vitest/issues/8190"
reactions: 12
comments: 7
labels: "[feat: browser, p2-nice-to-have]"
---

# Interactions API: mouse events

### Clear and concise description of the problem

I built the Neodrag library, which is a draggable library working off of pointer events. I already have tests written for it in Playwright, but playing around with Vitest Browser mode, I want to move to it.

However, vitest doesn't yet have mouse events, like Playwright does. This makes it impossible for me to move to Vitest browser mode.

### Suggested solution

Vitest should implement mouse events as well.

### Alternative

_No response_

### Additional context

_No response_

### Validations

- [x] Follow our Code of Conduct
- [x] Read the Contributing Guidelines.
- [x] Read the docs.
- [x] Check that there isn't already an issue that request the same feature to avoid creating a duplicate.

---

## Top Comments

**@sheremet-va** [maintainer] (+1):

> @shere-met-va I'm really curious to hear the Vitest team's thoughts on adding `mouse` support for Vitest's browser mode. Do you believe the mouse API is too unreliable to be included in `userEvent`, or is it simply not implemented yet? If it's the latter, I'd be happy to submit a pull request to assist!

We don't want to support the same API that playwright has. The idea is to support it via the Pointer API. Having multiple events in the same command call would also be faster than doing `mouse.*` command one by one. Feel free to submit ...

**@ocavue** (+2):

Testing drag-and-drop requires some lower-level methods like `mouse.down()` and `mouse.move()`. The currently existing dragAndDrop Vitest API is not sufficient. One of the reasons, as I quoted from Playwright's documentation:

...

**@ocavue** (+2):

@shere-met-va I'm really curious to hear the Vitest team's thoughts on adding `mouse` support for Vitest's browser mode. Do you believe the mouse API is too unreliable to be included in `userEvent`, or is it simply not implemented yet? If it's the latter, I'd be happy to submit a pull request to assist!
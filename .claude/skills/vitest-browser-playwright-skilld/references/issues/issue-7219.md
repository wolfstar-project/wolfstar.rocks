---
number: 7219
title: add native support for playwright tracing
type: other
state: closed
created: 2025-01-12
url: "https://github.com/vitest-dev/vitest/issues/7219"
reactions: 14
comments: 3
labels: "[feat: browser, p2-nice-to-have]"
---

# add native support for playwright tracing

### Clear and concise description of the problem

As a developer using Vitest, I want to be able to easily enable playwright tracing through config file so that I can use it for debugging both local and CI runs.

CI example: Generate tracing files, upload artifacts to GH actions and generate a trace.playwright.dev link

Local example: Generate tracing files in similar directories to what we currently have for `__screenshots__` but call it `__traces__` instead. Ideally we add a button in vscode extension so we can run `npx playwright show-trace` or open trace.playwright.dev in browser.

And yes, Im interested in submitting a PR for this issue. I already have code implemented in my project so Im hoping it wont be that hard to move it to vitest and add some tests.

### Suggested solution

...

---

## Top Comments

**@sheremet-va** [maintainer]:

> Is there any way of solving this today in userland,? vitest has so much going for it but playwright trace viewer for debugging test errors is unmatched for integration tests

The issue you are commenting literally has a userland solution. You can implement trace viewing with custom commands

**@Georgegriff**:

Is there any way of solving this today in userland,? vitest has so much going for it but playwright trace viewer for debugging test errors is unmatched for integration tests

**@Georgegriff**:

> > Is there any way of solving this today in userland,? vitest has so much going for it but playwright trace viewer for debugging test errors is unmatched for integration tests
> 
> The issue you are commenting literally has a userland solution. You can implement trace viewing with custom commands

You're right I was since able to just about decipher the really unapproachable documentation on the command API and I now understand this example better. 
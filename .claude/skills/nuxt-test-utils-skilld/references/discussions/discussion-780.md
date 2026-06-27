---
number: 780
title: Run Playwright in UI mode
category: "Q&A"
created: 2024-03-15
url: "https://github.com/nuxt/test-utils/discussions/780"
upvotes: 3
comments: 1
answered: false
---

# Run Playwright in UI mode

I'm aware that @danielroe and @mxschmitt are working on something regarding Playwright over at https://github.com/nuxt/test-utils/tree/feat/playwright-runner.

In the meantime I am wondering if one can launch Playwright in UI mode via @nuxt/test-utils? Debugging e2e without a headed browser can be kind of cumbersome. I tried fiddling around with `page.pause` and ` browserOptions.launch.headless = false` but could not get the browser to pause in my test(s).

---

## Top Comments

**@mxschmitt** [maintainer]:

This depends on the work in the linked branch / #776.
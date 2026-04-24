---
number: 2497
title: "[Feature] Support browser zoom"
type: other
state: open
created: 2020-06-08
url: "https://github.com/microsoft/playwright/issues/2497"
reactions: 144
comments: 24
labels: "[P3-collecting-feedback]"
---

# [Feature] Support browser zoom

(Logging a feature request – please vote if your scenario needs it and help us prioritize!)

To support accessibility requirements, web developers often need to test their application on higher zoom levels like 200%. Relevant WCAG doc: "Ensuring that there is no loss of content or functionality when the text resizes and text containers do not change their width".

To support this, the Playwright API needs to be able to emulate a higher zoom level, preferably at the browser context level.

---

## Top Comments

**@JoelEinbinder** (+16):

I think this is doable today with setting the device pixel ratio. But its not a great api. We should match the buttons you get in a browser. I think something like `await page.zoom(1.5)` to zoom to 150% would be nice.

Chromium will remember the zoom for an origin. Is this important behavior? If so, we'd need to tap into the real browser zoom instead of just device pixel ratio.

**@maustin** (+2):

(This comment is related to the bug originally reported here: https://github.com/microsoft/playwright/issues/2768)

I've been doing some digging into the issue of Playwright clicks not happening correctly when page zoom is not 100%.
It actually looks like Playwright is doing everything correctly on its side. Calling `elementHandle.boundingBox()` returns a rect with the expected values. But calling `elementHandle.click()`, while it does pass actionability checks, fails to click on the element. The reason I think is with Chromium's mouseEvent handler. It appears Chromium is expecting _non-sca...

**@ronvoluted** (+1):

Very desirable. Adding to research, this attempt isn't able to emulate zoom either:

```js
  await page.keyboard.down('Control');
  
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('+');
  }
  
  await page.keyboard.up('Control');
```
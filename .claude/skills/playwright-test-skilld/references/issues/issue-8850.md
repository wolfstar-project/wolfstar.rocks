---
number: 8850
title: "[BUG] filechooser event not raised when using window.showOpenFilePicker"
type: other
state: closed
created: 2021-09-10
url: "https://github.com/microsoft/playwright/issues/8850"
reactions: 88
comments: 13
labels: "[P3-collecting-feedback]"
---

# [BUG] filechooser event not raised when using window.showOpenFilePicker

**Context:**
- Playwright Version: 1.14.1
- Operating System: Linux
- Node.js version: 14.17.6
- Browser: Chromium

**Code Snippet**

```javascript
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://davdiv.github.io/playwright-filechooser-issue/");
  // Note: it does not fail if we force to fallback to <input type="file"> with this:
  // await page.evaluate("window.showOpenFilePicker = null");
  console.log(
    "has window.showOpenFilePicker =",
    await page.evaluate("!!window.showOpenFilePicker")
  );
  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.click("text=Open a file"),
  ]);
  console.log("Success!");
  // ... fileChooser.setFiles(/*...*/) ...
  await page.close();
})();
```

**Describe the bug**

If a web page uses window.showOpenFilePicker (such as, for example, this sample web page: https://davdiv.github.io/playwright-filechooser-issue/), it is not possible to test it with playwright, because the `filechooser` event is never raised. When not using headless mode, the file chooser dialog is visible and blocks the test.

The above code snippet never reaches the `Success<input type="file">` instead of  `window.showOpenFilePicker`.

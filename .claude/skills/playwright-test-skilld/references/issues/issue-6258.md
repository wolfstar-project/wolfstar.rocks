---
number: 6258
title: "[Feature] API for changing localStorage"
type: other
state: open
created: 2021-04-21
url: "https://github.com/microsoft/playwright/issues/6258"
reactions: 88
comments: 44
labels: "[P3-collecting-feedback]"
---

# [Feature] API for changing localStorage

I'm trying to get the `localStorage` of an app via:

`const storage = await context.storageState();` and it outputs: `{ cookies: [], origins: [] }`

and then I try: 

```typescript
    const localStorage = await page.evaluate(() =>
      JSON.stringify(window.localStorage)
    );
    console.log(localStorage);
```

and I get: `page.evaluate: Evaluation failed: DOMException: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.`

I know this page has `localStorage` because In between tests, I can see the `localStorage` in the Application tab.
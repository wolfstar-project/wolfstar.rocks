---
number: 1143
title: Playwright config - Test against branded browsers
type: other
state: closed
created: 2025-02-24
url: "https://github.com/nuxt/test-utils/issues/1143"
reactions: 0
comments: 0
---

# Playwright config - Test against branded browsers

https://github.com/nuxt/test-utils/blob/eea83976f5e2cfdc87a3e7f18edc641369f89abf/examples/app-playwright/playwright.config.ts#L14-L17

I think it should be something like

```ts
/* Test against branded browsers. */
{
  name: 'Microsoft Edge',
  use: { ...devices['Desktop Edge'], channel: 'msedge' },
},
{
  name: 'Google Chrome',
  use: { ...devices['Desktop Chrome'], channel: 'chrome' },
}
```

and the type should something like

```ts
satisfies (keyof typeof devices | Project)[]
```


---
number: 325
title: Setting cookies in context does not appear to be working
type: bug
state: open
created: 2023-03-01
url: "https://github.com/nuxt/test-utils/issues/325"
reactions: 1
comments: 16
labels: "[bug]"
---

# Setting cookies in context does not appear to be working

I am trying to set and test cookies. I have a simple test that loads a page where the only content is the value of a cookie. In the browser, it works even with server-side rendering, but in the test, I am not able to get the cookie value to appear.

I have tried using the Playwright context, hoping that the Nuxt test utils would recognize it somehow. I have also tried using the `storageState.cookies` to set the cookies, but the test always fails.

Can anyone point me in the right direction?

Example using context: 
```js
it('renders cookie value', async () => {
  await createBrowser()
  const browser = await getBrowser()
  const context = await browser.newContext()
  await context.addCookies([
    {
      name: 'test',
      value: 'test cookie',
      path: '/',
      domain: 'localhost'
    }
  ])

  const page = await createPage('/')

  expect(await page.innerHTML('body')).toContain('test cookie')
  await context.close()
  await browser.close()
})
```...
---
number: 63
title: Custom images broken with CloudFlare Workers 
type: bug
state: closed
created: 2023-07-04
url: "https://github.com/nuxt-modules/og-image/issues/63"
reactions: 4
comments: 3
labels: "[bug]"
---

# Custom images broken with CloudFlare Workers 

### Describe the bug

Getting the following error on CloudFlare Workers:

```json
{
  "data": {
    "message": "Cannot perform I/O on behalf of a different request. I/O objects (such as streams, request/response bodies, and others) created in the context of one request handler cannot be accessed from a different request's handler. This is a limitation of Cloudflare Workers which allows us to improve overall performance. (https://fonts.googleapis.com/css2?family=Inter:wght@400)",
    "stack": "",
    "statusCode": 500,
    "statusMessage": "",
    "url": "/api/og-image-font?name=Inter&weight=400"
  },
  "message": " (500  (/api/og-image-font?name=Inter&weight=400))",
  "stack": "",
  "statusCode": 500,
  "statusMessage": "",
  "url": "/api/og-image-svg?path=%2F"
}
```

Us...

---

## Top Comments

**@harlan-zw** [maintainer]:

Thanks for the details, the font issue should be solved with v3.0.0-rc.36

In this version we implement Nitro server storage for the fonts. The only issue with doing this is it's going to fetch the fonts on every request which is going to slow down the render.

**@harlan-zw** [maintainer]:

Should also be fixed with https://github.com/nuxt-modules/og-image/pull/421 which inlines static images.

**@bianpratama**:

When trying out alternatives for using custom fonts, I successfully use public URLs of font files from different sites/servers.

My site https://image.prata.ma/pratama, deployed to Cloudflare Workers.

Snippets of my composable for including fonts:
```ts
export async function useFonts(families: TFontFamily[]) {
  const fonts = []

  if (families.includes('inter')) {
    fonts.push('Inter:500', 'Inter:700')
  }

  if (families.includes('doyle')) {
    fonts.push(
      {
        name: 'dyl',
        weight: 700,
        path: 'https://assets.kelola.io/fonts/dyl-bold.woff',
      },
      {
        name: 'dyl',
        weight: 500,
        path: 'https://assets.kelola.io/fonts/dyl-medium.woff',
      },
    )
  }

  return fonts
}
```...
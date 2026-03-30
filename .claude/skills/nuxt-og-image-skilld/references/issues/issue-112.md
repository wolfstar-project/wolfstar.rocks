---
number: 112
title: Bun incompatibility
type: other
state: open
created: 2023-11-16
url: "https://github.com/nuxt-modules/og-image/issues/112"
reactions: 2
comments: 4
labels: "[v3]"
---

# Bun incompatibility

### Describe the bug

Works great running `nuxi dev` locally. 

On production, the URL is populated correctly:
`<meta property="og:image" content="https://www.mydomain.com/sharepage/__og_image__/og.png">`

but if I go to that URL directly, I get a 500 error:
```
[nuxt] error caught during app initialization Error: Page not found: /sharepage/__og_image__/og.png
    at Gi (entry.acb9a3ca.js:1:119961)
    at entry.acb9a3ca.js:13:9639
    at r (entry.acb9a3ca.js:1:95258)
    at Object.runWithContext (entry.acb9a3ca.js:1:39867)
    at by (entry.acb9a3ca.js:1:95288)
    at entry.acb9a3ca.js:1:93934
    at Cu.run (entry.acb9a3ca.js:1:3586)
    at Object.runWithContext (entry.acb9a3ca.js:1:93926)
    at entry.acb9a3ca.js:13:9617
    at entry.acb9a3ca.js:5:20672
entry.acb9a3ca.js:14 Failed to create og image: undefined is not an object (evaluating 't.type')
```...
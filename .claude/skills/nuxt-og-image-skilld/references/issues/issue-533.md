---
number: 533
title: "fix: missing aws-amplify RuntimeCompatibility"
type: bug
state: closed
created: 2026-03-25
url: "https://github.com/nuxt-modules/og-image/issues/533"
reactions: 1
comments: 1
labels: "[bug]"
---

# fix: missing aws-amplify RuntimeCompatibility

###  The bug

Using aws-amplify as nitro preset.

we are getting:
`@nuxtjs/og-image 9:06:23 AM]  WARN  Unknown Nitro preset "aws-amplify" — falling back to node-server compatibility. Set ogImage.compatibility.runtime to override.`

Solution:
Add aws-amplify, it is missing from the RuntimeCompatibility map.
somehting like?
`"aws-amplify": NodeRuntime`

I don't know if i'm missing something else.

###  To reproduce

https://nuxtseo.com/og-image/getting-started/stackblitz

###  Expected behavior

a solution for using aws-amplify 

###  Additional context

`ogImage: {
    defaults: {
      width: 1200,
      height: 630,
    },
    compatibility: {
      runtime: {
        takumi: 'node',
        sharp: 'node',
      },
    },
  },`

---

## Top Comments

**@martijndewit** (+1):

thank you for the quick action 
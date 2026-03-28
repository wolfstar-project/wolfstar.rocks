---
number: 497
title: "fix: Emojis appear skewed"
type: bug
state: closed
created: 2026-03-13
url: "https://github.com/nuxt-modules/og-image/issues/497"
reactions: 1
comments: 6
resolvedIn: 6.0.3
labels: "[bug]"
---

# fix: Emojis appear skewed

###  The bug

See the skewing in action in the OG image below.

``` vue
<script setup>
defineOgImage('BlogPost.takumi', {
  title: 'Hi! 👋'
})
</script>
``` 

<img width="1200" height="600" alt="Image" src="https://github.com/user-attachments/assets/e8fe1312-6533-4b80-b3d1-f813c5941fe8" />

###  To reproduce

https://github.com/sewalsh/og-image-example

###  Expected behavior

Emojis should appear unskewed.

###  Additional context
|                      |                                                        |
| -------------------- | ------------------------------------------------------ |
| **Operating system** | `macOS 25.3.0`                                         |
| **CPU**              | `Intel(R) Core(TM) i7-1068NG7 CPU @ 2.30GHz (8 cores)` |
| **Node.js version**  | `v...

---

## Top Comments

**@sewalsh** (+1):

Afraid to say problem still persists in `6.0.2`.

**@kane50613** (+2):

I tried to reproduce in Takumi upstream, somehow without https://github.com/nuxt-modules/og-image/blob/0209474b99e1ffa8a9010df359f170563024056f/src/runtime/server/og-image/core/transforms/emojis/fetch.ts#L54 SVG patch it renders without any issue, I could make a PR to fix it if needed



**@harlan-zw** [maintainer]:

This was a patch done to fix a satori emoji rendering bug so just need to isolate the logic instead of sharing it with takumi renderer. 

Although it's strange the test snapshots didn't regress will need to dig into that, maybe I'm missing a test for takumi emojis 
---
number: 4753
title: SSR Streaming / improve Time to First Byte
type: other
state: open
created: 2019-01-13
url: "https://github.com/nuxt/nuxt/issues/4753"
reactions: 48
comments: 12
labels: "[ p2-nice-to-have]"
---

# SSR Streaming / improve Time to First Byte

### What problem does this feature solve?

Although there are some caveats using streaming in SSR. 

It's still possible to stream some important tags in the `<head>` section, such as:
 - `<link rel="dns-prefetch">` tags
 - `<link rel="preconnect">` tags
 - `<link rel="prefetch">` tags
 - `<link rel="preload">` tags

Maybe even more, such as default layout and theme styles.

This will improve **page loading time** since the browser has more time to preconnect, preload and prefetch connections and resources.


### What does the proposed changes look like?

 - Change the order of the HTML template so that tags which are not dependent of any dynamic components are in front.
 - Change the vue-renderer package in a way that it sends part of the HTML as soon as possible.




<div align="right"><sub><em>This feature request is available on <a href="https://cmty.app/nuxt">Nuxt</a> community (<a href="https://cmty.app/nuxt/nuxt.js/issues/c8460">#c8460</a>)</em></sub></div>
---
number: 804
title: "CSS modules aren't recognized in tests"
category: "Q&A"
created: 2024-03-28
url: "https://github.com/nuxt/test-utils/discussions/804"
upvotes: 14
comments: 0
answered: false
---

# CSS modules aren't recognized in tests

Hello, I have a problem when mounting a basic component. I keep getting an error that it can't read the property of the $style object used by CSS Modules :

`TypeError: Cannot read properties of undefined (reading 'wrapper')`
` ❯ Proxy._sfc_render components/Home.vue:2:40`
`      1| <template>`
`      2|   <div id="home" :class="$style.wrapper">`

My vitest.config configuration file is very basic, it only defines aliases and a few environment options. 

When I only pass a string for the class property and not the $style.[classname] variable, my tests run fine.

I don't understand what I am missing, every auto-imports of components, composables etc. is working fine, except this part. 

Thanks in advance, have a good day !
# Nuxt 2: From Terminal to Browser

> How we changed the developer experience to stop switching between the terminal and browser.

> Nuxt is a Vue.js framework to create different kind of web applications with the **same directory structure & conventions**: Universal, Single Page, PWA or Static Generated.

* These features are all available with v2.8.0 release.*

## Problems

1. Developing JavaScript applications with Webpack or any bundler requires to switch between your browser and terminal for debugging purpose.
2. Using `console.log` to debug when the app is server rendered requires to remember that logs will be displayed on the terminal when refreshing the page.

## Solutions

1. Forwarding Webpack build state right in the browser and display them in a fancy manner.

![forward-webpack-build-state](/assets/blog/forward-webpack-build-state.gif)

1. Same for Hot Module Replacement (really useful when the project gets bigger and takes more time to re-build).

![nuxt-build-indicator-hmr](/assets/blog/nuxt-build-indicator-hmr.gif)

1. Forwarding SSR logs to the browser in development mode

![nuxt-ssr-logs-forwarding](/assets/blog/nuxt-ssr-logs-forwarding.gif)

## Nuxt Vision

The purpose to these changes is to use the terminal for commands only.

Now you can focus right on your code and its visual result 

> Be lazy, be smart, be Nuxt.

Links:

- Nuxt 2 docs: https://v2.nuxt.com
- GitHub: https://github.com/nuxt/nuxt.js
- Loading Screen source code: https://github.com/nuxt/loading-screen
- Twitter: https://x.com/nuxt_js

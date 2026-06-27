---
number: 874
title: "Why do errors occur when using '@nuxt/test-utils/e2e' for API testing?"
type: bug
state: open
created: 2024-06-27
url: "https://github.com/nuxt/test-utils/issues/874"
reactions: 0
comments: 4
labels: "[bug, vitest-environment]"
---

# Why do errors occur when using '@nuxt/test-utils/e2e' for API testing?

**Summary (generated)**:

Here is a brief summary in English:

A developer is trying to set up end-to-end testing for server-side functionality in a Nuxt app using Nitro, but is encountering errors related to frontend routes despite setting `server` to true and `browser` to false. The error is apparently due to the absence of an `index.vue` file in the `/pages` directory, which is expected to contain application logic. The developer expects the setup to only run the server part and not be concerned with frontend parts.

<hr>

...
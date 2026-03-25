---
number: 16869
title: "In performance monitoring is it possible to filter out external/extension requests? asking for @sentry/nuxt"
category: "Q&A"
created: 2025-07-10
url: "https://github.com/getsentry/sentry-javascript/discussions/16869"
upvotes: 4
comments: 1
answered: false
---

# In performance monitoring is it possible to filter out external/extension requests? asking for @sentry/nuxt

Hi Folks,
We use sentry to track the Pageload time & web vitals. But a lot of out P95, P75 transactions are filled with `No Instrumentation` spans.

<img width="1076" alt="image" src="https://github.com/user-attachments/assets/4228eb39-64a9-4115-8a3a-3c1230028da2" />


Is there some way to not include these in the page load time? What could be the cause for such spans - are they some extensions?  Is it possible to know what the nature of these spans is?

---

## Top Comments

**@rachit-quizizz**:

Even I faced a similar issue. Fingers crossed on getting a resolution here.
---
number: 34321
title: "URGENT: Nuxt middleware - First Client Navigation Updates URL but Page Does Not Render in Production"
category: Questions
created: 2026-02-12
url: "https://github.com/nuxt/nuxt/discussions/34321"
upvotes: 5
comments: 2
answered: false
---

# URGENT: Nuxt middleware - First Client Navigation Updates URL but Page Does Not Render in Production

### Setup

* Nuxt 3
* `ssr: false` in nuxt.config.ts
* Built with `yarn build`
* Running with `node .output/server/index.mjs`
* Multiple async global middleware (auth, workspace, entity, etc.)
* Middleware perform async API calls + Pinia store mutations

---

### Issue

In production domain only:

* Clicked Login and home page appears. While clicking any navigation

  * router.push() triggers 
  * URL changes 
  * All middleware run 
  * No console errors 
  * No failed network requests 
  * Page component does NOT render 

* Again clicking the same navigation
  * router.push() triggers 
  * Middleware does NOT run
  * Navigation works normally
  * Page renders correctly

* Directly entering the url in browser works fine.

#### Note this happens only in deployed environment. In local environment it is working fine.

Cannot reproduce with:

```
yarn build
yarn preview
```

---

### Question

- Can async global middleware that mutate Pinia stores interfere with route rendering in CSR mode?
- Is there any known issue with `ssr: false` + running via `node .output/server/index.mjs` where first navigation resolves but component does not mount?
- Can someone help me to resolve this issue? 

---

Thanks.

---

## Top Comments

**@cernymatej** [maintainer]:

Could you share a minimal reproduction?

**@faizkhairi**:

This is almost certainly a race condition between your async middleware and Vue Router's navigation resolution. The pattern you describe -- first click changes URL but doesn't render, second click works -- is a signature symptom.

**Root cause:**

When multiple global middleware run async operations (API calls + Pinia mutations) during the first client-side navigation, the route resolves before the middleware fully completes. Vue Router updates the URL, but the page component's setup/data isn't ready because the middleware chain hasn't finished writing to the stores. The second navigation ...
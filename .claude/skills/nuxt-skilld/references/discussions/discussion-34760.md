---
number: 34760
title: (Probably) Page Stacking Bug — Both outgoing and incoming pages render simultaneously during navigation. Screenshot attached.
category: Questions
created: 2026-04-02
url: "https://github.com/nuxt/nuxt/discussions/34760"
upvotes: 1
comments: 2
answered: false
---

# (Probably) Page Stacking Bug — Both outgoing and incoming pages render simultaneously during navigation. Screenshot attached.

<img width="1280" height="710" alt="image" src="https://github.com/user-attachments/assets/5c12a54e-44ad-469c-8636-3292e0538d7e" />

### Environment

  - **Nuxt**: `^4.2.2`
  - **Vue**: `^3.5.17`
  - **SSR**: `false` (SPA mode)
  - **Page transitions**: Custom opacity transition via `<NuxtPage :transition="...">` in `app.vue`

  ### Description

  When navigating between top-level routes (e.g., from a guest-only landing page route to an authenticated dashboard), both pages render simultaneously — the old page remains visible underneath/behind the new page, creating a "stacked" visual effect.

  This is **not** a brief flash during a transition — both pages persist and are fully rendered in the DOM at the same time.

  ### Route structure (simplified)

  ...

---

## Top Comments

**@OrbisK** [maintainer]:

please make sure that you pages have a single root element!

In order to help you we need some kind of minimal reproduciton!

**@spencerwalsh651-cmyk**:

That sounds like a good plan. Having a minimal reproduction repository will
make it much easier to investigate the page stacking issue and see if it's
related to the nested routing or the transition configuration.


On Thu, Apr 2, 2026, 3:19 AM Yura ***@***.***> wrote:

> Not sure if i can show the actual codebase cuz I signed an NDA for this
> project. But I'll try to make a brand new repository to demonstrate the
> issues. Will send the link later. Thanks!
>
> —
> Reply to this email directly, view it on GitHub
> <https://github.com/nuxt/nuxt/discussions/34760?email_source=notif...
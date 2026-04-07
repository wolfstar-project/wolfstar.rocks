---
number: 3001
title: "How likely is it that we'll see a routerless version?"
type: question
state: closed
created: 2024-12-30
url: "https://github.com/nuxt/ui/issues/3001"
reactions: 14
comments: 29
labels: "[question, v3, vue]"
---

# How likely is it that we'll see a routerless version?

### Description

I really love all the work that went into this, but it's currently connected to vue-router for `Link` and `Pagination` components. I would love to see these become optional dependencies so it can be used with projects that do not use `vue-router`.

Maybe there is some way to stub out the link components to enable support for Inertia \ default HTML?

---

## Top Comments

**@benjamincanac** [maintainer] (+8):

I've made some changes to the Vue `Link` component to work without `vue-router` but I'm not 100% sure it will work with Laravel and Inertia if you guys want to check it out before tomorrow's release: `https://pkg.pr.new/@nuxt/ui@f55e869`.

**@zacwebb** (+4):

> I've made some changes to the Vue `Link` component to work without `vue-router` but I'm not 100% sure it will work with Laravel and Inertia if you guys want to check it out before tomorrow's release: `https://pkg.pr.new/@nuxt/ui@f55e869`.

I just gave it a go and it's working great without `vue-router` in a Laravel + Inertia + Vue project.

Thank you @benjamincanac!  

**@ManukMinasyan** (+7):

This compatibility issue is the primary reason I'm not implementing this package in my Laravel and Vue.js project.
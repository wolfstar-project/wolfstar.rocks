---
number: 3596
title: Support Tailwind Prefix
type: feature
state: closed
created: 2025-03-18
url: "https://github.com/nuxt/ui/issues/3596"
reactions: 16
comments: 11
labels: "[enhancement, v3, p2-medium]"
---

# Support Tailwind Prefix

### Description

There is a PR looking to solve for this #3009 however I figured I would still raise the issue.

Having Nuxt UI respect the tailwind prefix would be handy to have to not overlap styles if components are being utilised on pages that already have existing styles with the same name and are not using tailwind.

### Additional context

_No response_

---

## Top Comments

**@cfroe**:

> Hi @cfroe I solved by creating a custom element with shadow root

Thx for your fast response, could you explain more in detail, sorry I'm not so experienced with CSS.

1) Do I need to change or add something in the the main.css?
```
@import "tailwindcss";
@import "@nuxt/ui";
:root {
```
2) Set an id or whatever in the root HTML tag?
3) Add something in nuxt.config,ts?
4) Something else?

**@yooouuri**:

+1

We are migrating from bulma to tailwind and (eventually Nuxt UI) the prefix is kinda mandatory for this migration 

**@saschafuchs**:

This is super important, we need to use TW prefixes because the application we want to integrate our SPA into uses custom tailwind classes with !important. Without the prefixes the UI will not work
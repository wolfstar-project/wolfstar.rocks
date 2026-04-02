---
number: 484
title: "fix: missing `getOgImagePath`"
type: bug
state: closed
created: 2026-02-24
url: "https://github.com/nuxt-modules/og-image/issues/484"
reactions: 1
comments: 2
labels: "[bug]"
---

# fix: missing `getOgImagePath`

###  The bug

In the docs for V6, it lists this as a possible import:

```ts
import { getOgImagePath } from '#og-image/app/utils'
```

This is never exported in the module, so that does not work, and results in:

```txt
Cannot find module '#og-image/app/utils' imported from...
```

###  To reproduce

https://stackblitz.com/edit/nuxt-starter-jl5kqk6q?file=pages%2Findex.vue

###  Expected behavior

Exported util available in the app.

###  Additional context

Currently a workaround is as follows, auto-imported / `#imports`:

```ts 
// modules/99.og-image-import.ts
import {defineNuxtModule, addImports, createResolver} from "@nuxt/kit";

export default defineNuxtModule({
  async setup(_, nuxt) {

    const util = 'getOgImagePath';

...

---

## Top Comments

**@harlan-zw** [maintainer] (+1):

The `const url = defineOgImage(...)` returns the URL it generates now so this function was removed I beleive, but the docs are out of date, will fix that.

**@harlan-zw** [maintainer]:

see https://github.com/nuxt-modules/og-image/commit/00497163ad63e9cb6b5dd12f4ca117ccf7c1b079
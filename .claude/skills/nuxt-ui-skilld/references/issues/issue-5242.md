---
number: 5242
title: How to bundle default Nuxt UI icons (proper offline icons) with Vite?
type: question
state: open
created: 2025-10-15
url: "https://github.com/nuxt/ui/issues/5242"
reactions: 9
comments: 17
labels: "[question, v4]"
---

# How to bundle default Nuxt UI icons (proper offline icons) with Vite?

### Package

v4.x

### Description

AFAIK none of currently closed issues resolve the problem in general case, so please let me reiterate it once again.

How to have **default** icons (like the chevron-down on USelect) bundled with the app in **Vue/Vite** mode? NOT online, NOT bundling the full icons set, just like it's 2020 and all that icons _servers_ thing didn't happen.

I'm developing an app which will have to work offline, and online icons are just not viable. For my own icons I just use tiny Vue wrapper components, so everything is bundled just perfect. But how to deal with Nuxt UI's default icons choices?

---

## Top Comments

**@allahyar** (+8):

```
//main.ts  

import { addCollection } from '@iconify/vue'
import {icons} from '@iconify-json/lucide'

addCollection(icons)
```

**@KazimirPodolski** (+4):

@al1maher I don't have a `nuxt.config.ts` as I'm using Vue with Vite only.

**@rijenkii** (+3):

I do something like the following, but can't say that I enjoy the experience. It was cobbled together in kind of a rush, so maybe not the most efficient and/or pretty solution. Requires unplugin-icons.

<details><summary><code>vite.config.ts</code></summary>

...
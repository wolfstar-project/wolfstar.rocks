---
number: 3376
title: How can I tree-shake reka-ui?
type: question
state: open
created: 2025-02-22
url: "https://github.com/nuxt/ui/issues/3376"
reactions: 17
comments: 17
labels: "[question, v3, upstream/reka-ui]"
---

# How can I tree-shake reka-ui?

### Description

I am using the Nuxt UI playground template from here. 

After running `pnpm build`, I noticed that `.output/server/node_modules/reka-ui/dist` contains many unused components. How can I configure it to tree-shake these unused components after the build?

---

## Top Comments

**@atinux** [maintainer] (+4):

This is so far an upstream issue related to Vite not treeshaking the module in development, you can refer to this issue: https://github.com/vitejs/vite/issues/8237

Apparently, this will be fixed once Vite migrates to Rolldown.

**@ii517** (+2):

I was wondering if anyone has solved this problem yet?

**@qodeboy** (+1):

I can confirm this is a real problem. Official starter template when loaded loads more that 700 modules for a page with one button. This makes whole DX a nightmare - HMR lags for 3-5 seconds, fresh reloads re-downloads whole bunch of modules. 

I am not sure this is nuxt-ui/reka's thing or a vite's, but this makes our flow a lot harder.

15MB of modules for a page with a button seems definitely broken.


P.S. Production builds are totally fine - components are tree-shaked and only used appears in bundle.
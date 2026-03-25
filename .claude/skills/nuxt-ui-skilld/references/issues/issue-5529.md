---
number: 5529
title: UNavigationMenu Accordion hydration mismatch
type: bug
state: open
created: 2025-11-24
url: "https://github.com/nuxt/ui/issues/5529"
reactions: 9
comments: 9
labels: "[bug, upstream/reka-ui, v4]"
---

# UNavigationMenu Accordion hydration mismatch

### Environment

Not applicable.

### Is this bug related to Nuxt or Vue?

Nuxt

### Package

v4.x

### Version

4.2

### Reproduction

https://github.com/nuxt-ui-templates/dashboard

### Description

There is a hydration mismatch related to UNavigationMenu. You can clearly see it on the official dashboard template, so I didn't supply my own reproduction. It concerns these lines related to Accordion items in the menu:
```
<div role="region" aria-labelledby="reka-accordion-trigger-v-0-0-1" data-state="closed" data-orientation="vertical" style="--reka-accordion-content-width:var(--reka-collapsible-content-width);--reka-accordion-content-height:var(--reka-collapsible-content-height);--reka-collapsible-content-height:0px;--reka-collapsible-content-width:0px;" class="data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden" id="reka-collapsible-content-v-0-0-2" hidden="">
```
versus
```
<div role="region" aria-labelledby="reka-accordion-trigger-v-0-0-1" data-state="closed" data-orientation="vertical" style="--reka-accordion-content-width: var(--reka-collapsible-content-width); --reka-accordion-content-height: var(--reka-collapsible-content-height); --reka-collapsible-content-height: 0px; --reka-collapsible-content-width: 0px;" class="data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden" id="reka-collapsible-content-v-0-0-2" hidden="">
```...

---

## Top Comments

**@Ragura** (+3):

> Please show me where because I just tried again in dev and I don't reproduce this, is this happening in production only?

Thanks for looking into this! I can confirm it still happens on the dashboard template. You can see it in the console just by visiting the template here: https://dashboard-template.nuxt.dev/
However, you're right that it does **not** present itself when running the template in dev, at least in the console. However, if you add the `@nuxt/hints` module you will see 2 different hydration errors reported in the devtools. On the dashboard specifically, this is the one I report...

**@benjamincanac** [maintainer]:

Would you mind sharing the code to reproduce this? I've never seen this hydration error anywhere 

**@benjamincanac** [maintainer]:

Please show me where because I just tried again in dev and I don't reproduce this, is this happening in production only?
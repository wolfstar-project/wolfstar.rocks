---
number: 4117
title: Default text size on input fields too small on small devices causing zoom when clicked (sub 16px?)
type: bug
state: closed
created: 2025-05-10
url: "https://github.com/nuxt/ui/issues/4117"
reactions: 13
comments: 5
labels: "[bug, v3, p2-medium]"
---

# Default text size on input fields too small on small devices causing zoom when clicked (sub 16px?)

### Environment

The default input fields when used on small devices (Like my iPhone 12 mini) seemingly render text below 16px causing the browser to zoom when clicking an input field. This doesn't happen on my larger devices as presumably the text renders above 16px.

Might be good to force a minimum text size of 16px to avoid this default behaviour as the workaround otherwise is to override that zoom behaviour, but that could impact accessibility unless the user zooms in manually with their fingers.

### Is this bug related to Nuxt or Vue?

Nuxt

### Version

v3

### Reproduction

https://ui.nuxt.com/components/input happens on the official site too for example here on my iPhone 12 mini

### Description

input field text renders below recommended 16px on small devices causing the screen to zoom when clicking input fields. This occurs on input fields smaller than xl. Granted in my opinion the text looks plenty big at medium and large size but those cause the screen zoom by default

### Additional context

_No response_

### Logs

```shell-script

```

---

## Top Comments

**@benjamincanac** [maintainer] (+1):

Sorry for the delay on this, I've made a PR but only fixed the `md` and `lg` sizes as it doesn't look good at all on `xs` and `sm` 

**@bryantgillespie** (+2):

+1 for a better default. It's frustrating to have out to pinch to zoom back out on iOS to see the whole view again.

**@simonmaass**:

yeah i noticed this too! would be great to have a better default
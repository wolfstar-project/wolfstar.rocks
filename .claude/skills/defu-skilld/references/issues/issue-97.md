---
number: 97
title: Allow two way function merger
type: feature
state: open
created: 2023-06-09
url: "https://github.com/unjs/defu/issues/97"
reactions: 0
comments: 0
labels: "[enhancement]"
---

# Allow two way function merger

Currently function merger is only appied only if (defaults) has the function merger functionality however it is sometimes usable to also support merger for the input config. (https://github.com/nuxt/nuxt/pull/21462#issuecomment-1582871733)

Note: This behavior was for performance reasons. We might find a workaround directly from function merger custom export (or a new export to avoid breaking changes)
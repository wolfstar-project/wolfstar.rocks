---
number: 1627
title:  replace typescript with typescript-go
type: feature
state: closed
created: 2026-03-19
url: "https://github.com/webpro-nl/knip/issues/1627"
reactions: 6
comments: 2
labels: "[feature request]"
---

#  replace typescript with typescript-go

### Suggest an idea for Knip

Y'all are very likely already tracking this but I didn't see an issue so putting one up for visibility.

typescript-go is very fast! And they're starting to fill out the node API - curious to know if there's been much discussion on swapping over knip's typescript-aware analyses to use it instead of older tsc.

---

## Top Comments

**@webpro** [maintainer] (+1):

The timing of this one is just great. Missed the event by one day. On the fence whether I should close with "completed" (it got faster) or "wontfix" (not using tsgo)... 

**@lishaduck** (+2):

As of Knip 6 out this morning, Knip uses oxc-resolver instead of TypeScript (and is twice as fast!), so I think this is no longer relevant 
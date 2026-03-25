---
number: 14
title: "[feature] add ```exclude: []``` or include negation"
type: feature
state: closed
created: 2026-01-29
url: "https://github.com/HugoRCD/evlog/issues/14"
reactions: 1
comments: 1
labels: "[enhancement]"
---

# [feature] add ```exclude: []``` or include negation

### Description

Currently plugin options have an ```include: []``` blob pattern matching.
I'd like to have either an ```exclude: []``` or allow for negation.

e.g. I'd like to use ```include: ['!/api/_nuxt_icon/**']``` or just exclude the pattern.

https://github.com/HugoRCD/evlog/blob/d3395e9348b253f3222d98f35d2e93e824be2c05/packages/evlog/src/nitro/plugin.ts#L14
```const isNegation = pattern.startsWith('!')``` ... etc

Let me know what you think!

p.s. super excited about this plugin so far. 

Edit: If you like I can submit a PR.
---
number: 155
title: Incomplete __proto__ guard bypass allows prototype pollution via defaults argument
type: bug
state: closed
created: 2026-03-31
url: "https://github.com/unjs/defu/issues/155"
reactions: 1
comments: 11
labels: "[bug]"
---

# Incomplete __proto__ guard bypass allows prototype pollution via defaults argument

### Environment

 defu: 6.1.4 (latest)                                                                                                                                                                                                                      
  Node.js: v18.x / v20.x / v22.x (all affected)        

### Reproduction

  // reproduce.mjs                                                                                                                                                                                                                        
  import { defu } from 'defu'                                                                                                                                                                                                               
...

---

## Top Comments

**@kricsleo** [maintainer] (+1):

This can be confirmed.

~~Can't reproduce:https://stackblitz.com/edit/stackblitz-starters-slbectgl?file=index.js&startScript=test~~
(Sorry, it's a markdown rendering issue ↑)


**@pi0** [maintainer]:

Thanks for report. We are publishing https://github.com/unjs/defu/security/advisories/GHSA-737v-mqg7-c878 after full ecosystem propagation (already almost done in unjs)

**@pi0** [maintainer]:

ofc already done!

<img width="628" height="246" alt="Image" src="https://github.com/user-attachments/assets/aeba2e67-7b93-4822-a4f1-bee714c7e24c" />
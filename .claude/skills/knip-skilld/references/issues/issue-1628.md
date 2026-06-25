---
number: 1628
title: " Knip doesn't recognize SvelteKit ./$types any more"
type: bug
state: open
created: 2026-03-21
url: "https://github.com/webpro-nl/knip/issues/1628"
reactions: 0
comments: 1
labels: "[regression]"
---

#  Knip doesn't recognize SvelteKit ./$types any more

### Prerequisites

- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've read the issue reproduction guide

### Good version

5.88.0

### Bad version

6.0.1

### Description of the regression

This code:
```typescript
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  // ...
}
```

causes:

```
Unresolved imports (42)
./$types  src/routes/(app)/+layout.server.ts:3:39 
...
```

Which it didn't do before Knip v6

---

## Top Comments

**@webpro** [maintainer]:

There is a reproduction URL in the issue template that has been removed. It is there for a reason, so we don't have to guess context/cause. There's not much input left. Does the TS config include `rootDirs`?
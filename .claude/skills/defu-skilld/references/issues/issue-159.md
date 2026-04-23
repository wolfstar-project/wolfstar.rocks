---
number: 159
title: "Cannot use `Defu` type when using tsconfig paths"
type: bug
state: closed
created: 2026-04-06
url: "https://github.com/unjs/defu/issues/159"
reactions: 0
comments: 1
resolvedIn: 6.1.7
labels: "[bug]"
---

# Cannot use `Defu` type when using tsconfig paths

### Environment

N/a

### Reproduction

N/a

### Describe the bug

When defu is defined in tsconfig paths, like in nuxt, the Defu type cannot be used. When `Defu` is imported, it is improperly resolved to a value.

```jsonc
// tsconfig.json
{
  "compilerOptions": {"paths": {
    "defu": ["node_modules/.pnpm/defu@6.1.6/node_modules/defu"]
  }}
}
```
```ts
// index.ts
import type { Defu } from 'defu'
//            ^?  Defu: any
```

Probably caused by 407b51645c41a57da6efac5b40967f2c60ce4f12 changing the `types` key to `lib/defu.d.cts`

### Additional context

_No response_

### Logs

```sh

```

---

## Top Comments

**@pi0** [maintainer] (+1):

Released https://github.com/unjs/defu/releases/tag/v6.1.7 please check if it fixes issue.
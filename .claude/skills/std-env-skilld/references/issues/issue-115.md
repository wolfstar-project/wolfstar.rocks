---
number: 115
title: "`process.env` is prefered over `import.meta.env`"
type: other
state: open
created: 2024-01-25
url: "https://github.com/unjs/std-env/issues/115"
reactions: 0
comments: 5
---

# `process.env` is prefered over `import.meta.env`

### Environment

node 20.11
std-env 3.7


### Reproduction

not really relevant

### Describe the bug

So I'm not sure if I'd call this a bug per-se, maybe more of an observation to open up a discussion how we could solve this.

Astro is a bit (if you ask me) dumb in the way that they have a `process.env` on the server but they don't populate it with stuff from your env file. That stuff goes on `import.meta.env`. This means that the following logs undefined:

```ts
import { process } from "std-env";
console.log(process.env.SOME_ENV_FROM_ENVFILE);
```

This is cause (like I said), process does exists, so `std-env` chooses it as the env object: https://github.com/unjs/std-env/blob/7528b1324ab48dea93c0739b0b046e0d5607fcf5/src/env.ts#L5-L10

Any ideas how to solve this i...
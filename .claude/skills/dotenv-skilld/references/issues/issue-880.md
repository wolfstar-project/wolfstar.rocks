---
number: 880
title: "How do we specify `quiet: true` when importing `dotenv` when using ES6?"
type: other
state: closed
created: 2025-07-01
url: "https://github.com/motdotla/dotenv/issues/880"
reactions: 3
comments: 10
---

# How do we specify `quiet: true` when importing `dotenv` when using ES6?

Following the change in v17 (#874), what is the proper way to specify `quiet: true` when importing `dotenv` when  using ES6?

Per current usage documentation:

```
import 'dotenv/config'
```

How do we specify configuration options like `quiet: true`?

Creating a separate file just for importing `dotenv` in order to specify config options is not a satisfying developer experience.

See also: #89, #133

---

## Top Comments

**@motdotla** [maintainer] (+2):

Currently I haven't changed `import 'dotenv/config'`. It defaults to `quiet: true` still. Because, yes, I agree that wrapping a separate file to add a simple config change here for ES6 is an absolutely awful developer experience.

That said, it IS sometimes useful to change your config options - maybe you want debug in your tests. In which case, I recommend @dotenvx/dotenvx. It includes a cli so then you can just do this:

...

**@micobarac** (+6):

```ts
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
```

**@motdotla** [maintainer] (+1):

Also, thank you for taking the time to link references to all those issues in your ticket. Very helpful.
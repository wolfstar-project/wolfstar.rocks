---
number: 174
title: NODE_ENV not being picked
type: bug
state: open
created: 2025-11-02
url: "https://github.com/unjs/std-env/issues/174"
reactions: 0
comments: 5
labels: "[bug]"
---

# NODE_ENV not being picked

### Environment

Node v20/v22 LTS
Windows 10
pnpm v10

### Reproduction

```ts
import { defineNuxtConfig } from 'nuxt/config';
import { isDevelopment, nodeENV } from 'std-env';

console.log(process.env.NODE_ENV, { isDevelopment, nodeENV });

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-15',
  devtools: { enabled: true },
});
```

Running `pnpm dev`

### Describe the bug

Likely not a bug with the package, but I'm trying to investigate.

`nodeENV` returns an empty string, and `isDevelopment` is false, despite `process.env.NODE_ENV` being `development`. Could you possibly give me pointers on what may be causing my environment to have this? I am happy to investigate myself and report back + close issue.


...

---

## Top Comments

**@kricsleo** [maintainer]:

Could you provide a minimal reproduction so I can debug? There are many possibilities for how `process.env.NODE_ENV` could be assigned by various libraries.

**@kricsleo** [maintainer]:

Does this help?

```ts
const original = process.env;

// Put this at the startpoint of the app
process.env = new Proxy(original, {
  set(target, prop, value, receiver) {
    if (prop === 'NODE_ENV') {
      console.trace('-- SETTING NODE_ENV --', value);
    }
    return Reflect.set(target, prop, value, receiver);
  }
});

// Will be printed
process.env.NODE_ENV = 'foo'
```

**@ineshbose**:

> There are many possibilities for how `process.env.NODE_ENV` could be assigned by various libraries.

`process.env.NODE_ENV` is definitely being logged correctly.

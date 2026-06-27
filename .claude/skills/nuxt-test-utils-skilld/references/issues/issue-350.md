---
number: 350
title: "@nuxt/test-utils -- setup() clobbers console.log() functionality"
type: bug
state: open
created: 2023-06-06
url: "https://github.com/nuxt/test-utils/issues/350"
reactions: 4
comments: 3
labels: "[bug]"
---

# @nuxt/test-utils -- setup() clobbers console.log() functionality

### Environment

- Operating System: `Darwin`
- Node Version:     `v18.16.0`
- Nuxt Version:     `3.5.2`
- Nitro Version:    `2.4.1`
- Package Manager:  `yarn@1.22.17`
- Builder:          `vite`
- User Config:      `-`
- Runtime Modules:  `-`
- Build Modules:    `-`


### Reproduction

https://stackblitz.com/edit/github-kp3tnj?file=test%2Fmyhello.test.ts


### Describe the bug

When setup() is called at the beginning of a vitest test file (as described in the docs https://nuxt.com/docs/getting-started/testing), console.log() no longer displays text on the console during the test run.

When setup() is commented out, console.log() works as expected.

### Additional context

_No response_

### Logs

_No response_

---

## Top Comments

**@BobbieGoede** [maintainer] (+9):

I found another workaround, it seems `console.log` is being wrapped by `consola` at some point. Calling `consola.restoreConsole` in `beforeEach` allows you to use `console.log` as normal, not sure if there are any drawbacks to this.

```ts
import { consola } from 'consola'

beforeEach(() => {
  consola.restoreConsole()
})

await setup({});

describe("My tests", () => {
    test("a test", () => {
        console.log("hello there");
    });
});
```

**@BobbieGoede** [maintainer] (+3):

I ran into the same issue, not sure how to fix it but I do have a work around to be able to log still. Assigning `console.log` to a variable before running `setup` allows you to use it for logging.

```ts
import { describe, test } from "vitest";
import { setup } from "@nuxt/test-utils";

// assign console.log before setup
const logger = console.log;
await setup({});

describe("My tests", () => {
    test("a test", () => {
        logger("hello there");
    });
});
```

**@flozero**:

Same here. would be great if we can have this working. It makes hard to write simple testing :s
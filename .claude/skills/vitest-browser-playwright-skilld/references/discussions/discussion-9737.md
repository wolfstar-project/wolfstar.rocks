---
number: 9737
title: How Do I Setup Custom Test Environment After Configuring It?
category: "Q&A"
created: 2026-02-25
url: "https://github.com/vitest-dev/vitest/discussions/9737"
upvotes: 1
comments: 1
answered: true
---

# How Do I Setup Custom Test Environment After Configuring It?

The docs show how to create the boilerplate for the config but all it says afterword is a comment inside the setup method that says custom setup. I don't know what to setup in there.

For context, I'm trying to create a custom environment for Electron, so `'node'` is not a suitable test environment.

Possible related: https://github.com/vitest-dev/vitest/discussions/8694

---

## Accepted Answer

@Android789515 A custom environment usually requires extends accessing the setup.
In `libs/my-env/index.ts`:
```ts
export default {
  name: ''my-electron-env'',
  setup(global) {
    // Inject mocks
    global.window = { ... }; 
    return {
      teardown() { ... }
    }
  }
}
```
Then in `vitest.config.ts`:
```ts
test: {
  environment: ''./libs/my-env/index.ts''
}
```
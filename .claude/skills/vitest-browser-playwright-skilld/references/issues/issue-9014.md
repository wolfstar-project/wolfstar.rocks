---
number: 9014
title: "Error: write EPIPE"
type: other
state: closed
created: 2025-11-12
url: "https://github.com/vitest-dev/vitest/issues/9014"
reactions: 9
comments: 16
labels: "[p4-important]"
---

# Error: write EPIPE

### Describe the bug

Vitest is failing randomly with the error `Error: write EPIPE`. Sometimes (mostly the first runs) are succeed and at some point, when the notebook is under more pressure, it starts failing. Also tested this setup with our runners, 2-3 are failing out of 5 with the same error in different areas.

I saw also that if it fails multiple times, that there node processes running in the background which will not be cleared.


```
node:events:486
      throw er; // Unhandled 'error' event
      ^

Error: write EPIPE
    at ChildProcess.target._send (node:internal/child_process:877:20)
    at ChildProcess.target.send (node:internal/child_process:751:19)
    at ForksPoolWorker.send (file:///Users/michaelholst/Documents/projects/k3k-web-frontend/node_modules/vitest/dist/chunks/cli-api.BQ-bjcRi.js:6839:13)
    at PoolRunner.postMessage (file:///Users/michaelholst/Documents/projects/k3k-web-frontend/node_modules/vitest/dist/chunks/cli-api.BQ-bjcRi.js:6677:63)
    at post (file:///Users/michaelholst/Documents/projects/k3k-web-frontend/node_modules/vitest/dist/chunks/cli-api.BQ-bjcRi.js:6668:28)
    at EventEmitter.onMessage (file:///Users/michaelholst/Documents/projects/k3k-web-frontend/node_modules/vitest/dist/chunks/index.DAL392Ss.js:152:19)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
Emitted 'error' event at:
    at ChildProcess.emitWorkerError (file:///Users/michaelholst/Documents/projects/k3k-web-frontend/node_modules/vitest/dist/chunks/cli-api.BQ-bjcRi.js:6769:22)
    at ChildProcess.emit (node:events:508:28)
    at node:internal/child_process:881:39
    at processTicksAndRejections (node:internal/process/task_queues:85:11) {
  errno: -32,
  code: 'EPIPE',
  syscall: 'write'
}

...

---

## Top Comments

**@github-actions**:

Hello @ZeroCool-85. Please provide a [minimal reproduction](https://stackoverflow.com/help/minimal-reproducible-example) using a GitHub repository or [StackBlitz](https://vitest.new) (you can also use [examples](https://github.com/vitest-dev/vitest/tree/main/examples)). Issues marked with `needs reproduction` will be closed if they have no activity within 3 days.

**@michaelholstdev**:

> Hello [@ZeroCool-85](https://github.com/ZeroCool-85). Please provide a [minimal reproduction](https://stackoverflow.com/help/minimal-reproducible-example) using a GitHub repository or [StackBlitz](https://vitest.new) (you can also use [examples](https://github.com/vitest-dev/vitest/tree/main/examples)). Issues marked with `needs reproduction` will be closed if they have no activity within 3 days.

Added reproduction steps, hope this is fine. Otherwise I have no glue how to reproduce this issue at the moment as it feels very randomly.

**@SebastianFranze**:

@lordlpua 

I can not confirm this. I had the `Error: write pipe` error using node v22.21.1
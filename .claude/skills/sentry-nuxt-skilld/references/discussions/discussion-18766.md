---
number: 18766
title: Correct way to use wasmIntegration with webWorkerIntegration and wasm in the worker?
category: "Q&A"
created: 2026-01-09
url: "https://github.com/getsentry/sentry-javascript/discussions/18766"
upvotes: 1
comments: 1
answered: false
---

# Correct way to use wasmIntegration with webWorkerIntegration and wasm in the worker?

I have a browser app that loads wasm from within a web worker. I'm currently setting up \@sentry/wasm's wasmIntegration and Sentry.webWorkerIntegration in the main thread, and calling Sentry.registerWebWorker in the worker thread.

The question is, does the wasmIntegration belong in the main thread, the worker thread, or both? Sentry's docs "Ask AI" was confident it was only needed in the main thread, where error stack frames are parsed. But it looks like wasmIntegration also patches WebAssembly methods, which would need to be in the worker where they're used.

Here's what I'm doing now (roughly):

```ts
// main thread
import * as Sentry from "@sentry/browser";
import { wasmIntegration } from "@sentry/wasm";

const webWorkerIntegration = Sentry.webWorkerIntegration({ worker: [] });
Sentry.init({
  // ...
  integrations: [wasmIntegration(), webWorkerIntegration],
});

const worker = new Worker(...);
webWorkerIntegration.addWorker(worker);

// worker thread
import * as Sentry from "@sentry/browser";
Sentry.registerWebWorker({ self });

WebAssembly.instantiateStreaming(fetch(...));
```...

---

## Top Comments

**@andreiborza** [maintainer] (+1):

Hi, thanks for writing in.

I created an issue for this: https://github.com/getsentry/sentry-javascript/issues/18779.
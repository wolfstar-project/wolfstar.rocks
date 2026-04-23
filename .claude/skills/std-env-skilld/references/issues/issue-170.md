---
number: 170
title: Jenkins recognized as Hudson
type: bug
state: closed
created: 2025-10-28
url: "https://github.com/unjs/std-env/issues/170"
reactions: 0
comments: 0
labels: "[bug]"
---

# Jenkins recognized as Hudson

### Environment

Latest, Node 22.21.0

### Reproduction

Simply check provider during jenkins pipeline execution.

```js
import { provider } from 'std-env';
console.log(provider);
```

### Describe the bug

Currently the providers are recognized based on alphabetical order of config declaration. This causes Jenkins to be recognized as Hudson as Jenkins still provides fallback environment variables for compatibility reasons.

### Additional context

_No response_

### Logs

```sh

```
---
number: 9726
title: "Should `vitest --ui` work from a container?"
category: "Q&A"
created: 2026-02-24
url: "https://github.com/vitest-dev/vitest/discussions/9726"
upvotes: 1
comments: 1
answered: false
---

# Should `vitest --ui` work from a container?

I'm working inside a debian vscode dev container on windows.
Running `vitest --ui`, the ui is not accessible from the host.
Running `vitest --ui --api.host`, only the static resources are served.

Should this work?
Is there something else I should check?
If a proxy or something is required, I just won't use the ui.

```
Firefox can’t establish a connection to the server at ws://localhost:51204/__vitest_api__?token=ba22a178-b3b3-40eb-871f-fce1dac6450c.
```
```
VM88:1 Uncaught ReferenceError: p1 is not defined
    at <anonymous>:1:9
    at <anonymous>:1:54
(anonymous) @ VM88:1
(anonymous) @ VM88:1Understand this error
index-BUCFJtth.js:19 Uncaught (in promise) Error: Cannot connect to the server in 60 seconds
    at index-BUCFJtth.js:19:9546
```

<img width="760" height=...

---

## Top Comments

**@hi-ogawa** [maintainer]:

I tested vscode dev container (on linux though) and `vitest --ui --api.host=0.0.0.0` is working for me.

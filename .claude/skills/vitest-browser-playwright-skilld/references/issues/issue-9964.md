---
number: 9964
title: Snapshots do not render completely anymore since 4.1.1
type: bug
state: open
created: 2026-03-24
url: "https://github.com/vitest-dev/vitest/issues/9964"
reactions: 2
comments: 8
labels: "[p3-minor-bug]"
---

# Snapshots do not render completely anymore since 4.1.1

### Describe the bug

Since 4.1.1 sometimes `toMatchSnapshot(largeObject)` does not render the entire object passed anymore. I suppose its related to this fixed bug.

### Reproduction

Have a large object checked with `toMatchSnapshot({meta: largeObject})` and upgrade to 4.1.1. Suddenly you get this new snapshot

```ts
...
"meta": [Object],
...
```

### System Info

```shell
System:
    OS: macOS 26.3.1
    CPU: (12) arm64 Apple M4 Pro
    Memory: 2.33 GB / 48.00 GB
    Shell: 5.9 - /bin/zsh
  Binaries:
    Node: 24.13.0 - ~/.nvm/versions/node/v24.13.0/bin/node
    Yarn: 4.12.0 - ~/.nvm/versions/node/v24.13.0/bin/yarn
    npm: 11.6.2 - ~/.nvm/versions/node/v24.13.0/bin/npm
  Browsers:
    Chrome: 143.0.7499.193
    Edge: 143.0.3650.139
    Safari: 26.3.1
```...
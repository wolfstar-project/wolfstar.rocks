---
number: 488
title: "[V6] Peer dependency mismatch for @takumi-rs/* in v6.0.0-beta.40 (peer range ^0.62.0 vs lock using 0.69.2)"
type: bug
state: closed
created: 2026-02-27
url: "https://github.com/nuxt-modules/og-image/issues/488"
reactions: 1
comments: 0
labels: "[bug]"
---

# [V6] Peer dependency mismatch for @takumi-rs/* in v6.0.0-beta.40 (peer range ^0.62.0 vs lock using 0.69.2)

###  The bug

There seems to be an inconsistency in `v6.0.0-beta.40` regarding `@takumi-rs/*` versions.

In `package.json`, the module declares:

```json
"peerDependencies": {
  "@takumi-rs/core": "^0.62.0",
  "@takumi-rs/wasm": "^0.62.0"
}
```

However, in the repository `pnpm-lock.yaml` for the same tag (v6.0.0-beta.40), the resolved versions are:

```
@takumi-rs/core: 0.69.2
@takumi-rs/wasm: 0.69.2
```

Since semver in 0.x treats ^0.62.0 as: ">=0.62.0 <0.63.0", `0.69.2` is not compatible with the declared peer range, even though the project itself appears to be using it successfully.


Best,

Emilien

###  To reproduce

https://perdu.com

###  Expected behavior

...
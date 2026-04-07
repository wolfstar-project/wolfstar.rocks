---
number: 8293
title: "Upgrading from vitest 3.1.4 to 3.2.0 lead to `Javascript out of memory`"
type: other
state: closed
created: 2025-07-11
url: "https://github.com/vitest-dev/vitest/issues/8293"
reactions: 11
comments: 7
labels: "[p4-important]"
---

# Upgrading from vitest 3.1.4 to 3.2.0 lead to `Javascript out of memory`

### Describe the bug

We (podman-destkop) recently experience very high failure rate to our unit tests on MacOS and Windows. (upstream issue https://github.com/podman-desktop/podman-desktop/issues/13166)

The error was the following error `JavaScript heap out of memory`

```
<--- Last few GCs --->
   ✓ Manifest images display without actions  1669ms

   ✓ Expect user confirmation to pop up when preferences require  1577ms
[2033:0x140008000]   143007 ms: Mark-Compact 1980.4 (2083.4) -> 1965.2 (2084.1) MB, pooled: 2 MB, 1644.33 / 0.00 ms  (average mu = 0.096, current mu = 0.095) allocation failure; scavenge might not succeed
[2033:0x140008000]   144376 ms: Mark-Compact 1981.0 (2084.1) -> 1965.8 (2084.6) MB, pooled: 2 MB, 1326.83 / 0.00 ms  (average mu = 0.066, current mu = 0.031) allocation failure; scavenge might not succeed


<--- JS stacktrace --->

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
----- Native stack trace -----

[...]
```

> Some links to failing jobs
> https://github.com/podman-desktop/podman-desktop/actions/runs/16211288764/job/45772360580
> https://github.com/podman-desktop/podman-desktop/actions/runs/16199172319/job/45775115482

We tried increase the memory with `cross-env NODE_OPTIONS=\"--max-old-space-size=4096\" vitest --run`, but every value we choose lead to flaky out of memory. Even with pretty large value like 8192:

```
[4744:00000181BCCA6000]  1377635 ms: Mark-Compact 7948.4 (8224.7) -> 7931.2 (8225.4) MB, pooled: 3 MB, 4293.89 / 0.00 ms  (average mu = 0.136, current mu = 0.114) allocation failure; scavenge might not succeed
```

...

---

## Top Comments

**@AriPerkkio** [maintainer] (+1):

I'm on 15.5 too. Are you sure `podman-desktop` does not require any additional dependencies during test run? Just `pnpm install` and that's it? Though all the tests seem to pass so I guess it's working correctly.

```
ari ~/Git/podman-desktop (main) $ npx envinfo --system --npmPackages '{vitest*,@vitest/*,vite,@vitejs/*,playwright,webdriverio}' --binaries --browsers

  System:
    OS: macOS 15.5
    CPU: (8) arm64 Apple M2
    Memory: 296.05 MB / 16.00 GB
    Shell: 3.2.57 - /bin/bash
  Binaries:
    Node: 22.17.0 - ~/.nvm/versions/node/v22.17.0/bin/node
    npm: 10.9.2 - ~/.nvm/versions/node/v22.17.0/bin/npm
    pnpm: 10.6.2 - ~/.nvm/versions/node/v22.17.0/bin/pnpm
    bun: 1.2.16 - ~/.bun/bin/bun
  Browsers:
    Brave Browser: 131.1.73.101
    Chrome: 138.0.7204.101
    Safari: 18.5
  npmPackages:
    @vitest/coverage-v8: ^3.2.4 => 3.2.4 
    @vitest/eslint-plugin: ^1.3.4 => 1.3.4 
    vite: ^7.0.3 => 7.0.3 
    vitest: ^3.2.4 => 3.2.4 
```...

**@AriPerkkio** [maintainer]:

I wasn't able to reproduce this locally but couple of things for you to try:

- Lower the `msw` version you are using. Try for example `v2.8.0`. The version you are using has known memory leak.
- Try pin-pointing the exact Vitest version with `3.2.0-beta` releases: `3.2.0-beta.1`, `3.2.0-beta.2` or `3.2.0-beta.3`.

**@AriPerkkio** [maintainer]:

Perfect - the changeset between `3.1.4` and `3.2.0-beta.1` is a lot less than compared to `3.2.0`.

Should this reproduce on Node `22.17.0`? I'm seeing all tests passing constantly locally. I've run it more than 5 times now.

```
$ git log -1
commit fa20ccfe5d050735078ee3e24f3a5118128774c8

$ node -v
v22.17.0

$ cross-env NODE_OPTIONS=\"--max-old-space-size=512\" pnpm run test:unit
...

Test Files  711 passed (711)
     Tests  4484 passed | 5 skipped (4489)
  Start at  18:53:14
  Duration  151.15s
```

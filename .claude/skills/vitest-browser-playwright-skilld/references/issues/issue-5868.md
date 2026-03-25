---
number: 5868
title: Typecheck not performed if there are no test-d files
type: bug
state: open
created: 2024-06-10
url: "https://github.com/vitest-dev/vitest/issues/5868"
reactions: 5
comments: 4
labels: "[p3-minor-bug, feat: typecheck]"
---

# Typecheck not performed if there are no test-d files

### Describe the bug

Based on the checked "Allow running vitest typecheck even, if there are no potential tests (vitest still shows source errors)" in https://github.com/vitest-dev/vitest/pull/2107, I'd assume vitest can act as a typechecker, even in the absence of explicit type tests.

However it appears Vitest does not perform typechecks if there are no typecheck tests detected. I was hoping to rely on Vitest for typechecking as there may be tests added later on, and just let it do "basic" typechecking for the time being but it seems this is currently not supported (requires at least dummy test case).

### Reproduction

https://stackblitz.com/edit/vitest-dev-vitest-wbddaw

Observe the lack of type error reported. If a file named `a.test-d.ts` is created, type errors will start being reported.

### System Info

```shell
System:
    OS: Linux 6.9 Arch Linux
    CPU: (8) x64 Intel(R) Core(TM) i7-7700K CPU @ 4.20GHz
    Memory: 7.10 GB / 15.58 GB
    Container: Yes
    Shell: 5.9 - /bin/zsh
  Binaries:
    Node: 22.1.0 - ~/.nvm/versions/node/v22.1.0/bin/node
    Yarn: 1.22.22 - /bin/yarn
    npm: 10.7.0 - ~/.nvm/versions/node/v22.1.0/bin/npm
    pnpm: 9.0.4 - /bin/pnpm
    bun: 1.1.10 - /bin/bun
  Browsers:
    Chromium: 125.0.6422.112
  npmPackages:
    @vitejs/plugin-vue: ^5.0.5 => 5.0.5 
    @vitest/coverage-v8: ^1.6.0 => 1.6.0 
    @vitest/ui: ^1.6.0 => 1.6.0 
    vite: ^5.2.12 => 5.2.12 
    vitest: ^1.6.0 => 1.6.0
```


### Used Package Manager

...
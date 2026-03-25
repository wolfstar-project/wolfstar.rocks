---
number: 4762
title: The performance problem of graph view in ui
type: bug
state: open
created: 2023-12-16
url: "https://github.com/vitest-dev/vitest/issues/4762"
reactions: 5
comments: 1
labels: "[pr welcome, feat: ui, performance, p3-minor-bug]"
---

# The performance problem of graph view in ui

### Describe the bug

When a module imports too many modules, the UI's Graph view will freeze.  And there are many external modules shown as inline in it.


### Reproduction

You just need to run `npm run test:ui`, and open the module graph of `normalization.test.ts`.
https://github.com/zjut-bio-party-undergraduate-branch/Excel-Compare-and-Import


### System Info

```shell
System:
    OS: Windows 10 10.0.22621
    CPU: (16) x64 AMD Ryzen 9 5900HS with Radeon Graphics        
    Memory: 11.86 GB / 31.41 GB
  Binaries:
    Node: 18.17.1 - C:\Program Files\nodejs\node.EXE
    npm: 8.19.2 - C:\Program Files\nodejs\npm.CMD
  Browsers:
    Edge: Chromium (120.0.2210.61)
    Internet Explorer: 11.0.22621.1
  npmPackages:
    @vitejs/plugin-vue: ^4.0.0 => 4.5.2 
    @vitest/coverage-v8: ^1.0.0 => 1.0.4 
    @vitest/ui: ^1.0.0 => 1.0.4 
    vite: ^5.0.0 => 5.0.10 
    vitest: ^1.0.0 => 1.0.4
```


### Used Package Manager

npm

### Validations

- [X] Follow our Code of Conduct
- [X] Read the Contributing Guidelines.
- [X] Read the docs.
- [X] Check that there isn't already an issue that reports the same bug to avoid creatin...
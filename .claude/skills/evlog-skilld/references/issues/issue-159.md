---
number: 159
title: "[bug] CJS projects cannot resolve subpath exports (evlog/nestjs, evlog/otlp, etc.)"
type: bug
state: closed
created: 2026-03-09
url: "https://github.com/HugoRCD/evlog/issues/159"
reactions: 0
comments: 0
labels: "[bug]"
---

# [bug] CJS projects cannot resolve subpath exports (evlog/nestjs, evlog/otlp, etc.)

### Description

### Problem

  All subpath exports in evlog only define an "import" condition:

```
  "./nestjs": {
    "types": "./dist/nestjs/index.d.mts",
    "import": "./dist/nestjs/index.mjs"
  }
```

  Node's CJS require() resolver does not match the "import" condition, so any project that compiles to CommonJS (e.g. NestJS with SWC, which is NestJS's default compiler) gets:

  ```
 Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './nestjs' is not defined
  by "exports" in node_modules/evlog/package.json
```

  This affects all subpath exports, not just ./nestjs.

###   Expected behavior

`require('evlog/nestjs')` should resolve successfully in CJS projects, since Node 22+ can require() .mjs files when the export condition matches.

###   Suggested fix

...
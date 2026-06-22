---
tag: "knip@5.84.1"
version: 5.84.1
published: 2026-02-18
name: Release 5.84.1
---

# Release 5.84.1

* Fix false positives for arrow-wrapped dynamic imports assigned to variables (#1544) (75a42c3aa4b8f9db59fb450ef4f45540ab94ec26) - thanks @jantimon!
* Improve pnpm arg handling (df8c353c7f30ee11d749b2cf3208f288def1ed84)
* Ignore `module.register` if 2nd arg is not `import.meta.url` (#1535) (970fdb1f747c0941759aa3e0394c30ff6cf63481)
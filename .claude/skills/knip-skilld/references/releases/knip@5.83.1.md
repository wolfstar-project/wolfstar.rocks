---
tag: "knip@5.83.1"
version: 5.83.1
published: 2026-02-06
name: Release 5.83.1
---

# Release 5.83.1

* Fix package.json import (f8c14c873127481927306751479001d16deafa58)
* Organize imports (5d716bae3919b3cd684f0c8c9af73a960d12c5cd)
* Update a bunch of dependencies (78bf644bbfc6554109d7098f83cd30fc8e115900)
* Add minimal test suite to vscode-knip (b6395089f6b307a145d2493bca59db9d5bc3364a)
* Add support for monorepo when installing dependency (close #1501) (5782b07f79eb1a25f90c5fdd62b1217db11246b1)
* Fix unused file output in table (0f3dbb47b850e731c4405e06809aa069f68c7608)
* Restore slonik in ecosystem tests (35d9185a39cb1efba55ce8a749d3eb9a31eb82a4)
* Fix type in exported value case (resolve #1508) (d6dda74021a2bc08931691ba1d10029102b0e425)
* Organize imports (fcdd33b9e8f9169cc0bfb921b468f163ec0f980f)
* Remove unused export (c777bae22c500606857d9df820aab8af7593b24e)
* Don't flag exports (including used as type) in protected or consumed exports (a01bec149b8977e0927bd1ecd9d0197a1626e3a6)
* Add npmx.dev to ecosystem tests (8f8205261fe88144df6cf0cde6e7007952f8ba1d)
* fix: fix vitest setupFiles resolution (#1511) (273b940f7e32ff7156c3a24875f5d9265ff2559a) - thanks @tmair!
* Improve & extend vitest args handling (6c49e5ca61866a8d3fe62aaf8f5a6764aa9c4e86)
* Detect Bun differently to avoid TS complaint (c1499d32332751fbbed4baa648f5360f1db36dbc)
* A temporary workaround until they catch up  (028b9726dfab717a41d95d7e73ad8ee2ca929d31)
* feat(vite): detect module entry from index.html (#1487) (a76ab85337c5459a0d22128d33d5fcd9e3623db6) - thanks @WooWan!
* Auto-format (69150bfd315dff04778f067438194122e4d50761)
* Add double-dash handling and add tests (close #1404) (4c1de75890c53f35529b6ea6f24e159c9532bedf)
* Revert most of previous commit 4c1de75 (0cd91ae44ee1bddc584c2fb7494147aeb3f53feb)
* Auto-format (cf3d8ff92cb53b769814c4140b3c56023d92fd27)
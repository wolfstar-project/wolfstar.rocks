---
number: 1630
title: " Knip doesn't recognize files/types referenced in package.json anymore"
type: bug
state: open
created: 2026-03-21
url: "https://github.com/webpro-nl/knip/issues/1630"
reactions: 0
comments: 0
labels: "[regression]"
---

#  Knip doesn't recognize files/types referenced in package.json anymore

### Prerequisites

- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've read the issue reproduction guide

### Reproduction url

https://github.com/iwan-uschka/knip-plugin-next-js-page-extensions

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Good version

5.88.1

### Bad version

6.0.1

### Description of the regression

In a monorepo i have a package `packages/tsconfig` containing a tsconfig JSON file referencing 3 different `index.d.ts`. These files are not recognized or evaluated anymore since the major update to version 6.

...
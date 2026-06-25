---
number: 1293
title: " TypeError [ERR_INVALID_ARG_TYPE] when running knip"
type: bug
state: closed
created: 2025-10-08
url: "https://github.com/webpro-nl/knip/issues/1293"
reactions: 3
comments: 4
resolvedIn: 5.65.0
labels: "[regression]"
---

#  TypeError [ERR_INVALID_ARG_TYPE] when running knip

### Prerequisites

- [x] I've read the relevant documentation
- [x] I've searched for existing issues
- [x] I've read the issue reproduction guide

### Reproduction url

https://stackblitz.com/edit/github-vxkkdxxp?file=package.json

### Reproduction access

- [x] I've made sure the reproduction is publicly accessible

### Good version

5.63.1

### Bad version

5.64.0

### Description of the regression

In my package.json I have a script that runs eslint passing two files in its argument (`"check-lint": "eslint . --config ./fileA --config ./fileB"` ).

...

---

## Top Comments

**@webpro** [maintainer] (+1):

It's a regression but you're not supposed to have multiple `--config` arguments: https://eslint.org/docs/latest/use/command-line-interface#-c---config

**@webpro** [maintainer]:

:rocket: _This issue has been resolved in v5.65.0. See Release 5.65.0 for release notes._

_Using Knip in a commercial project? Please consider becoming a sponsor._

**@gregauger**:

A similar error, but in my case the problematic file is `lint-staged.config.js` and use of the `() =>` syntax.

For this variant, the issue starts in 5.64.3 (no error in 5.64.2).

```
/** @type {import('lint-staged').Config} */
const config = {
  '**/*': [
    'prettier --write --ignore-unknown',
    () => 'npm run knip',
    () => 'npx tsc --noEmit',
  ],
}
export default config
```


...
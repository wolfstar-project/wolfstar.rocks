---
number: 1575
title: "Oxlint plugin: resolve jsPlugins dependencies from .oxlintrc.json"
type: other
state: open
created: 2026-02-26
url: "https://github.com/webpro-nl/knip/issues/1575"
reactions: 3
comments: 2
---

# Oxlint plugin: resolve jsPlugins dependencies from .oxlintrc.json

## Description

The oxlint plugin currently does not parse `.oxlintrc.json`, so dependencies referenced in the `jsPlugins` array are reported as unused `devDependencies`.

`jsPlugins` is an oxlint feature that allows loading **ESLint-compatible JavaScript plugins** at runtime. These are real npm dependencies that must be installed, but knip has no way to trace them.

### Example config

```json
{
  "jsPlugins": [
    "eslint-plugin-unused-imports",
    "eslint-plugin-security",
    { "name": "jsdoc-js", "specifier": "eslint-plugin-jsdoc" },
    "./local-plugin.mjs"
  ],
  "rules": {
    "unused-imports/no-unused-imports": "error",
    "security/detect-object-injection": "warn"
  }
}
```

### Current behavior

...

---

## Top Comments

**@webpro** [maintainer]:

Thanks for the report! Any chance you are willing to submit a pull request? No worries if not, me or someone else can pick it up later as well.

Resources: Contributing to Knip → CONTRIBUTING.md → DEVELOPMENT.md

**@nikolailehbrink**:

Yeah, will do that  
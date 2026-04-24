---
number: 129
title: "Reduce bundle size, when using a flag that does not depend on"
type: other
state: open
created: 2024-04-08
url: "https://github.com/unjs/std-env/issues/129"
reactions: 0
comments: 2
---

# Reduce bundle size, when using a flag that does not depend on

### Describe the feature

## What to Expect

If we use this flag, providers will be bundled, but even if we use a flag that does not depend on providers, such as `isWindows`, they will still be bundled.

If they do not depend on it, we expect them not to be bundled.

Also, if you use `isCI`, all providers' code will be bundled. It might be nice to have a way for users to resolve providers themselves by exporting an API that resolves them.

## Reproduction repo
https://github.com/kazupon/std-env-repro1

## Related
https://github.com/rolldown/rolldown/pull/754#discussion_r1552846344

### Additional information

- [x] Would you be willing to help implement this feature?
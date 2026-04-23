---
number: 925
title: Disable tips?
category: General
created: 2026-01-16
url: "https://github.com/motdotla/dotenv/discussions/925"
upvotes: 2
comments: 1
answered: false
---

# Disable tips?

Is there a way to disable all the "tip" messages? They add unnecessary noise to development & CI.

Imagine if every package you install started doing the same.

---

## Top Comments

**@motdotla** [maintainer]:

Yes you can pass the quiet: true option to config: https://github.com/motdotla/dotenv?tab=readme-ov-file#quiet

or you can set the `DOTENV_CONFIG_QUIET=true` env: https://github.com/motdotla/dotenv/blob/master/CHANGELOG.md#1720-2025-07-09
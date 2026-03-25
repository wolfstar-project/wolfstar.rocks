---
number: 9284
title: tsdown support?
category: "Q&A"
created: 2025-12-17
url: "https://github.com/vitest-dev/vitest/discussions/9284"
upvotes: 2
comments: 1
answered: false
---

# tsdown support?

Right now, vitest can infer its build parameters based on a `vite.config.ts` file, but it doesn't seem to for a `tsdown.config.ts`.

The main issue is that tsdown relies more on conventions and inference, so a lot of things aren't explicitly in the config either.

Has someone found a good way to make them play nice with each other and ensure I am testing the code as it is built for consumers, and not how vitest builds it instead?

---

## Top Comments

**@hi-ogawa** [maintainer]:

The direction wise, it's actually aimed to be opposite where tsdown infers vite or vitest config. https://tsdown.dev/options/config-file#extending-vite-or-vitest-config-experimental

Can you explain what config specifically you want to deduplicate between two configs? I think only thing matters is rollup/down plugins.
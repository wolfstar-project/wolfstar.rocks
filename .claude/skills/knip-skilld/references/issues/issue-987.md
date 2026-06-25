---
number: 987
title:  Unused pnpm catalog items
type: feature
state: closed
created: 2025-03-16
url: "https://github.com/webpro-nl/knip/issues/987"
reactions: 9
comments: 8
labels: "[feature request]"
---

#  Unused pnpm catalog items

### Suggest an idea for Knip

Pnpm recently introduced "Catalogs", an easy way to keep track of package versions used throughout a monorepo. Knip currently supports removing unused dependencies in package.json files, but it would also be nice if it would remove unused catalog entries inside pnpm-workspace.yaml files.

@antfu has already created an amazing eslint rule, which does the same thing, so that implementation could be used for inspiration. His `pnpm-workspace-yaml` also seems like a great way to parse the contents.

---

## Top Comments

**@webpro** [maintainer] (+1):

Might as well release this anyway:

- Knip can provide a uniform way of linting & fixing catalogs
- I've asked around, and unsure if/when vlt, Bun, and perhaps others will add `cleanupUnusedCatalogs` or equivalent
- Might be convenient having this in the same linting process (pnpm has `cleanupUnusedCatalogs` disabled by default, Knip will have it enabled by default because that's what it does).

An issue I've come across:

...

**@webpro** [maintainer] (+2):

Oh that's great! Glad I waited a bit. Now if vlt and Bun (and others..) will do the same we can cancel the work.

**@webpro** [maintainer] (+1):

Support for catalogs is in #1204. Feel free to give it a shot! Would be great to have some feedback before GA 
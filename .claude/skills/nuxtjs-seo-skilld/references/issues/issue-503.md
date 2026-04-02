---
number: 503
title: "[BUG] asSeoCollection (asOgImageCollection/asSchemaOrgCollection/asRobotsCollection/asSitemapCollection) crashes with Zod v4 due to version mismatch"
type: bug
state: closed
created: 2025-12-10
url: "https://github.com/harlan-zw/nuxt-seo/issues/503"
reactions: 2
comments: 3
resolvedIn: 3.3.0
labels: "[bug]"
---

# [BUG] asSeoCollection (asOgImageCollection/asSchemaOrgCollection/asRobotsCollection/asSitemapCollection) crashes with Zod v4 due to version mismatch

###  The bug

### Problem Description

When using `asSeoCollection` (which integrates `asOgImageCollection`, `asSchemaOrgCollection`, `asRobotsCollection`, `asSitemapCollection`) with `@nuxt/content` v3.9.0, the application crashes with:

```
ERROR  Zod toJSONSchema error for schema: ZodObject Cannot read properties of undefined (reading 'def')
```

### Root Cause

The issue stems from **Zod version mismatch** inside the four methods wrapped by `asSeoCollection`:

- `@nuxt/content@3.9.0` depends on `zod@3.25.76` and `zod-to-json-schema@3.25.0`
- The collections produced by `asOgImageCollection`, `asSchemaOrgCollection`, `asRobotsCollection`, and `asSitemapCollection` can receive schemas built with `zod@4.x` when users install it at the root

...

---

## Top Comments

**@harlan-zw** [maintainer] (+1):

Should be fixed in v3.3.0.

This looks great, I'll give it a spin.

**@harlan-zw** [maintainer]:

Thanks, I have started migrating modules to use peer dependencies, see https://github.com/nuxt-modules/sitemap/commit/9fca62d.

Let me know if you see any issues with this, I plan to have it rolled out in the coming days.

**@andy820621** (+1):

Thanks again for the update!!
I’ll wait for the rollout of the peer dependency changes and will test it once the new version is released.

By the way, I’ve also been working on a small Nuxt module recently:
@barzhsieh/nuxt-content-mermaid
It integrates Mermaid diagrams into Nuxt Content. I’m still learning module development, so if you ever happen to take a look, I’d really appreciate any suggestions.
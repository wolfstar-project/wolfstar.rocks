---
number: 29393
title: Smart caching with field-diffing by default
category: "Q&A"
created: 2026-03-25
url: "https://github.com/prisma/prisma/discussions/29393"
upvotes: 1
comments: 5
answered: false
---

# Smart caching with field-diffing by default

### Question

Hey — built something that might be useful to people here.

prisma-smart-cache is a caching proxy for Prisma with field-level invalidation. 
Most caches nuke the whole model on any write — this one tracks the query shape 
and only invalidates what actually changed.

Update user.bio → cache for user.email survives.
Update an Author → only Post queries that included that Author get invalidated.

Benchmarks against a real Neon DB:
- JOIN queries: 546ms → 33ms (-94%)
- Aggregates: 644ms → 28ms (-95.7%)

Transparent proxy, no schema changes, multi-tier (memory + Redis) via BentoCache.

Still v0.2, would love feedback from anyone who's hit caching pain with Prisma.
https://github.com/Uanela/prisma-smart-cache



---

## Top Comments

**@nurul3101** [maintainer] (+1):

Do you have a working example deployed somewhere so that I can take a look?

**@nurul3101** [maintainer]:

The library uses a proxy-based approach around PrismaClient rather than Prisma's `$extends` API. That's a concern for long-term compatibility since internal client behavior can change between versions, and extensions are the supported path for this kind of thing. Have you considered building this as a Prisma Client extension instead?

It'd be more meaningful to see how the invalidation logic holds up under realistic mixed workloads, especially with nested writes, transactions, createMany/updateMany, and $executeRaw. Those are the scenarios where cache consistency usually breaks.

It's stil...

**@Uanela**:

I've one let me organize it so that I can share the repo for you for testing.
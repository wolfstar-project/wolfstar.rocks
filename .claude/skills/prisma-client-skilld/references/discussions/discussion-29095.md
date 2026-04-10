---
number: 29095
title: "`query_compiler_*` files makes `@prisma/client` quite big"
category: "Q&A"
created: 2026-01-27
url: "https://github.com/prisma/prisma/discussions/29095"
upvotes: 3
comments: 3
answered: false
---

# `query_compiler_*` files makes `@prisma/client` quite big

### Question

Hi!

I noticed that `@prisma/client` version `7.3.0` comes in at a quite sizeable 74 MB when installed. Upon further inspection, I found that 69 MB of this comes from files of the form `query_compiler_*.wasm-base64.*`, which (as the naming suggests) presumably contain lots of base64-encoded WASM.

That's all fine, but what I think is unfortunate is that there are such files for every supported database (CockroachDB, MySQL, PostgreSQL, SQLite, and SQL Server), whereas I imagine the majority of projects only use one database, for instance PostgreSQL. Ideally, only the relevant query compiler files would be installed; taking PostgreSQL as an example, this would bring `@prisma/client` down to 19 MB, i.e. a 75% reduction.

As for how to achieve this, I'm not sure – I suppose...

---

## Top Comments

**@mergisi**:

Great observation! This is a common pain point with ORMs that support multiple databases - the trade-off between flexibility and bundle size.

Your suggestion about database-specific packages makes sense. Some approaches the Prisma team could consider:

1. **Adapter packages**: `@prisma/adapter-postgresql`, `@prisma/adapter-mysql`, etc. where each contains only its query compiler
2. 2. **Build-time detection**: Analyze the schema's `provider` field and tree-shake unused compilers during `prisma generate`
3. 3. **Lazy loading**: Load compilers dynamically at runtime based on the configure...

**@vincedsb1**:

You are addressing the issue of large bundle size in `@prisma/client` due to database-specific query compiler files not being tree-shaken.

```typescript
// Potential solution for tree-shaking database-specific query compiler files
// Currently, @prisma/client bundles all query compilers which leads to a large size
// Consider implementing a mechanism to only include necessary query compilers based on the configured provider
```

By default, Prisma includes all database query compilers, leading to a bloated bundle size. Implementing a mechanism to include only relevant query compilers ...

**@vincedsb1** (+1):

Sorry about the generic reply earlier.

You are absolutely right, carrying 70MB of unused WASM binaries is painful. It's a side effect of the current architecture prioritizing zero-config setups. The team is aware of this modularity issue, and the roadmap for Driver Adapters (@prisma/adapter-pg, etc.) is likely the path that will finally allow tree-shaking those unused engines in the future.
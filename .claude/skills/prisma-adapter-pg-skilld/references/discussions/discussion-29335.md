---
number: 29335
title: Transaction propagation across repositories
category: "Q&A"
created: 2026-03-11
url: "https://github.com/prisma/prisma/discussions/29335"
upvotes: 1
comments: 2
answered: true
---

# Transaction propagation across repositories

### Question

## Problem

In a layered architecture (hexagonal / clean), the **core layer** defines abstract repository interfaces and business logic. The **infrastructure layer** provides concrete implementations using an ORM. The core layer never imports the ORM.

Each repository implementation injects a single shared ORM client. This works until a core-layer service needs **atomicity across multiple repository calls**: the ORM's transaction API provides a dedicated transaction client, but repositories don't know about it — they keep using the shared client, which picks a different connection from the pool.

This causes two problems:

1. **No atomicity** — if one repository call fails, changes from earlier calls on other connections are already committed and won't roll back.
2...

---

## Accepted Answer

@seb-mynotary This is a classic dilemma in layered architectures. The cleanest solution that doesn''t leak ORM details to the core is **Async Local Storage (ALS)**.

Strategy:
1. **Infrastructure Layer**: Implement a UnitOfWork manager that uses `AsyncLocalStorage` to hold the "current" Prisma transaction client.
2. **Repository**: When a method runs, it checks ALS. If a transaction client exists, use it; otherwise use the global client.
3. **Core**: Calls `uow.run(() => { callServiceA(); callServiceB(); })`. The core only knows about a generic "atomicity" concept, not Prisma.

In Node.js, `AsyncLocalStorage` is stable and performant for this exact purpose (propagating context without arguments). Libraries like `cls-hooked` or `nestjs-cls` wrap this if you use frameworks.
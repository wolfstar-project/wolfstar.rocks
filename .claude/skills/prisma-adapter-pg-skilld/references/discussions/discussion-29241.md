---
number: 29241
title: PrismaClientInitializationError
category: "Q&A"
created: 2026-02-23
url: "https://github.com/prisma/prisma/discussions/29241"
upvotes: 1
comments: 2
answered: true
---

# PrismaClientInitializationError

### Question

# I'm getting PrismaClientInitializationErrorwhen trying to initialize prisma client
_I'm new to using prisma and wanted to experiment._

The connection string looks like:
`mongodb://<user>:<pass>@192.168.1.X:27017/ra3_db?authSource=ra3_db`
i's a self hosted mongodb server and I've made sure the url works with the mongodb compass.

Currently there is nothing but my attempt to make an authentication system with next auth v5

---
⨯ Error [PrismaClientInitializationError]: `PrismaClient` needs to be constructed with a non-empty, valid `PrismaClientOptions`:

```
new PrismaClient({
  ...
})
```

or

```
constructor() {
  super({ ... });
}
```

    at prismaClientSingleton (lib\prisma.ts:4:10)
    at module evaluation (lib\prisma.ts:13:42)
    at module...

---

## Accepted Answer

**@nurul3101** [maintainer]:

Hey @Devox628!

You need to use Prisma version 6. It's likely that you are using Prisma version 7 which doesn't support MongoDB at the moment.
Could you please try with Prisma v6? 
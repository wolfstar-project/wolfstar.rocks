---
number: 29339
title: "Cannot solve PrismaClientInitializationError: Query Engine not found on Vercel with custom output and Next.js 16 (Turbopack)"
category: "Q&A"
created: 2026-03-13
url: "https://github.com/prisma/prisma/discussions/29339"
upvotes: 1
comments: 3
answered: true
---

# Cannot solve PrismaClientInitializationError: Query Engine not found on Vercel with custom output and Next.js 16 (Turbopack)

### Question

Locally everything works perfectly. When deploying to Vercel production environment, the deployment is successful but when I navigate to a page that pulls data from db, I get a a server-side exception `Error [PrismaClientInitializationError]:` with the detail `Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x".` . Currently I'm using Next.js 16.1.6 (Turbopack) and Prisma (Postgres) 6.19.2. As suggested by Prisma docs I'm using a custom output for the client generator:
 ```
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

Reading discussion all over the internet I tried to use the environment variable `PRISMA_QUERY_ENGINE_LIBRARY = /var/task/ap...

---

## Accepted Answer

**The root cause:** You're using the binary Query Engine (`libquery_engine-*.so.node`), which Vercel's serverless bundling often fails to include — especially with custom `output` paths. The good news is you already have `@prisma/adapter-pg` installed but aren't actually using it.

**The fix — switch to the driver adapter approach (Wasm engine, no binary needed):**

**1. Update your `schema.prisma`** — remove `binaryTargets` (not needed with adapters):

```prisma
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}
```

**2. Update your `prisma.ts`** to use the adapter:

```typescript
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const adapter = new PrismaPg(process.env.DATABASE_URL!)
  return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const db = globalForPrisma.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```...
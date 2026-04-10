---
number: 29369
title: "Prisma v7 + Docker: How to run prisma migrate deploy without prisma.config.ts and fix Query Engine not found in production\""
category: "Q&A"
created: 2026-03-22
url: "https://github.com/prisma/prisma/discussions/29369"
upvotes: 1
comments: 1
answered: true
---

# Prisma v7 + Docker: How to run prisma migrate deploy without prisma.config.ts and fix Query Engine not found in production"

### Question

  I'm deploying a Next.js 16 app with Prisma v7 in Docker and hitting two related issues:
                                                                                                                                                                                                          
  1. prisma migrate deploy fails in Docker — can't find datasource URL                                                                                                                                    
                                                                                                                                                                                                          
  In Prisma v7, url = env("DATABASE_URL") was removed from schema.prisma and moved ...

---

## Accepted Answer

Both issues stem from how Prisma v7 changed config handling. Here's the fix for each:

**1. Fix migrations in Docker — include `prisma.config.ts`**

Prisma v7 removed `url = env("DATABASE_URL")` from `schema.prisma` and now requires `prisma.config.ts` as the single source of truth for connection config. You need to copy it into your Docker image explicitly.

Create a `prisma.config.ts` in your project root:

```typescript
// prisma.config.ts
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  migrate: {
    async url() {
      return process.env.DATABASE_URL!;
    },
  },
});
```

**2. Fix Query Engine not found — add `binaryTargets` and copy generated client**

Your schema needs to specify the target platform for Docker:

```prisma
generator client {
  provider      = "prisma-client"
  output        = "../src/generated/prisma"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}

...
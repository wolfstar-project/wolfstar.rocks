---
number: 29173
title: Missing query engine in prisma 7
category: "Q&A"
created: 2026-02-12
url: "https://github.com/prisma/prisma/discussions/29173"
upvotes: 1
comments: 1
answered: true
---

# Missing query engine in prisma 7

### Question

Here is my schema.prisma:
```
generator client {
  provider      = "prisma-client-js"
  output        = "../.prisma/generated"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

generator zod {
  provider         = "zod-prisma-types"
  output           = "../.prisma/generated/zod"
  createInputTypes = false
}

datasource db {
  provider = "postgresql"
}
```
Yes, I am still using the old rust engine. Previously in prisma 6, the `libquery_engine-linux-musl-openssl` file will be generated in my `.prisma/generated` folder as specified as my output. I assume that file is the query engine?

In prisma 7, the file is not generating anymore. This causes a weird problem: When I make changes to my `schema.prisma` file such as adding a new field, the changes ...

---

## Accepted Answer

Nvm I might be a bit dumb. Reviewed the prisma 7 release changelog and saw that they indeed removed BinaryEngine which I assume is how I generate the `libquery_engine-linux-musl-openssl` file.
If so, what is the difference between `prisma-client-js` and `prisma-client`? Is it just the default output location?
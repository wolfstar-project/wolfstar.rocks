---
number: 28962
title: Prisma Pool Timeout in prisma v7
category: "Q&A"
created: 2025-12-26
url: "https://github.com/prisma/prisma/discussions/28962"
upvotes: 1
comments: 2
answered: true
---

# Prisma Pool Timeout in prisma v7

### Question

I have a problem with my Prisma v7, initially I was told to add an adapter, then I added the MariaDB adapter and after adding it I got a pooltimeout error. Why is that? Can anyone explain?

The error: "{
  message: 'pool timeout: failed to retrieve a connection from pool after 10013ms\n' +
    '    (pool connections: active=0 idle=0 limit=5)',
  target: 'members.findUnique',
  timestamp: 2025-12-26T09:54:42.336Z
}"

file schema:
" generator client {
  provider     = "prisma-client-js"
  engineType   = "client"
  binaryTarget = ["native"]
}

datasource db {
  provider = "mysql"
} "

### How to reproduce (optional)




### Expected behavior (optional)

_No response_

...

---

## Accepted Answer

**@nurul3101** [maintainer]:

Hey @HamamPriyatmoko!

Can you provide a minimal reproduction?

Based on the snippets you have shared, in the schema.prisma file for Prisma 7 you don't need these configurations:
```
engineType = "client"
binaryTarget = ["native"]
``` 

and you can replace `provider = "prisma-client-js"` with `provider = "prisma-client"`.
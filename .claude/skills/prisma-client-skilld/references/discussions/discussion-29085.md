---
number: 29085
title: "What does `single_use_connections` connection parameter do?"
category: "Q&A"
created: 2026-01-23
url: "https://github.com/prisma/prisma/discussions/29085"
upvotes: 1
comments: 1
answered: true
---

# What does `single_use_connections` connection parameter do?

### Question

When hitting `t` in `prisma dev` it outputs a connection string that includes `single_use_connections=true`:

...

---

## Accepted Answer

**@nurul3101** [maintainer]:

Hey @janpio!

Glad to see you! Hope you are doing great! 

 `single_use_connections=true` automatically closes connection after each query instead of returning them to the pool.
 
 Related PR: https://github.com/prisma/prisma-engines/pull/5436
 
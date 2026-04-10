---
number: 29162
title: "prisma generate --sql requires a running database (P1001), while prisma generate works without one"
category: "Q&A"
created: 2026-02-11
url: "https://github.com/prisma/prisma/discussions/29162"
upvotes: 1
comments: 2
answered: true
---

# prisma generate --sql requires a running database (P1001), while prisma generate works without one

### Question


I’m experiencing a difference in behavior between prisma generate and prisma generate --sql.

Context
	•	Backend framework: NestJS
	•	Prisma is used to generate @prisma/client
	•	We are using the --sql option because we need the generated SQL-related client code during Docker build
	•	The Docker build environment is isolated and does not have access to a running database

Observed Behavior
	•	npx prisma generate works fine without a running database
	•	npx prisma generate --sql fails with:


```
Error: P1001

Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

Problem

During Docker build, I need the generated SQL client code inside @prisma/client.
However, requiring a live datab...

---

## Accepted Answer

**@nurul3101** [maintainer]:

TypedSQL (prisma generate --sql) does require an active database connection by design today. This is not just a generic schema validation step, the feature relies on the database to parse the SQL and return type information, which is why prisma generate works offline but prisma generate --sql fails with P1001 when no database is reachable.

There is a feature request for removing this requirement here:
- https://github.com/prisma/prisma/issues/25124

There are recommendations in the linked issue on how you can pre-generate the TypedSQL files in a dev environment that has DB access, commit or otherwise persist them, and then reuse them during Docker builds.
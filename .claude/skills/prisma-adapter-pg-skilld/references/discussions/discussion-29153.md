---
number: 29153
title: Prisma $queryRawTyped and Zod validation
category: "Q&A"
created: 2026-02-08
url: "https://github.com/prisma/prisma/discussions/29153"
upvotes: 1
comments: 3
answered: true
---

# Prisma $queryRawTyped and Zod validation

### Question

Hi guys.
How are you doing?
I'm working with Prisma's $queryRawTyped to execute an SQL query that fetches some data from my application's database.
My query looks like this
...

---

## Accepted Answer

@FrancescoDiMuro this is a fundamental type mismatch: prisma's TypedSQL uses `null` (SQL only has NULL), zod's `.optional()` uses `undefined`. the generation logic is in `mapTypes.ts` where nullable params always become `T | null`.

cleanest fix is a reusable helper:

```typescript
const nullableParam = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional().transform((v) => v ?? null)

const QuerySchema = z.object({
  firstName: nullableParam(z.string().trim()),
  lastName: nullableParam(z.string().trim()),
  genderId: nullableParam(z.coerce.number().int()),
  roleId: nullableParam(z.coerce.number().int()),
  phoneNumber: nullableParam(z.string().trim()),
  active: nullableParam(z.coerce.boolean()),
})
```

alternatively, if you want to avoid transforms entirely, use `.nullable().catch(null)`:

```typescript
const nullableString = () => z.string().trim().nullable().catch(null)

...
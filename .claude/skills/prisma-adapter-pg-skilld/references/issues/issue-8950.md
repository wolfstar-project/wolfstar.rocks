---
number: 8950
title: Postgres Full-Text Search Index is not used
type: bug
state: open
created: 2021-08-26
url: "https://github.com/prisma/prisma/issues/8950"
reactions: 167
comments: 79
labels: "[bug/2-confirmed, kind/bug, tech/engines, topic: indexes, topic: postgresql, topic: fullTextSearch, topic: index/gin]"
---

# Postgres Full-Text Search Index is not used

### Bug description

Current FTS appear to not use defined GIN or GIST index

Recommended GIN index in doc is also not working 
```
ERROR:  data type text has no default operator class for access method "gin"
HINT:  You must specify an operator class for the index or define a default operator class for the data type.
```

As far as I know it should be something like this since body is of type `String` in schema
```sql
CREATE INDEX IF NOT EXISTS "post_body_index" ON "Posts" USING GIN (to_tsvector('english', "body"));
-- Or/And
CREATE INDEX IF NOT EXISTS "post_body_index" ON "Posts" USING GIST (to_tsvector('english', "body"));
```

And request should be something like this 
```sql
SELECT "public"."Posts".*
FROM "public"."Posts" 
WHERE to_tsvector('english', "public"."Posts"."body") @@ to_tsquery('test | test');
```

`english` in `to_tsvector` could be another language so it should be dynamic from @prisma/client

There is also a concatenation problem when you do 
```ts
const result = await prisma.posts.findMany({
  where: {
    status: 'Draft',
    OR: [
      { body: { search: 'cat & dog' }},
      { anotherField: { search: 'test | test' }}
    ]
  },
})
```

Where the `body` and `anotherField` get concatenated in sql
```sql
SELECT "public"."Posts".*
FROM "public"."Posts" 
WHERE to_tsvector("public"."Posts"."body"|| ' ' ||"public"."Posts"."anotherField") @@ to_tsquery($1)
```

instead of 
```sql
SELECT "public"."Posts".*
FROM "public"."Posts" 
WHERE to_tsvector('english', "public"."Posts"."body" || "public"."Posts"."anotherField") @@ to_tsquery($1)
```

This problem also prevent using GIN/GIST index with two field 

### How to reproduce

See bug description


### Expected behavior

_No response_

### Prisma information

full-text search exemple in doc
https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search

### Environment & setup

- OS: Mac OS
- Database: PostgreSQL
- Node....

---

## Top Comments

**@anupkumarsharma** (+17):

When can we expect this change by? This seems to be a blocking issue. 


**@AzSiAz** (+5):

` @@fulltext` seem to be only for MySQL & MongoDB, unfortunately I am on PostgreSQL...

3.6.0 still concatenate in query when using two field thought, but I am not sure if that's a problem or not

**@janpio** (+6):

Support for the PostgreSQL index creation via Prisma Migrate is tracked in https://github.com/prisma/prisma/issues/10386
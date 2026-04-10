---
number: 29167
title: "Exposing Prisma's internal validation functions"
category: "Q&A"
created: 2026-02-11
url: "https://github.com/prisma/prisma/discussions/29167"
upvotes: 1
comments: 2
answered: true
---

# Exposing Prisma's internal validation functions

### Question

Reopening an older question that was previously asked but closed without an answer: https://github.com/prisma/prisma/discussions/18111
> The schema validation done by Prisma before sending requests is great. I need to separate the validation from the execution of the query, is there any way I can do that?

Like the original commentor I am looking for a way to run the validation prior to running the query.

---

### Example

To give a more concrete example of why this would be useful, I am implementing a Prisma Client Extension that modifies a query's function type but I would like to first assert that the original query is valid according to Prisma, ie. execute just the runtime validation that wo...

---

## Accepted Answer

Prisma doesn't expose its internal validation functions as a public API, and there's no official way to run the query validation step separately from execution. The validation is tightly coupled to the query engine.

That said, here are practical workarounds for the use case you described (validating a query's shape in a client extension before modifying it):

### 1. Use Zod schemas derived from your Prisma schema

Generate Zod validators from your Prisma models using `zod-prisma-types` or the built-in `prisma-zod-generator`:

```prisma
generator zod {
  provider = "zod-prisma-types"
}
```

Then validate the input in your extension before passing it through:

...
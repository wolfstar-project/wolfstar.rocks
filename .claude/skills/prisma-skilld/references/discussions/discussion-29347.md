---
number: 29347
title: Minified code on exception
category: "Q&A"
created: 2026-03-17
url: "https://github.com/prisma/prisma/discussions/29347"
upvotes: 1
comments: 2
answered: true
---

# Minified code on exception

### Question

Every time prisma throws any kind of exception, my terminal is filled with the minified code of the generated prisma client.
I can't find any info online so I must be doing something wrong...

For example, If I generate an unique constraint error, I get this:

...

---

## Accepted Answer

This isn't about `errorFormat` — it's about how **Bun** (and Node.js) render stack traces when the source file is accessible.

**Why it happens:** When Prisma Client is generated inside `node_modules`, runtimes like Bun collapse those stack frames (they're treated as library internals). When you generate it to a custom output like `../../src/generated/prisma`, Bun treats it as **your own source code** and helpfully shows the surrounding lines of code in the stack trace. Since `client.js` is minified/bundled, those "surrounding lines" are the massive wall of minified code you're seeing.

**Fix 1 — Tell Bun to hide those frames:**

Create or update your `bunfig.toml`:

```toml
[run]
# Hide generated Prisma files from stack traces
hide = ["src/generated/**"]
```

This tells Bun to treat files in that path as library code and collapse the stack frames, just like it does for `node_modules`.

**Fix 2 — Use the `prisma-client` generator (Prisma v7 recommended):**

In Prisma ...
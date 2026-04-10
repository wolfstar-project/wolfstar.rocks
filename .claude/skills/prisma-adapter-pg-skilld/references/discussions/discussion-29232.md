---
number: 29232
title: How to change BigInt type after Prisma Extension?
category: "Q&A"
created: 2026-02-22
url: "https://github.com/prisma/prisma/discussions/29232"
upvotes: 1
comments: 2
answered: true
---

# How to change BigInt type after Prisma Extension?

### Question

To work with bigint fields in Prisma Client, I followed this guide https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types#serializing-bigint, and created an extension:
```ts
const convertBigIntExt = Prisma.defineExtension({
  name: 'convertBigIntExt',
  query: {
    $allOperations: async ({ args, query }) => {
      const result = await query(args);
      return JSON.parse(
        JSON.stringify(result, (_key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ),
      );
    },
  },
});
```
Now all bigint fields are returned as strings, great, but TypeScript still says they are `BigInt`. Anytime I want to do some transformation, I have to write `field as unknown as string` which is inconvenient. How do I get the ...

---

## Accepted Answer

@7200228 Prisma Extensions (client extensions) only modify the runtime behavior/result; they do not automatically update the `Prisma.d.ts` generated types unless the extension is strictly typed using the `Prisma.defineExtension` generics correctly, which can be tricky for `BigInt` transformation across *all* models.

The cleanest way to get correct types is indeed to use a transformation layer (like Zod) at the boundary, OR manually cast the result if you have a global extension.
Unfortunately, `unknown as string` is often the pragmatic solution for extension-modified return types until the TypeScript API for extensions matures further.
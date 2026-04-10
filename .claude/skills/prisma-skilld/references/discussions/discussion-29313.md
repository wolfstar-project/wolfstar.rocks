---
number: 29313
title: "ReferenceError: Cannot access 'pg' before initialization after vite build (Nitro SSR bundle)"
category: "Q&A"
created: 2026-03-07
url: "https://github.com/prisma/prisma/discussions/29313"
upvotes: 1
comments: 2
answered: true
---

# ReferenceError: Cannot access 'pg' before initialization after vite build (Nitro SSR bundle)

### Question

### Description

After running `vite build` on a TanStack Start app, the production SSR server crashes on every request with:

```
ReferenceError: Cannot access 'pg' before initialization
      at get default (file:///.output/server/_ssr/router-CvtymItv.mjs:147:5)
      at getAugmentedNamespace (file:///.output/server/_ssr/router-CvtymItv.mjs:2308:13)
      at file:///.output/server/_ssr/router-CvtymItv.mjs:14967:38
```
   ---

  ### Monorepo Structure

  mercari-scraper/                 (Turborepo)
  ├── apps/
  │   └── web-tanstack/            # TanStack Start app (this app)
  │       ├── src/
  │       │   ├── trpc/
  │       │   │   ├── setup.ts     # imports prisma from @mercari-scraper/database
  │       │   │   └── routers/
  │       │   │       ...

---

## Accepted Answer

What is happening: Nitro bundles `pg` (a CJS package) into a single ESM output, and during the process it hoists `let`/`const` declarations but gets the initialization order wrong. A getter tries to reference `pg` before it is actually assigned — classic TDZ error, but caused by the bundler, not your code.

The `interop: 'compat'` setting you tried only changes how `module.exports` vs `export default` is resolved. It does not touch declaration ordering at all.

The right fix is to externalize `pg` so Nitro never tries to inline it:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    tanstackStart({ ... }),
    nitro({
      externals: {
        inline: [],
        external: ["pg"],
      },
      // or alternatively:
      unenv: {
        external: ["pg"],
      },
    }),
    viteReact(),
  ],
});
```

...
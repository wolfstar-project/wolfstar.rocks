---
number: 34154
title: Catch-22 with virtual files that import / re-export user-provided code in a module
category: Questions
created: 2026-01-23
url: "https://github.com/nuxt/nuxt/discussions/34154"
upvotes: 1
comments: 1
answered: true
---

# Catch-22 with virtual files that import / re-export user-provided code in a module

I'm developing a Nuxt module for setting up a GraphQL server with generated type-safe operations and I'm hitting a brick wall when it comes to re-exporting user code from emitted virtual files.

In short: the user installs the module and configures their GraphQL context & schema(s) definition by specifying a file path inside `server/` like so:
```ts
export default defineNuxtConfig({
  modules: ["@lewebsimple/nuxt-graphql"],
  graphql: {
    server: {
      context: ["server/graphql/context.ts"],
      schemas: {
        local: { type: "local", path: "server/context/schema.ts" },
      },
    },
  },
});
```

The module then resolves these paths and emits a `.nuxt/graphql/context.mjs` virtual file that looks like this:
```ts
import context0 from "(resolved rootDir)/server/graphql/context";

export const contextFactories = [context0];
```...

---

## Accepted Answer

@lewebsimple the fix is to emit `.mjs` + `.d.ts` (not `.ts`) and add the user's source directory to `build.transpile`. this is the pattern established modules like [@nuxt/image](https://github.com/nuxt/image/blob/main/src/module.ts) and [@nuxtjs/i18n](https://github.com/nuxt-modules/i18n/blob/main/src/module.ts) use.

- `.mjs` in dev fails because vite won't transform `.ts` imports from non-transpiled `.mjs` files
- `.ts` in build fails because rollup's inject plugin can't parse typescript without a transform step

```ts
// 1. emit as .mjs
addTemplate({
  filename: 'graphql/context.mjs',
  getContents() {
    return `import context0 from "${resolvedPath}";\nexport const contextFactories = [context0];`
  },
  write: true,
})

// 2. emit types separately
addTypeTemplate({
  filename: 'graphql/context.d.ts',
  getContents() { /* your type declarations */ },
})

// 3. the critical missing piece
nuxt.options.build.transpile.push(
  resolve(nuxt.options.rootDir, 'server/graphql')
)
```

...
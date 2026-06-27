---
number: 34010
title: "Clarification of `addImportsDir` from `@nuxt/kit` behavior"
category: Questions
created: 2026-01-03
url: "https://github.com/nuxt/nuxt/discussions/34010"
upvotes: 1
comments: 4
answered: true
---

# Clarification of `addImportsDir` from `@nuxt/kit` behavior

In my module, I have a file with couple of named exports - two string constants and four methods:

https://github.com/AloisSeckar/nuxt-neon/blob/master/src/runtime/shared/utils/neonErrors.ts

To reduce maintenance overhead in my `module.ts` declaration, I used:

```
addImportsDir(resolver.resolve('runtime/shared/utils'))
```

and thought I would get all 6 members auto-imported.

While this worked correctly within my playground app, when the module is downloaded as npm package (using Nuxt `4.2.2`), only the first entry from each file is listed in `imports.d.ts`:

```ts
// .nuxt/imports.d.ts in my repository and its playground app
export { NEON_ENDPOINTS_DISABLED, NEON_RAW_ENDPOINT_DISABLED, isNeonSuccess, isNeonError, formatNeonError, handleNeonError } from '../src/runtime/shared/utils/neonErrors';

// .nuxt/imports.d.ts in target app that depends on `nuxt-neon` package and is using `nuxt-neon` module:
export { NEON_ENDPOINTS_DISABLED } from '../node_modules/.pnpm/nuxt-neon@0.8.0_magicast@0.5.1/node_modules/nuxt-neon/dist/runtime/shared/utils/neonErrors';
```...

---

## Accepted Answer

**@cernymatej** [maintainer]:

It is indeed a bug. I'm not sure if something changed recently or if it's just your configuration, but the compiled output of a file like this:
```ts
export const FOO = 'foo'
export const BAR = 'bar'
```

looks like this:
```ts
export const FOO='foo',BAR='bar'
```

which unimport didn't handle properly.

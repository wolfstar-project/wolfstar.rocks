---
number: 34400
title: Creating type definitions for Nitro virtual files
category: Questions
created: 2026-02-27
url: "https://github.com/nuxt/nuxt/discussions/34400"
upvotes: 1
comments: 1
answered: false
---

# Creating type definitions for Nitro virtual files

In a Nuxt module, I know we can add a virtual file using `addServerTemplate`. Is it possible to add a type definition for the virtual file using `addTypeTemplate`, and if so, how can this be done?

I've tried fiddling with filenames and using `declare module`, but neither seems to work, and the type definitions don't seem to get picked up/associated with the virtual file. I would really like to get this to work, because the virtual file being virtual causes both type and lint errors in my code that are annoying to deal with.

Thanks for the help.

---

## Top Comments

**@cernymatej** [maintainer]:

Hello there! It's a little tricky to figure out, we probably need better documentation for it.
Nitro virtual files are available without prefix (afaik Nuxt ones require `#build`). 

So let's say we create this virtual file:
```ts
// module.ts
addServerTemplate({
  filename: 'bar.mjs',
  getContents: () => `export const bar = 'bar'`,
})
```

To add a type declaration for it, we can create:
```ts
// augment-modules.d.ts
declare module 'bar.mjs' {
  export const bar: string
}
```

And then we need to add it to the appropriate typescript context:
```ts
// module.ts
nuxt.options.nitro.typescript ??= {}
nuxt.options.nitro.typescript.tsConfig ??= {}
nuxt.options.nitro.typescript.tsConfig.include ??= []
nuxt.options.nitro.typescript.tsConfig.include.push(resolve('./augment-modules.d.ts'))
```...
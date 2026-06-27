---
number: 34552
title: Nuxt layer alias resolving
category: Questions
created: 2026-03-13
url: "https://github.com/nuxt/nuxt/discussions/34552"
upvotes: 1
comments: 4
answered: false
---

# Nuxt layer alias resolving

Hi guys,

We build documentations for our clients with nuxt. Therefor I want to create a base layer to extend these docs from. Within this layer we try to fetch files from an src folder. The layer will be published as a private package.

**Folder structure**
```md
├── docs (nuxt app)
│   └── nuxt files
├── src
│   ├── sections
│   │   └── section.liquid
│   ├── config
│   │   └── settings_schema.json
```

To make the code a bit easier, I've created an alias in my layer.

```ts
import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  alias: { '@theme': fileURLToPath(new URL('../src', import.meta.url)) },
});
```

In my `app.vue` I'm trying to get the `@theme/config/settings_schema.json`, which looks for `src/config/settings_schema.json`. This i...

---

## Top Comments

**@cernymatej** [maintainer]:

@domaine-stijn-slats I can't reproduce this. Could you share a stackblitz minimal example?

**@domaine-stijn-slats**:

Didn't work. Probably because of runtime and build time.

If you don't mind, could you give a small example? I tried something like this.

```ts
alias: { '@theme': resolver.resolve('../') },
```

I know do it a bit differently as workaround.

**nuxt.config.ts**
```ts
  alias: { '@theme': '../src' },
  runtimeConfig: {
    // Resolved theme src dir (set in nitro:config so server can read liquid files)
    themeSrcDir: '',
  },
  hooks: {
    // Pass resolved theme path to Nitro so server API can read liquid files (nuxt is 2nd arg at runtime)
    'nitro:config'(nitroConfig: { runtimeConfig?: Record<string, string> }, ctx?: { nuxt?: { options?: { rootDir?: string } } }) {
      const rootDir = ctx?.nuxt?.options?.rootDir;
      if (rootDir) {
        (nitroConfig.runtimeConfig ??= {}).themeSrcDir = join(rootDir, '..', 'src');
      }
    },
  },
```...

**@konstantin-karlovich-unbiased-co-uk**:

@domaine-stijn-slats Have you tried it?
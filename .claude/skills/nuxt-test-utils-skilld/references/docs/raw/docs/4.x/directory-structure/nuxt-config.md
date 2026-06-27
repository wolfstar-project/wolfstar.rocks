# nuxt.config.ts

> Nuxt can be easily configured with a single nuxt.config file.

The `nuxt.config` file extension can either be `.js`, `.ts` or `.mjs`.

```ts [nuxt.config.ts]twoslash
export default defineNuxtConfig({
  // My Nuxt config
})
```

<tip>

`defineNuxtConfig` helper is globally available without import.

</tip>

You can explicitly import `defineNuxtConfig` from `nuxt/config` if you prefer:

```ts [nuxt.config.ts]twoslash
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // My Nuxt config
})
```

<read-more to="/docs/4.x/api/configuration/nuxt-config">

Discover all the available options in the **Nuxt configuration** documentation.

</read-more>

To ensure your configuration is up to date, Nuxt will make a full restart when detecting changes in the main configuration file, the [`.env`](/docs/4.x/directory-structure/env), [`.nuxtignore`](/docs/4.x/directory-structure/nuxtignore) and [`.nuxtrc`](/docs/4.x/directory-structure/nuxtrc) dotfiles.

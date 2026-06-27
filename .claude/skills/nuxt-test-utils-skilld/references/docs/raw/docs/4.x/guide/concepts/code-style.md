# Code Style

> Nuxt supports ESLint out of the box

## ESLint

The recommended approach for Nuxt is to enable ESLint support using the `@nuxt/eslint` module, that will setup project-aware ESLint configuration for you.

<callout icon="i-lucide-lightbulb">

The module is designed for the new ESLint flat config format which is the default format since ESLint v9. If you are using the legacy `.eslintrc` config, you will need to configure manually with `@nuxt/eslint-config`. We highly recommend you to migrate over the flat config to be future-proof.

</callout>

## Quick Setup

```bash
npx nuxt module add eslint
```

Start your Nuxt app, a `eslint.config.mjs` file will be generated under your project root. You can customize it as needed.

You can learn more about the module and customizations in Nuxt ESLint's documentation.

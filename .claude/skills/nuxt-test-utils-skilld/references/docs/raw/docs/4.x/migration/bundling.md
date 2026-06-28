# Build Tooling

> Learn how to migrate from Nuxt 2 to Nuxt 3 build tooling.

We use the following build tools by default:

- Vite or webpack
- Rollup
- PostCSS
- esbuild

For this reason, most of your previous `build` configuration in `nuxt.config` will now be ignored, including any custom babel configuration.

If you need to configure any of Nuxt's build tools, you can do so in your `nuxt.config`, using the new top-level `vite`, `webpack` and `postcss` keys.

In addition, Nuxt ships with TypeScript support.

<read-more to="/docs/4.x/guide/concepts/typescript">



</read-more>

## Steps

1. Remove `@nuxt/typescript-build` and `@nuxt/typescript-runtime` from your dependencies and modules.
2. Remove any unused babel dependencies from your project.
3. Remove any explicit core-js dependencies.
4. Migrate `require` to `import`.

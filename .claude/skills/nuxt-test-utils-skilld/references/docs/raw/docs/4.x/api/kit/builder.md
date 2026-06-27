# Builder

> Nuxt Kit provides a set of utilities to help you work with the builder. These functions allow you to extend the Vite and webpack configurations.

Nuxt have builders based on Vite and webpack. You can extend the config passed to each one using `extendViteConfig` and `extendWebpackConfig` functions. You can also add additional plugins via `addVitePlugin`, `addWebpackPlugin` and `addBuildPlugin`.

## `extendViteConfig`

Extends the Vite configuration. Callback function can be called multiple times, when applying to both client and server builds.

<warning>

This hook is now deprecated, and we recommend using a Vite plugin instead with a `config` hook, or — for environment-specific configuration — the `applyToEnvironment` hook.

</warning>

### Usage

```tstwoslash
import { defineNuxtModule, extendViteConfig } from '@nuxt/kit'

export default defineNuxtModule({
  setup () {
    extendViteConfig((config) => {
      config.optimizeDeps ||= {}
      config.optimizeDeps.include ||= []
      config.optimizeDeps.include.push('cross-fetch')
    })
  },
})
```

For environment-specific configuration in Nuxt 5+, use `addVitePlugin()` instead:

```tstwoslash
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup () {
    // For global configuration (affects all environments)
    addVitePlugin(() => ({
      name: 'my-global-plugin',
      config (config) {
        // This runs before environment setup
        config.optimizeDeps ||= {}
        config.optimizeDeps.include ||= []
        config.optimizeDeps.include.push('cross-fetch')
      },
    }))

    // For environment-specific configuration
    addVitePlugin(() => ({
      name: 'my-client-plugin',
      applyToEnvironment (environment) {
        return environment.name === 'client'
      },
      configEnvironment (name, config) {
        // This only affects the client environment
        config.optimizeDeps ||= {}
        config.optimizeDeps.include ||= []
        config.optimizeDeps.include.push('client-only-package')
      },
    }))
  },
})
```

<warning>

**Important:** The `config` hook runs before `applyToEnvironment` and modifies the global configuration. Use `configEnvironment` for environment-specific configuration changes.

</warning>

### Type

```tstwoslash
// @errors: 2391
import type { UserConfig as ViteConfig } from 'vite'
import type { ExtendViteConfigOptions } from '@nuxt/kit'
// ---cut---
function extendViteConfig (callback: ((config: ViteConfig) => void), options?: ExtendViteConfigOptions): void
```

<read-more icon="i-simple-icons-vite" target="_blank" to="https://vite.dev/config/">

Check out the Vite website for more information about its configuration.

</read-more>

### Parameters

**callback**: A callback function that will be called with the Vite configuration object.

**options**: Options to pass to the callback function. This object can have the following properties:

<table>
<thead>
  <tr>
    <th>
      Property
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Required
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        dev
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in development mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        build
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in production mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        server
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the server bundle. <strong>
        Deprecated in Nuxt 5+.
      </strong>
      
       Use <code>
        addVitePlugin()
      </code>
      
       with <code>
        applyToEnvironment()
      </code>
      
       instead.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        client
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the client bundle. <strong>
        Deprecated in Nuxt 5+.
      </strong>
      
       Use <code>
        addVitePlugin()
      </code>
      
       with <code>
        applyToEnvironment()
      </code>
      
       instead.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        prepend
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be prepended to the array with <code>
        unshift()
      </code>
      
       instead of <code>
        push()
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

## `extendWebpackConfig`

Extends the webpack configuration. Callback function can be called multiple times, when applying to both client and server builds.

### Usage

```tstwoslash
import { defineNuxtModule, extendWebpackConfig } from '@nuxt/kit'

export default defineNuxtModule({
  setup () {
    extendWebpackConfig((config) => {
      config.module!.rules!.push({
        test: /\.txt$/,
        use: 'raw-loader',
      })
    })
  },
})
```

### Type

```tstwoslash
// @errors: 2391
import type { Configuration as WebpackConfig } from 'webpack'
import type { ExtendWebpackConfigOptions } from '@nuxt/kit'
// ---cut---
function extendWebpackConfig (callback: ((config: WebpackConfig) => void), options?: ExtendWebpackConfigOptions): void
```

<read-more icon="i-simple-icons-webpack" target="_blank" to="https://webpack.js.org/configuration/">

Check out webpack website for more information about its configuration.

</read-more>

### Parameters

**callback**: A callback function that will be called with the webpack configuration object.

**options**: Options to pass to the callback function. This object can have the following properties:

<table>
<thead>
  <tr>
    <th>
      Property
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Required
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        dev
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in development mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        build
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in production mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        server
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the server bundle.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        client
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the client bundle.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        prepend
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be prepended to the array with <code>
        unshift()
      </code>
      
       instead of <code>
        push()
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

## `addVitePlugin`

Append Vite plugin to the config.

<warning>

In Nuxt 5+, plugins registered with `server: false` or `client: false` options will not have their `config` or `configResolved` hooks called. Instead, use the `applyToEnvironment()` method instead for environment-specific plugins.

</warning>

### Usage

```tstwoslash
// @errors: 2307
// ---cut---
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { svg4VuePlugin } from 'vite-plugin-svg4vue'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-svg-icons',
    configKey: 'nuxtSvgIcons',
  },
  defaults: {
    svg4vue: {
      assetsDirName: 'assets/icons',
    },
  },
  setup (options) {
    addVitePlugin(svg4VuePlugin(options.svg4vue))

    // or, to add a vite plugin to only one environment
    addVitePlugin(() => ({
      name: 'my-client-plugin',
      applyToEnvironment (environment) {
        return environment.name === 'client'
      },
      // ... rest of your client-only plugin
    }))
  },
})
```

### Type

```tstwoslash
// @errors: 2391
import type { Plugin as VitePlugin } from 'vite'
import type { ExtendViteConfigOptions } from '@nuxt/kit'
// ---cut---
function addVitePlugin (pluginOrGetter: VitePlugin | VitePlugin[] | (() => VitePlugin | VitePlugin[]), options?: ExtendViteConfigOptions): void
```

<tip>

See Vite website for more information about Vite plugins. You can also use this repository to find a plugin that suits your needs.

</tip>

### Parameters

**pluginOrGetter**: A Vite plugin instance or an array of Vite plugin instances. If a function is provided, it must return a Vite plugin instance or an array of Vite plugin instances. The function can also be async or return a Promise, which is useful for lazy-loading plugins:

```tstwoslash
// @errors: 2307
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup () {
    // Lazy load the plugin - only imported when the build actually runs
    addVitePlugin(() => import('my-vite-plugin').then(r => r.default()))
  },
})
```

**options**: Options to pass to the callback function. This object can have the following properties:

<table>
<thead>
  <tr>
    <th>
      Property
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Required
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        dev
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in development mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        build
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in production mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        server
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the server bundle. <strong>
        Deprecated in Nuxt 5+.
      </strong>
      
       Use <code>
        applyToEnvironment()
      </code>
      
       instead.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        client
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the client bundle. <strong>
        Deprecated in Nuxt 5+.
      </strong>
      
       Use <code>
        applyToEnvironment()
      </code>
      
       instead.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        prepend
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be prepended to the array with <code>
        unshift()
      </code>
      
       instead of <code>
        push()
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

## `addWebpackPlugin`

Append webpack plugin to the config.

### Usage

```ts
import EslintWebpackPlugin from 'eslint-webpack-plugin'
import { addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-eslint',
    configKey: 'eslint',
  },
  defaults: nuxt => ({
    include: [`${nuxt.options.srcDir}/**/*.{js,jsx,ts,tsx,vue}`],
    lintOnStart: true,
  }),
  setup (options, nuxt) {
    const webpackOptions = {
      ...options,
      context: nuxt.options.srcDir,
      files: options.include,
      lintDirtyModulesOnly: !options.lintOnStart,
    }
    addWebpackPlugin(new EslintWebpackPlugin(webpackOptions), { server: false })
  },
})
```

### Type

```tstwoslash
// @errors: 2391
import type { WebpackPluginInstance } from 'webpack'
import type { ExtendWebpackConfigOptions } from '@nuxt/kit'
// ---cut---
function addWebpackPlugin (pluginOrGetter: WebpackPluginInstance | WebpackPluginInstance[] | (() => WebpackPluginInstance | WebpackPluginInstance[]), options?: ExtendWebpackConfigOptions): void
```

<tip>

See webpack website for more information about webpack plugins. You can also use this collection to find a plugin that suits your needs.

</tip>

### Parameters

**pluginOrGetter**: A webpack plugin instance or an array of webpack plugin instances. If a function is provided, it must return a webpack plugin instance or an array of webpack plugin instances. The function can also be async or return a Promise, enabling lazy-loading of plugins.

**options**: Options to pass to the callback function. This object can have the following properties:

<table>
<thead>
  <tr>
    <th>
      Property
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Required
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        dev
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in development mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        build
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in production mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        server
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the server bundle.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        client
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the client bundle.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        prepend
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be prepended to the array with <code>
        unshift()
      </code>
      
       instead of <code>
        push()
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

## `addBuildPlugin`

Builder-agnostic version of `addVitePlugin` and `addWebpackPlugin`. It will add the plugin to both Vite and webpack configurations if they are present.

### Type

```tstwoslash
// @errors: 2391
import type { ExtendConfigOptions } from '@nuxt/kit'
import type { Plugin as VitePlugin } from 'vite'
import type { WebpackPluginInstance } from 'webpack'
import type { RspackPluginInstance } from '@rspack/core'

interface AddBuildPluginFactory {
  vite?: () => VitePlugin | VitePlugin[]
  webpack?: () => WebpackPluginInstance | WebpackPluginInstance[]
  rspack?: () => RspackPluginInstance | RspackPluginInstance[]
}
// ---cut---
function addBuildPlugin (pluginFactory: AddBuildPluginFactory, options?: ExtendConfigOptions): void
```

### Parameters

**pluginFactory**: A factory function that returns an object with `vite` and/or `webpack` properties. These properties must be functions that return a Vite plugin instance or an array of Vite plugin instances and/or a webpack plugin instance or an array of webpack plugin instances.

**options**: Options to pass to the callback function. This object can have the following properties:

<table>
<thead>
  <tr>
    <th>
      Property
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Required
    </th>
    
    <th>
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        dev
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in development mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        build
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building in production mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        server
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the server bundle.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        client
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be called when building the client bundle.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        prepend
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , the callback function will be prepended to the array with <code>
        unshift()
      </code>
      
       instead of <code>
        push()
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>



---

- Source

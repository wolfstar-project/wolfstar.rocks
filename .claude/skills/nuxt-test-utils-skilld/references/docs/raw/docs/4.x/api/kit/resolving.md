# Resolving

> Nuxt Kit provides a set of utilities to help you resolve paths. These functions allow you to resolve paths relative to the current module, with unknown name or extension.

Sometimes you need to resolve a path relative to the current module without knowing the name or extension. For example, you may want to add a plugin that is located in the same directory as the module. To handle these cases, Nuxt provides a set of utilities to resolve paths. `resolvePath` and `resolveAlias` are used to resolve paths relative to the current module. `findPath` is used to find the first existing file in a given set of paths. `createResolver` is used to create a resolver relative to the base path.

## `resolvePath`

Resolves the full path to a file or directory, respecting Nuxt alias and extensions options. If a path could not be resolved, a normalized input path will be returned.

### Usage

```ts
import { defineNuxtModule, resolvePath } from '@nuxt/kit'

export default defineNuxtModule({
  async setup () {
    const entrypoint = await resolvePath('@unhead/vue')
    console.log(`Unhead entrypoint is ${entrypoint}`)
  },
})
```

### Type

```ts
function resolvePath (path: string, options?: ResolvePathOptions): Promise<string>
```

### Parameters

**path**: A path to resolve.

**options**: Options to pass to the resolver. This object can have the following properties:

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
        cwd
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      Base for resolving paths from. Default is Nuxt rootDir.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        alias
      </code>
    </td>
    
    <td>
      <code className="language-ts shiki shiki-themes material-theme-lighter material-theme-lighter material-theme-palenight" language="ts" style="">
        <span class="sZSNi">
          Record
        </span>
        
        <span class="sDfIl">
          <
        </span>
        
        <span class="sZSNi">
          string
        </span>
        
        <span class="sDfIl">
          ,
        </span>
        
        <span class="sZSNi">
          string
        </span>
        
        <span class="sDfIl">
          >
        </span>
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      An object of aliases. Default is Nuxt configured aliases.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        extensions
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      The file extensions to try. Default is Nuxt configured extensions.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        virtual
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
      Whether to resolve files that exist in the Nuxt VFS (for example, as a Nuxt template).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fallbackToOriginal
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
      Whether to fallback to the original path if the resolved path does not exist instead of returning the normalized input path.
    </td>
  </tr>
</tbody>
</table>

### Examples

```ts
import { defineNuxtModule, resolvePath } from '@nuxt/kit'
import { join } from 'pathe'

const headlessComponents: ComponentGroup[] = [
  {
    relativePath: 'combobox/combobox.js',
    chunkName: 'headlessui/combobox',
    exports: [
      'Combobox',
      'ComboboxLabel',
      'ComboboxButton',
      'ComboboxInput',
      'ComboboxOptions',
      'ComboboxOption',
    ],
  },
]

export default defineNuxtModule({
  meta: {
    name: 'nuxt-headlessui',
    configKey: 'headlessui',
  },
  defaults: {
    prefix: 'Headless',
  },
  async setup (options) {
    const entrypoint = await resolvePath('@headlessui/vue')
    const root = join(entrypoint, '../components')

    for (const group of headlessComponents) {
      for (const e of group.exports) {
        addComponent(
          {
            name: e,
            export: e,
            filePath: join(root, group.relativePath),
            chunkName: group.chunkName,
            mode: 'all',
          },
        )
      }
    }
  },
})
```

## `resolveAlias`

Resolves path aliases respecting Nuxt alias options.

### Type

```ts
function resolveAlias (path: string, alias?: Record<string, string>): string
```

### Parameters

**path**: A path to resolve.

**alias**: An object of aliases. If not provided, it will be read from `nuxt.options.alias`.

## `findPath`

Try to resolve first existing file in a given set of paths.

### Usage

```ts
import { defineNuxtModule, findPath } from '@nuxt/kit'
import { join } from 'pathe'

export default defineNuxtModule({
  async setup (_, nuxt) {
    // Resolve main (app.vue)
    const mainComponent = await findPath([
      join(nuxt.options.srcDir, 'App'),
      join(nuxt.options.srcDir, 'app'),
    ])
  },
})
```

### Type

```ts
function findPath (paths: string | string[], options?: ResolvePathOptions, pathType: 'file' | 'dir'): Promise<string | null>
```

### Parameters

**paths**: A path or an array of paths to resolve.

**options**: Options to pass to the resolver. This object can have the following properties:

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
        cwd
      </code>
    </td>
    
    <td>
      <code>
        string
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      Base for resolving paths from. Default is Nuxt rootDir.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        alias
      </code>
    </td>
    
    <td>
      <code className="language-ts shiki shiki-themes material-theme-lighter material-theme-lighter material-theme-palenight" language="ts" style="">
        <span class="sZSNi">
          Record
        </span>
        
        <span class="sDfIl">
          <
        </span>
        
        <span class="sZSNi">
          string
        </span>
        
        <span class="sDfIl">
          ,
        </span>
        
        <span class="sZSNi">
          string
        </span>
        
        <span class="sDfIl">
          >
        </span>
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      An object of aliases. Default is Nuxt configured aliases.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        extensions
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      <code>
        false
      </code>
    </td>
    
    <td>
      The file extensions to try. Default is Nuxt configured extensions.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        virtual
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
      Whether to resolve files that exist in the Nuxt VFS (for example, as a Nuxt template).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fallbackToOriginal
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
      Whether to fallback to the original path if the resolved path does not exist instead of returning the normalized input path.
    </td>
  </tr>
</tbody>
</table>

## `createResolver`

Creates resolver relative to base path.

<tip icon="i-lucide-video" target="_blank" to="https://vueschool.io/lessons/resolving-paths-and-injecting-assets-to-the-app?friend=nuxt">

Watch Vue School video about createResolver.

</tip>

### Usage

```ts
import { createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (_, nuxt) {
    const { resolve, resolvePath } = createResolver(import.meta.url)
  },
})
```

### Type

```ts
function createResolver (basePath: string | URL): Resolver
```

### Parameters

**basePath**: A base path to resolve from. It can be a string or a URL.

### Return Value

The `createResolver` function returns an object with the following properties:

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
      Description
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        resolve
      </code>
    </td>
    
    <td>
      <code className="language-ts shiki shiki-themes material-theme-lighter material-theme-lighter material-theme-palenight" language="ts" style="">
        <span class="sDfIl">
          (
        </span>
        
        <span class="s1nJG">
          path
        </span>
        
        <span class="sDfIl">
          :
        </span>
        
        <span class="s52Pk">
          string
        </span>
        
        <span class="sDfIl">
          )
        </span>
        
        <span class="smZ93">
          =>
        </span>
        
        <span class="sZSNi">
          string
        </span>
      </code>
    </td>
    
    <td>
      A function that resolves a path relative to the base path.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        resolvePath
      </code>
    </td>
    
    <td>
      <code className="language-ts shiki shiki-themes material-theme-lighter material-theme-lighter material-theme-palenight" language="ts" style="">
        <span class="sDfIl">
          (
        </span>
        
        <span class="s1nJG">
          path
        </span>
        
        <span class="sDfIl">
          :
        </span>
        
        <span class="s52Pk">
          string
        </span>
        
        <span class="sDfIl">
          ,
        </span>
        
        <span class="s1nJG">
          options
        </span>
        
        <span class="sDfIl">
          ?:
        </span>
        
        <span class="s52Pk">
          ResolvePathOptions
        </span>
        
        <span class="sDfIl">
          )
        </span>
        
        <span class="smZ93">
          =>
        </span>
        
        <span class="s52Pk">
          Promise
        </span>
        
        <span class="sDfIl">
          <
        </span>
        
        <span class="sZSNi">
          string
        </span>
        
        <span class="sDfIl">
          >
        </span>
      </code>
    </td>
    
    <td>
      A function that resolves a path relative to the base path and respects Nuxt alias and extensions options.
    </td>
  </tr>
</tbody>
</table>

### Examples

```ts
import { createResolver, defineNuxtModule, isNuxt2 } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.hook('modules:done', () => {
      if (isNuxt2()) {
        addPlugin(resolver.resolve('./runtime/plugin.vue2'))
      } else {
        addPlugin(resolver.resolve('./runtime/plugin.vue3'))
      }
    })
  },
})
```



---

- Source

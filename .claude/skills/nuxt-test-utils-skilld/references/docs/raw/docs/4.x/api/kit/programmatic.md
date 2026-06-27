# Programmatic Usage

> Nuxt Kit provides a set of utilities to help you work with Nuxt programmatically. These functions allow you to load Nuxt, build Nuxt, and load Nuxt configuration.

Programmatic usage can be helpful when you want to use Nuxt programmatically, for example, when building a CLI tool or test utils.

## `loadNuxt`

Load Nuxt programmatically. It will load the Nuxt configuration, instantiate and return the promise with Nuxt instance.

### Type

```ts
function loadNuxt (loadOptions?: LoadNuxtOptions): Promise<Nuxt>
```

### Parameters

**loadOptions**: Loading conditions for Nuxt. `loadNuxt` uses `c12` under the hood, so it accepts the same options as `c12.loadConfig` with some additional options:

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
      
      , Nuxt will be loaded in development mode.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        ready
      </code>
    </td>
    
    <td>
      <code>
        boolean
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      If set to <code>
        true
      </code>
      
      , Nuxt will be ready to use after the <code>
        loadNuxt
      </code>
      
       call. If set to <code>
        false
      </code>
      
      , you will need to call <code>
        nuxt.ready()
      </code>
      
       to make sure Nuxt is ready to use.
    </td>
  </tr>
</tbody>
</table>

## `buildNuxt`

Build Nuxt programmatically. It will invoke the builder (currently @nuxt/vite-builder or @nuxt/webpack-builder) to bundle the application.

### Type

```ts
function buildNuxt (nuxt: Nuxt): Promise<any>
```

### Parameters

**nuxt**: Nuxt instance to build. It can be retrieved from the context via `useNuxt()` call.

## `loadNuxtConfig`

Load Nuxt configuration. It will return the promise with the configuration object.

### Type

```ts
function loadNuxtConfig (options: LoadNuxtConfigOptions): Promise<NuxtOptions>
```

### Parameters

**options**: Options to pass in `c12` `loadConfig` call.

## `writeTypes`

Generates `tsconfig.json` and writes it to the project buildDir.

### Type

```ts
function writeTypes (nuxt?: Nuxt): void
```

### Parameters

**nuxt**: Nuxt instance to build. It can be retrieved from the context via `useNuxt()` call.



---

- Source

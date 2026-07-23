# useFetch

> Fetch data from an API endpoint with an SSR-friendly composable.

This composable provides a convenient wrapper around [`useAsyncData`](/docs/4.x/api/composables/use-async-data) and [`$fetch`](/docs/4.x/api/utils/dollarfetch).
It automatically generates a key based on URL and fetch options, provides type hints for request url based on server routes, and infers API response type.

<note>

`useFetch` is a composable meant to be called directly in a setup function, plugin, or route middleware. It returns reactive composables and handles adding responses to the Nuxt payload so they can be passed from server to client without re-fetching the data on client side when the page hydrates.

</note>

## Usage

```vue [app/pages/modules.vue]
<script setup lang="ts">
const { data, status, error, refresh, clear } = await useFetch('/api/modules', {
  pick: ['title'],
})
</script>
```

<tip to="/docs/4.x/guide/recipes/custom-usefetch#custom-usefetch-with-createusefetch">

Need a custom `useFetch` with pre-defined defaults (like `baseURL` or auth headers)? Use `createUseFetch` to create a fully typed custom composable.

</tip>

<note>

`data`, `status`, and `error` are Vue refs, and they should be accessed with `.value` when used within the `<script setup>`, while `refresh`/`execute` and `clear` are plain functions.

</note>

Using the `query` option, you can add search parameters to your query. This option is extended from unjs/ofetch and is using unjs/ufo to create the URL. Objects are automatically stringified.

```ts
const param1 = ref('value1')
const { data, status, error, refresh } = await useFetch('/api/modules', {
  query: { param1, param2: 'value2' },
})
```

The above example results in `https://api.nuxt.com/modules?param1=value1&param2=value2`.

You can also use interceptors:

```ts
const { data, status, error, refresh, clear } = await useFetch('/api/auth/login', {
  onRequest ({ request, options }) {
    // Set the request headers
    // note that this relies on ofetch >= 1.4.0 - you may need to refresh your lockfile
    options.headers.set('Authorization', '...')
  },
  onRequestError ({ request, options, error }) {
    // Handle the request errors
  },
  onResponse ({ request, response, options }) {
    // Process the response data
    localStorage.setItem('token', response._data.token)
  },
  onResponseError ({ request, response, options }) {
    // Handle the response errors
  },
})
```

### Reactive Keys and Shared State

You can use a computed ref or a plain ref as the URL, allowing for dynamic data fetching that automatically updates when the URL changes:

```vue [app/pages/[id].vue]
<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id)

// When the route changes and id updates, the data will be automatically refetched
const { data: post } = await useFetch(() => `/api/posts/${id.value}`)
</script>
```

When using `useFetch` with the same URL and options in multiple components, they will share the same `data`, `error` and `status` refs. This ensures consistency across components.

<tip>

Keyed state created using `useFetch` can be retrieved across your Nuxt application using [`useNuxtData`](/docs/4.x/api/composables/use-nuxt-data).

</tip>

<warning>

`useFetch` is a reserved function name transformed by the compiler, so you should not name your own function `useFetch`. To create a custom variant with pre-defined options, use [`createUseFetch`](/docs/4.x/guide/recipes/custom-usefetch#custom-usefetch-with-createusefetch) instead.

</warning>

<warning>

If you encounter the `data` variable destructured from a `useFetch` returns a string and not a JSON parsed object then make sure your component doesn't include an import statement like `import { useFetch } from '@vueuse/core`.

</warning>

<video-accordion title="Watch the video from Alexander Lichter to avoid using useFetch the wrong way" video-id="njsGVmcWviY">



</video-accordion>

<read-more to="/docs/4.x/getting-started/data-fetching">



</read-more>

### Reactive Fetch Options

Fetch options can be provided as reactive, supporting `computed`, `ref` and computed getters. When a reactive fetch option is updated it will trigger a refetch using the updated resolved reactive value.

```ts
const searchQuery = ref('initial')
const { data } = await useFetch('/api/search', {
  query: { q: searchQuery },
})
// triggers a refetch: /api/search?q=new%20search
searchQuery.value = 'new search'
```

If needed, you can opt out of this behavior using `watch: false`:

```ts
const searchQuery = ref('initial')
const { data } = await useFetch('/api/search', {
  query: { q: searchQuery },
  watch: false,
})
// does not trigger a refetch
searchQuery.value = 'new search'
```

## Type

```ts [Signature]
export function useFetch<DataT, ErrorT> (
  url: string | Request | Ref<string | Request> | (() => string | Request),
  options?: UseFetchOptions<DataT>,
): Promise<AsyncData<DataT, ErrorT>>

type UseFetchOptions<DataT> = {
  key?: MaybeRefOrGetter<string>
  method?: MaybeRefOrGetter<string>
  query?: MaybeRefOrGetter<SearchParams>
  params?: MaybeRefOrGetter<SearchParams>
  body?: MaybeRefOrGetter<RequestInit['body'] | Record<string, any>>
  headers?: MaybeRefOrGetter<Record<string, string> | [key: string, value: string][] | Headers>
  baseURL?: MaybeRefOrGetter<string>
  cache?: false | 'default' | 'force-cache' | 'no-cache' | 'no-store' | 'only-if-cached' | 'reload'
  server?: boolean
  lazy?: boolean
  immediate?: boolean
  getCachedData?: (key: string, nuxtApp: NuxtApp, ctx: AsyncDataRequestContext) => DataT | undefined
  deep?: boolean
  dedupe?: 'cancel' | 'defer'
  timeout?: number
  default?: () => DataT
  transform?: (input: DataT) => DataT | Promise<DataT>
  pick?: string[]
  $fetch?: typeof globalThis.$fetch
  watch?: MultiWatchSources | false
}

type AsyncDataRequestContext = {
  /** The reason for this data request */
  cause: 'initial' | 'refresh:manual' | 'refresh:hook' | 'watch'
}

type AsyncData<DataT, ErrorT> = {
  data: Ref<DataT | undefined>
  pending: Ref<boolean>
  refresh: (opts?: AsyncDataExecuteOptions) => Promise<void>
  execute: (opts?: AsyncDataExecuteOptions) => Promise<void>
  clear: () => void
  error: Ref<ErrorT | undefined>
  status: Ref<AsyncDataRequestStatus>
}

interface AsyncDataExecuteOptions {
  dedupe?: 'cancel' | 'defer'
  timeout?: number
  signal?: AbortSignal
}

type AsyncDataRequestStatus = 'idle' | 'pending' | 'success' | 'error'
```

## Parameters

- `URL` (`string | Request | Ref<string | Request> | () => string | Request`): The URL or request to fetch. Can be a string, a Request object, a Vue ref, or a function returning a string/Request. Supports reactivity for dynamic endpoints.
- `options` (object): Configuration for the fetch request. Extends unjs/ofetch options and [`AsyncDataOptions`](/docs/4.x/api/composables/use-async-data#params). All options can be a static value, a `ref`, or a computed value.

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Type
    </th>
    
    <th>
      Default
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
        key
      </code>
    </td>
    
    <td>
      <code>
        MaybeRefOrGetter<string>
      </code>
    </td>
    
    <td>
      auto-gen
    </td>
    
    <td>
      Unique key for de-duplication. If not provided, generated from URL and options.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        method
      </code>
    </td>
    
    <td>
      <code>
        MaybeRefOrGetter<string>
      </code>
    </td>
    
    <td>
      <code>
        'GET'
      </code>
    </td>
    
    <td>
      HTTP request method.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        query
      </code>
    </td>
    
    <td>
      <code>
        MaybeRefOrGetter<SearchParams>
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Query/search params to append to the URL. Alias: <code>
        params
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        params
      </code>
    </td>
    
    <td>
      <code>
        MaybeRefOrGetter<SearchParams>
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Alias for <code>
        query
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        body
      </code>
    </td>
    
    <td>
      <code>
        MaybeRefOrGetter<RequestInit['body'] | Record<string, any>>
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Request body. Objects are automatically stringified.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        headers
      </code>
    </td>
    
    <td>
      <code>
        MaybeRefOrGetter<Record<string, string> | [key, value][] | Headers>
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Request headers.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        baseURL
      </code>
    </td>
    
    <td>
      <code>
        MaybeRefOrGetter<string>
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Base URL for the request.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        cache
      </code>
    </td>
    
    <td>
      <code>
        false | string
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Cache control. Boolean disables cache, or use Fetch API values: <code>
        default
      </code>
      
      , <code>
        no-store
      </code>
      
      , etc.
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
        true
      </code>
    </td>
    
    <td>
      Whether to fetch on the server.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        lazy
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
      If true, resolves after route loads (does not block navigation).
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        immediate
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
      If false, prevents request from firing immediately.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        default
      </code>
    </td>
    
    <td>
      <code>
        () => DataT
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Factory for default value of <code>
        data
      </code>
      
       before async resolves.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        timeout
      </code>
    </td>
    
    <td>
      <code>
        number
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      A number in milliseconds to wait before timing out the request (defaults to <code>
        undefined
      </code>
      
      , which means no timeout)
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        transform
      </code>
    </td>
    
    <td>
      <code>
        (input: DataT) => DataT | Promise<DataT>
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Function to transform the result after resolving.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getCachedData
      </code>
    </td>
    
    <td>
      <code>
        (key, nuxtApp, ctx) => DataT | undefined
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Function to return cached data. See below for default.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pick
      </code>
    </td>
    
    <td>
      <code>
        string[]
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Only pick specified keys from the result.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        watch
      </code>
    </td>
    
    <td>
      <code>
        MultiWatchSources | false
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Array of reactive sources to watch and auto-refresh. <code>
        false
      </code>
      
       disables watching.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        deep
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
      Return data in a deep ref object.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        dedupe
      </code>
    </td>
    
    <td>
      <code>
        'cancel' | 'defer'
      </code>
    </td>
    
    <td>
      <code>
        'cancel'
      </code>
    </td>
    
    <td>
      Avoid fetching same key more than once at a time.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        $fetch
      </code>
    </td>
    
    <td>
      <code>
        typeof globalThis.$fetch
      </code>
    </td>
    
    <td>
      -
    </td>
    
    <td>
      Custom $fetch implementation. See <a href="/docs/4.x/guide/recipes/custom-usefetch">
        Custom useFetch in Nuxt
      </a>
    </td>
  </tr>
</tbody>
</table>

<note>

All fetch options can be given a `computed` or `ref` value. These will be watched and new requests made automatically with any new values if they are updated.

</note>

**getCachedData default:**

```ts
const getDefaultCachedData = (key, nuxtApp, ctx) => nuxtApp.isHydrating
  ? nuxtApp.payload.data[key]
  : nuxtApp.static.data[key]
```

This only caches data when `experimental.payloadExtraction` in `nuxt.config` is enabled.

## Return Values

<table>
<thead>
  <tr>
    <th>
      Name
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
        data
      </code>
    </td>
    
    <td>
      <code>
        Ref<DataT | undefined>
      </code>
    </td>
    
    <td>
      The result of the asynchronous fetch.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        refresh
      </code>
    </td>
    
    <td>
      <code>
        (opts?: AsyncDataExecuteOptions) => Promise<void>
      </code>
    </td>
    
    <td>
      Function to manually refresh the data. By default, Nuxt waits until a <code>
        refresh
      </code>
      
       is finished before it can be executed again.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        execute
      </code>
    </td>
    
    <td>
      <code>
        (opts?: AsyncDataExecuteOptions) => Promise<void>
      </code>
    </td>
    
    <td>
      Alias for <code>
        refresh
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        error
      </code>
    </td>
    
    <td>
      <code>
        Ref<ErrorT | undefined>
      </code>
    </td>
    
    <td>
      Error object if the data fetching failed.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        status
      </code>
    </td>
    
    <td>
      <code>
        Ref<'idle' | 'pending' | 'success' | 'error'>
      </code>
    </td>
    
    <td>
      Status of the data request. See below for possible values.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        pending
      </code>
    </td>
    
    <td>
      <code>
        Ref<boolean>
      </code>
    </td>
    
    <td>
      Boolean flag indicating whether the current request is in progress.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        clear
      </code>
    </td>
    
    <td>
      <code>
        () => void
      </code>
    </td>
    
    <td>
      Resets <code>
        data
      </code>
      
       to <code>
        undefined
      </code>
      
       (or the value of <code>
        options.default()
      </code>
      
       if provided), <code>
        error
      </code>
      
       to <code>
        undefined
      </code>
      
      , set <code>
        status
      </code>
      
       to <code>
        idle
      </code>
      
      , and cancels any pending requests.
    </td>
  </tr>
</tbody>
</table>

### Status values

- `idle`: Request has not started (e.g. `{ immediate: false }` or `{ server: false }` on server render)
- `pending`: Request is in progress
- `success`: Request completed successfully
- `error`: Request failed

<note>

If you have not fetched data on the server (for example, with `server: false`), then the data *will not* be fetched until hydration completes. This means even if you await `useFetch` on client-side, `data` will remain undefined within `<script setup>`.

</note>

### Examples

<link-example to="/docs/4.x/examples/advanced/use-custom-fetch-composable">



</link-example>

<link-example to="/docs/4.x/examples/features/data-fetching">



</link-example>



---

- Source

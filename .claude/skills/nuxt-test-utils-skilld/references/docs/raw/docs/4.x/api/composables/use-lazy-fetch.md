# useLazyFetch

> This wrapper around useFetch triggers navigation immediately.

`useLazyFetch` provides a wrapper around [`useFetch`](/docs/4.x/api/composables/use-fetch) that triggers navigation before the handler is resolved by setting the `lazy` option to `true`.

## Usage

By default, [`useFetch`](/docs/4.x/api/composables/use-fetch) blocks navigation until its async handler is resolved. `useLazyFetch` allows navigation to proceed immediately, with data being fetched in the background.

```vue [app/pages/index.vue]
<script setup lang="ts">
const { status, data: posts } = await useLazyFetch('/api/posts')
</script>

<template>
  <div v-if="status === 'pending'">
    Loading ...
  </div>
  <div v-else>
    <div v-for="post in posts">
      <!-- do something -->
    </div>
  </div>
</template>
```

<note>

`useLazyFetch` has the same signature as [`useFetch`](/docs/4.x/api/composables/use-fetch).

</note>

<warning>

Awaiting `useLazyFetch` only ensures the call is initialized. On client-side navigation, data may not be immediately available, and you must handle the `pending` state in your component's template.

</warning>

<warning>

`useLazyFetch` is a reserved function name transformed by the compiler, so you should not name your own function `useLazyFetch`.

</warning>

## Type

```ts [Signature]
export function useLazyFetch<DataT, ErrorT> (
  url: string | Request | Ref<string | Request> | (() => string | Request),
  options?: UseFetchOptions<DataT>,
): Promise<AsyncData<DataT, ErrorT>>
```

<note>

`useLazyFetch` is equivalent to `useFetch` with `lazy: true` option set. See [`useFetch`](/docs/4.x/api/composables/use-fetch) for full type definitions.

</note>

## Parameters

`useLazyFetch` accepts the same parameters as [`useFetch`](/docs/4.x/api/composables/use-fetch):

- `URL` (`string | Request | Ref<string | Request> | () => string | Request`): The URL or request to fetch.
- `options` (object): Same as [`useFetch` options](/docs/4.x/api/composables/use-fetch#parameters), with `lazy` automatically set to `true`.

<read-more to="/docs/4.x/api/composables/use-fetch#parameters">



</read-more>

## Return Values

Returns the same `AsyncData` object as [`useFetch`](/docs/4.x/api/composables/use-fetch):

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
      Function to manually refresh the data.
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
      Status of the data request.
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
      
      , <code>
        error
      </code>
      
       to <code>
        undefined
      </code>
      
      , sets <code>
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

<read-more to="/docs/4.x/api/composables/use-fetch#return-values">



</read-more>

## Examples

### Handling Pending State

```vue [app/pages/index.vue]
<script setup lang="ts">
/* Navigation will occur before fetching is complete.
 * Handle 'pending' and 'error' states directly within your component's template
 */
const { status, data: posts } = await useLazyFetch('/api/posts')
watch(posts, (newPosts) => {
  // Because posts might start out null, you won't have access
  // to its contents immediately, but you can watch it.
})
</script>

<template>
  <div v-if="status === 'pending'">
    Loading ...
  </div>
  <div v-else>
    <div v-for="post in posts">
      <!-- do something -->
    </div>
  </div>
</template>
```

<read-more to="/docs/4.x/getting-started/data-fetching">



</read-more>



---

- Source

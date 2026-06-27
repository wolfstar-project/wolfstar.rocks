# defineNuxtComponent

> defineNuxtComponent() is a helper function for defining type safe components with Options API.

<note>

`defineNuxtComponent()` is a helper function for defining type safe Vue components using options API similar to `defineComponent()`. `defineNuxtComponent()` wrapper also adds support for `asyncData` and `head` component options.

</note>

<note>

Using `<script setup lang="ts">` is the recommended way of declaring Vue components in Nuxt.

</note>

<read-more to="/docs/getting-started/data-fetching">



</read-more>

## `asyncData()`

If you choose not to use `setup()` in your app, you can use the `asyncData()` method within your component definition:

```vue [app/pages/index.vue]
<script lang="ts">
export default defineNuxtComponent({
  asyncData () {
    return {
      data: {
        greetings: 'hello world!',
      },
    }
  },
})
</script>
```

## `head()`

If you choose not to use `setup()` in your app, you can use the `head()` method within your component definition:

```vue [app/pages/index.vue]
<script lang="ts">
export default defineNuxtComponent({
  head (nuxtApp) {
    return {
      title: 'My site',
    }
  },
})
</script>
```



---

- Source

# useRequestEvent

> Access the incoming request event with the useRequestEvent composable.

Within the [Nuxt context](/docs/4.x/guide/going-further/nuxt-app#the-nuxt-context) you can use `useRequestEvent` to access the incoming request.

```ts
// Get underlying request event
const event = useRequestEvent()

// Get the URL
const url = event?.path
```

<tip>

In the browser, `useRequestEvent` will return `undefined`.

</tip>



---

- Source

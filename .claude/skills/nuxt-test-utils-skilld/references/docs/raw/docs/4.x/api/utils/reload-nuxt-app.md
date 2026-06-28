# reloadNuxtApp

> reloadNuxtApp will perform a hard reload of the page.

<note>

`reloadNuxtApp` will perform a hard reload of your app, re-requesting a page and its dependencies from the server.

</note>

By default, it will also save the current `state` of your app (that is, any state you could access with `useState`).

<read-more icon="i-lucide-star" to="/docs/4.x/guide/going-further/experimental-features#restorestate">

You can enable experimental restoration of this state by enabling the `experimental.restoreState` option in your `nuxt.config` file.

</read-more>

## Type

```ts [Signature]
export function reloadNuxtApp (options?: ReloadNuxtAppOptions)

interface ReloadNuxtAppOptions {
  ttl?: number
  force?: boolean
  path?: string
  persistState?: boolean
}
```

### `options` (optional)

**Type**: `ReloadNuxtAppOptions`

An object accepting the following properties:

- `path` (optional)<br />

**Type**: `string`<br />

**Default**: `window.location.pathname`<br />

The path to reload (defaulting to the current path). If this is different from the current window location it
will trigger a navigation and add an entry in the browser history.
- `ttl` (optional)<br />

**Type**: `number`<br />

**Default**: `10000`<br />

The number of milliseconds in which to ignore future reload requests. If called again within this time period,
`reloadNuxtApp` will not reload your app to avoid reload loops.
- `force` (optional)<br />

**Type**: `boolean`<br />

**Default**: `false`<br />

This option allows bypassing reload loop protection entirely, forcing a reload even if one has occurred within
the previously specified TTL.
- `persistState` (optional)<br />

**Type**: `boolean`<br />

**Default**: `false`<br />

Whether to dump the current Nuxt state to sessionStorage (as `nuxt:reload:state`). By default this will have no
effect on reload unless `experimental.restoreState` is also set, or unless you handle restoring the state yourself.



---

- Source

# updateAppConfig

> Update the App Config at runtime.

<note>

Updates the [`app.config`](/docs/4.x/directory-structure/app/app-config) using deep assignment. Existing (nested) properties will be preserved.

</note>

## Usage

```js
import { updateAppConfig, useAppConfig } from '#imports'

const appConfig = useAppConfig() // { foo: 'bar' }

const newAppConfig = { foo: 'baz' }
updateAppConfig(newAppConfig)

console.log(appConfig) // { foo: 'baz' }
```

<read-more to="/docs/4.x/directory-structure/app/app-config">



</read-more>



---

- Source

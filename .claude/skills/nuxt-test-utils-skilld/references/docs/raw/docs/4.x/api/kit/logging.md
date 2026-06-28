# Logging

> Nuxt Kit provides a set of utilities to help you work with logging. These functions allow you to log messages with extra features.

Nuxt provides a logger instance that you can use to log messages with extra features. `useLogger` allows you to get a logger instance.

## `useLogger`

Returns a logger instance. It uses consola under the hood.

### Usage

```tstwoslash
import { defineNuxtModule, useLogger } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const logger = useLogger('my-module')

    logger.info('Hello from my module!')
  },
})
```

### Type

```ts
function useLogger (tag?: string, options?: Partial<ConsolaOptions>): ConsolaInstance
```

### Parameters

**tag**: A tag to suffix all log messages with, displayed on the right near the timestamp.

**options**: Consola configuration options.

### Examples

```tstwoslash
import { defineNuxtModule, useLogger } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const logger = useLogger('my-module', { level: options.quiet ? 0 : 3 })

    logger.info('Hello from my module!')
  },
})
```



---

- Source

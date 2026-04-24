---
number: 48
title: "request: schema support"
type: other
state: open
created: 2022-11-07
url: "https://github.com/unjs/defu/issues/48"
reactions: 0
comments: 2
---

# request: schema support

By default, giving a schema,
If the incoming new data is the same key, append the new data to the values of the schema keys.
delete keys that are not compatible with the schema.

Example

```ts

const schema = {
    isPro: false,
    darkMode: false,
    pages: {
        home: false,
        settings: false,
    },
}

const result = defu(schema, { isPro: 'bbb', d: 'c', pages: { home: true } }, {schema: true})

console.log(result) // {isPro: 'bbb', darkMode: false, pages: { home: true, settings: false } }
```
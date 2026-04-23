---
number: 128
title: Warn if property with the same value is overridden
type: other
state: open
created: 2024-04-17
url: "https://github.com/unjs/defu/issues/128"
reactions: 3
comments: 0
---

# Warn if property with the same value is overridden

### Describe the feature

In a large project, it is difficult to track/manage when developers specify properties with a value that already exists in the default object. It would be nice to add a warning option if redundant duplication occurs:
```ts
const defuFn = createDefu({ 
  warnDuplicates: true
})
```
On the other hand, I guess it's better not to cause side effects, maybe a callback?
```ts
const defuFn = createDefu({ 
  onDuplicate: (object, key, value) => {}
})
```



### Additional information

- [X] Would you be willing to help implement this feature?
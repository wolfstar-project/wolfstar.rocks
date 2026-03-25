---
number: 3405
title: type errors on slots with vue-tsc 2.2.4
type: bug
state: closed
created: 2025-02-26
url: "https://github.com/nuxt/ui/issues/3405"
reactions: 11
comments: 51
labels: "[bug, v3, upstream]"
---

# type errors on slots with vue-tsc 2.2.4

### Environment

- node: 22
- nuxt: 3.15.4

### Is this bug related to Nuxt or Vue?

Nuxt

### Version

v3.0.0-alpha.13

### Reproduction

not required

### Description

run "npx nuxi typecheck"

```
 Argument of type '{ item: T; index: number; }' is not assignable to parameter of type '({ leading: SlotProps<T>; default: SlotProps<T>; trailing: SlotProps<T>; content: SlotProps<T>; } & Record<string, SlotProps<T>> & (T["slot"] extends string ? Record<...> : Record<...>))[string] & SlotProps<...> extends (props: infer P) => any ? P : {}'.

137         <slot :name="item.slot || 'content'" :item="item" :index="index">
```



### Additional context

_No response_

### Logs

```shell-script

```

---

## Top Comments

**@benjamincanac** [maintainer] (+4):

Indeed, we still have to look into this. I'd recommend setting the resolution to `vue-tsc@2.2.0` or `vue-tsc@2.2.2` for now.

**@benjamincanac** [maintainer] (+1):

Yeah I also tried `3.0.0-alpha.0` without success, we'll have to wait for a proper `3.0.0` release I guess  

**@benjamincanac** [maintainer]:

I've fixed the `LinkBase` issue with `nuxt@3.16` already in https://github.com/nuxt/ui/commit/6120a15a998b88a3c2bbed4d88e1e935496d58b8.

I also encountered some issues with `#imports` when using `pkg.pr.new` which I managed to solve by adding a `"unimport": "3.14.5"` resolution but this was before 3.16 so not sure about this.
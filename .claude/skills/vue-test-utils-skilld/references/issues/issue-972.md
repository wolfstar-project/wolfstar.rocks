---
number: 972
title: Better types for `wrapper.vm` when the component is closed
type: other
state: open
created: 2021-09-24
url: "https://github.com/vuejs/test-utils/issues/972"
reactions: 16
comments: 19
labels: "[upstream]"
---

# Better types for `wrapper.vm` when the component is closed

Since `2.0.0-rc.15`, we are now exposing `$.proxy` as `wrapper.vm` to simplify testing of `script setup` component,
allowing to test the following component:

```vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>
```

with `expect(wrapper.vm.count).toBe(0)`, even if `count` is not exposed by the component (see PR #931 ).

This works, but for TS (`vue-tsc`), `wrapper.vm` does not have a `count` property, because `wrapper.vm` is typed as `ComponentPublicInstance`.

Ideally, we would like `wrapper.vm` type to reflect that it is actually not the component public instance, but the properties exposed to the template. Is there a way to infer that?

To reproduce, remove `"exclude": ["tests/expose.spec.ts"]` from `tsconfig.volar.json`, and run `yarn vue-tsc`. It fails with:

```
tests/expose.spec.ts:38:23 - error TS2339: Property 'count' does not exist on type '{ $: ComponentInternalInstance; $data: {}; $props: Partial<{}> & Omit<Readonly<{} & {} & {}> & VNodeProps & AllowedComponentProps & ComponentCustomProps, never>; ... 10 more ...; $watch(source: string | Function, cb: Function, options?: WatchOptions<...> | undefined): WatchStopHandle; } & ... 4 more ... & ComponentC...'.

38     expect(wrapper.vm.count).toBe(1)
```

For readers interested in this issue, you can workaround it with an explicit cast:
`expect((wrapper.vm as unknown as { count: number }).count).toBe(1)`

---

## Top Comments

**@cexbrayat** [maintainer]:

@pikax do you have an idea how we could solve that?

**@pikax** [maintainer]:

Currently that's not possible, I'm working on this PR https://github.com/vuejs/vue-next/pull/4465 to improve some types, I can have a look on how to also add that info there

**@cexbrayat** [maintainer]:

For anyone keeping up with this, @johnsoncodehk released vue-tsc@0.30.0 with a new option that improves the situation. See #1170 
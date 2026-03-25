---
number: 3973
title: Getting error then importing type InputProps after update to v3.1
type: bug
state: closed
created: 2025-04-24
url: "https://github.com/nuxt/ui/issues/3973"
reactions: 16
comments: 35
resolvedIn: 5.8.3
labels: "[bug, v3, upstream]"
---

# Getting error then importing type InputProps after update to v3.1

### Environment

- Operating System: Windows_NT
- Node Version:     v22.12.0
- Nuxt Version:     3.16.2
- CLI Version:      3.25.0
- Nitro Version:    2.11.9
- Package Manager:  bun@1.2.8
- Builder:          -
- User Config:      modules, devtools, app, css, runtimeConfig, build, future, experimental, compatibilityDate, telemetry, eslint
- Runtime Modules:  @nuxt/eslint@1.3.0, @nuxt/fonts@0.11.1, @nuxt/icon@1.12.0, @nuxt/image@1.10.0, @nuxt/ui@3.1.0, @nuxt/scripts@0.11.6, @pinia/colada-nuxt@0.1.2, @pinia/nuxt@0.11.0, @vueuse/nuxt@13.1.0
- Build Modules:    -

### Is this bug related to Nuxt or Vue?

Nuxt

### Version

v3.1

### Reproduction

https://codesandbox.io/p/devbox/stoic-mopsa-t44pzq

```vue

<script setup lang="ts">
import type { InputProps, InputEmits } from '@nuxt/ui'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

const props = defineProps<Omit<InputProps, 'type'>>()
const emit = defineEmits<InputEmits>()
const model = defineModel<string>()
const show = defineModel<boolean>('show', { default: false })
</script>

<template>
  <UInput
    v-bind="props"
    v-model="model"
    :type="show ? 'text' : 'password'"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  >
    <template #trailing>
      <button
        type="button"
        :aria-label="show ? 'Спрятать Текст' : 'Показать текст'"
        :aria-pressed="show"
        @click="show = !show"
      >
        <EyeOffIcon
          v-if="show"
          :size="20"
        />
        <EyeIcon
          v-else
          :size="20"
        />
      </button>
    </template>
  </UInput>
</template>

```

### Description

It was working as intended before update.

### Additional context

_No response_

### Logs

...

---

## Top Comments

**@zAlweNy26** (+7):

Same thing, but for `ButtonProps`

**@albertcito** (+4):

Same here with FormField type:

```
ERROR  Internal server error: [@vue/compiler-sfc] Unresolvable type reference or unsupported built-in utility type                                                            9:22:15 AM

/nuxt-monorepo/packages/ui/components/form/group/index.vue
5  |  import appConfig from 'ui/util/appConfig';
6  |  
7  |  export type FormGroupProps = FormFieldProps & UiProps & {
   |                               ^^^^^^^^^^^^^^
8  |    disabled?: boolean,
9  |    readonly?: boolean,

ERROR  Pre-transform error: [@vue/compiler-sfc] Unresolvable type reference or unsupported built-in utility type                                                              9:22:15 AM

...

**@hanneskuettner** (+4):

Looks like it might have something to do with the switch of `@nuxt/module-builder` to `1.0.0`. This is a very similar sounding issue in their repo https://github.com/nuxt/module-builder/issues/597
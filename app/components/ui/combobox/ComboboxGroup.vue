<template>
  <ComboboxGroup data-slot="combobox-group" v-bind="delegatedProps" :class="cn('text-foreground overflow-hidden p-1', props.class)">
    <ComboboxLabel v-if="heading" class="text-muted-foreground px-2 py-1.5 text-xs font-medium">
      {{ heading }}
    </ComboboxLabel>
    <slot></slot>
  </ComboboxGroup>
</template>

<script setup lang="ts">
import type { ComboboxGroupProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { ComboboxGroup, ComboboxLabel } from 'reka-ui'
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<
  ComboboxGroupProps & {
    class?: HTMLAttributes['class']
    heading?: string
  }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <ComboboxTrigger data-slot="combobox-trigger" v-bind="forwarded" :class="cn('', props.class)" tabindex="0">
    <slot></slot>
  </ComboboxTrigger>
</template>

<script setup lang="ts">
import type { ComboboxTriggerProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils/cn'
import { ComboboxTrigger, useForwardProps } from 'reka-ui'
import { computed } from 'vue'

const props = defineProps<ComboboxTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwarded = useForwardProps(delegatedProps)
</script>
